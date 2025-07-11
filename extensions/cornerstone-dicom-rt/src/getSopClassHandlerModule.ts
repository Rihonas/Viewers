import { utils, Types as OhifTypes } from '@ohif/core';
import i18n from '@ohif/i18n';

import { SOPClassHandlerId } from './id';
import loadRTStruct from './loadRTStruct';

const sopClassUids = ['1.2.840.10008.5.1.4.1.1.481.3'];

const loadPromises = {};

function _getDisplaySetsFromSeries(
  instances,
  servicesManager: AppTypes.ServicesManager,
  extensionManager
) {
  const instance = instances[0];

  const {
    StudyInstanceUID,
    SeriesInstanceUID,
    SOPInstanceUID,
    SeriesDescription,
    SeriesNumber,
    SeriesDate,
    SOPClassUID,
    wadoRoot,
    wadoUri,
    wadoUriRoot,
  } = instance;

  const displaySet = {
    Modality: 'RTSTRUCT',
    loading: false,
    isReconstructable: false,
    displaySetInstanceUID: utils.guid(),
    SeriesDescription,
    SeriesNumber,
    SeriesDate,
    SOPInstanceUID,
    SeriesInstanceUID,
    StudyInstanceUID,
    SOPClassHandlerId,
    SOPClassUID,
    referencedImages: null,
    referencedSeriesInstanceUID: null,
    referencedDisplaySetInstanceUID: null,
    isDerivedDisplaySet: true,
    isLoaded: false,
    isHydrated: false,
    structureSet: null,
    sopClassUids,
    instance,
    wadoRoot,
    wadoUriRoot,
    wadoUri,
    isOverlayDisplaySet: true,
    label: SeriesDescription || `${i18n.t('Series')} ${SeriesNumber} - ${i18n.t('RTSTRUCT')}`,
  };

  let referencedSeriesSequence = instance.ReferencedSeriesSequence;
  if (instance.ReferencedFrameOfReferenceSequence && !instance.ReferencedSeriesSequence) {
    instance.ReferencedSeriesSequence = _deriveReferencedSeriesSequenceFromFrameOfReferenceSequence(
      instance.ReferencedFrameOfReferenceSequence
    );
    referencedSeriesSequence = instance.ReferencedSeriesSequence;
  }

  if (!referencedSeriesSequence) {
    throw new Error('ReferencedSeriesSequence is missing for the RTSTRUCT');
  }

  const referencedSeries = referencedSeriesSequence[0];

  displaySet.referencedImages = instance.ReferencedSeriesSequence.ReferencedInstanceSequence;
  displaySet.referencedSeriesInstanceUID = referencedSeries.SeriesInstanceUID;

  const { displaySetService } = servicesManager.services;
  const referencedDisplaySets = displaySetService.getDisplaySetsForSeries(
    displaySet.referencedSeriesInstanceUID
  );

  if (!referencedDisplaySets || referencedDisplaySets.length === 0) {
    // Instead of throwing error, subscribe to display sets added
    const { unsubscribe } = displaySetService.subscribe(
      displaySetService.EVENTS.DISPLAY_SETS_ADDED,
      ({ displaySetsAdded }) => {
        const addedDisplaySet = displaySetsAdded[0];
        if (addedDisplaySet.SeriesInstanceUID === displaySet.referencedSeriesInstanceUID) {
          displaySet.referencedDisplaySetInstanceUID = addedDisplaySet.displaySetInstanceUID;
          displaySet.isReconstructable = addedDisplaySet.isReconstructable;
          unsubscribe();
        }
      }
    );
  } else {
    const referencedDisplaySet = referencedDisplaySets[0];
    displaySet.referencedDisplaySetInstanceUID = referencedDisplaySet.displaySetInstanceUID;
    displaySet.isReconstructable = referencedDisplaySet.isReconstructable;
  }

  displaySet.load = ({ headers, createSegmentation = true }) =>
    _load(displaySet, servicesManager, extensionManager, headers, createSegmentation);

  return [displaySet];
}

function _load(
  rtDisplaySet,
  servicesManager: AppTypes.ServicesManager,
  extensionManager,
  headers,
  createSegmentation = true
) {
  const { SOPInstanceUID } = rtDisplaySet;
  const { segmentationService } = servicesManager.services;
  if (
    (rtDisplaySet.loading || rtDisplaySet.isLoaded) &&
    loadPromises[SOPInstanceUID] &&
    _segmentationExistsInCache(rtDisplaySet, segmentationService)
  ) {
    return loadPromises[SOPInstanceUID];
  }

  rtDisplaySet.loading = true;

  // We don't want to fire multiple loads, so we'll wait for the first to finish
  // and also return the same promise to any other callers.
  loadPromises[SOPInstanceUID] = new Promise(async (resolve, reject) => {
    if (!rtDisplaySet.structureSet) {
      const structureSet = await loadRTStruct(extensionManager, rtDisplaySet, headers);

      rtDisplaySet.structureSet = structureSet;
    }

    if (createSegmentation) {
      segmentationService
        .createSegmentationForRTDisplaySet(rtDisplaySet)
        .then(() => {
          rtDisplaySet.loading = false;
          resolve();
        })
        .catch(error => {
          rtDisplaySet.loading = false;
          reject(error);
        });
    } else {
      rtDisplaySet.loading = false;
      resolve();
    }
  });

  return loadPromises[SOPInstanceUID];
}

function _deriveReferencedSeriesSequenceFromFrameOfReferenceSequence(
  ReferencedFrameOfReferenceSequence
) {
  const ReferencedSeriesSequence = [];

  ReferencedFrameOfReferenceSequence.forEach(referencedFrameOfReference => {
    const { RTReferencedStudySequence } = referencedFrameOfReference;

    RTReferencedStudySequence.forEach(rtReferencedStudy => {
      const { RTReferencedSeriesSequence } = rtReferencedStudy;

      RTReferencedSeriesSequence.forEach(rtReferencedSeries => {
        const ReferencedInstanceSequence = [];
        const { ContourImageSequence, SeriesInstanceUID } = rtReferencedSeries;

        ContourImageSequence.forEach(contourImage => {
          ReferencedInstanceSequence.push({
            ReferencedSOPInstanceUID: contourImage.ReferencedSOPInstanceUID,
            ReferencedSOPClassUID: contourImage.ReferencedSOPClassUID,
          });
        });

        const referencedSeries = {
          SeriesInstanceUID,
          ReferencedInstanceSequence,
        };

        ReferencedSeriesSequence.push(referencedSeries);
      });
    });
  });

  return ReferencedSeriesSequence;
}

function _segmentationExistsInCache() {
  // Todo: fix this
  return false;
}

function getSopClassHandlerModule(params: OhifTypes.Extensions.ExtensionParams) {
  const { servicesManager, extensionManager } = params;

  return [
    {
      name: 'dicom-rt',
      sopClassUids,
      getDisplaySetsFromSeries: instances => {
        return _getDisplaySetsFromSeries(instances, servicesManager, extensionManager);
      },
    },
  ];
}

export default getSopClassHandlerModule;
