import React, { useEffect, useState, useCallback } from 'react';
import { BottomPanel } from './BottomPanel/BottomPanel';
import { Types } from '@ohif/core';

export type BottomPanelWithServicesProps = {
  servicesManager?: any;
  className?: string;
  activeTabIndex: number;
  tabs?: Array<{
    name: string;
    label: string;
    iconName: string;
    disabled?: boolean;
    content: React.ComponentType;
  }>;
  expandedHeight?: number;
  collapsedHeight?: number;
  onClose: () => void;
  onOpen: () => void;
  isExpanded: boolean;
  expandedInsideBorderSize?: number;
  collapsedInsideBorderSize?: number;
  collapsedOutsideBorderSize?: number;
};

const BottomPanelWithServices = ({
  servicesManager,
  activeTabIndex: activeTabIndexProp,
  isExpanded,
  tabs: tabsProp,
  onOpen,
  onClose,
  ...props
}: BottomPanelWithServicesProps) => {
  const panelService = servicesManager?.services?.panelService;

  const [bottomPanelExpanded, setBottomPanelExpanded] = useState(isExpanded);
  const [activeTabIndex, setActiveTabIndex] = useState(activeTabIndexProp ?? 0);
  const [closedManually, setClosedManually] = useState(false);
  const [tabs, setTabs] = useState(tabsProp ?? panelService?.getPanels('bottom') ?? []);

  const handleActiveTabIndexChange = useCallback(({ activeTabIndex }) => {
    setActiveTabIndex(activeTabIndex);
  }, []);

  const handleOpen = useCallback(() => {
    setBottomPanelExpanded(true);
    setClosedManually(false);
    onOpen?.();
  }, [onOpen]);

  const handleClose = useCallback(() => {
    setBottomPanelExpanded(false);
    setClosedManually(true);
    onClose?.();
  }, [onClose]);

  // Default demo tabs if none provided and panelService is not available
  const defaultTabs = [
    {
      name: 'measurements',
      label: 'Measurements',
      iconName: 'MeasurementTools',
      content: () => (
        <div className="p-4 text-white">
          <h3 className="mb-2 text-lg font-semibold">Measurements Panel</h3>
          <p>This is a demo measurements panel.</p>
        </div>
      ),
    },
    {
      name: 'segmentation',
      label: 'Segmentation',
      iconName: 'SegmentationTools',
      content: () => (
        <div className="p-4 text-white">
          <h3 className="mb-2 text-lg font-semibold">Segmentation Panel</h3>
          <p>This is a demo segmentation panel.</p>
        </div>
      ),
    },
    {
      name: 'tools',
      label: 'Tools',
      iconName: 'ToolSettings',
      content: () => (
        <div className="p-4 text-white">
          <h3 className="mb-2 text-lg font-semibold">Tools Panel</h3>
          <p>This is a demo tools panel.</p>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setBottomPanelExpanded(isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    setActiveTabIndex(activeTabIndexProp ?? 0);
  }, [activeTabIndexProp]);

  // Subscribe to panel service changes
  useEffect(() => {
    if (!panelService) {
      console.log('BottomPanel: No panelService available, using default tabs');
      setTabs(defaultTabs);
      return;
    }

    // Initial panel load
    const bottomPanels = panelService.getPanels('bottom');
    console.log('BottomPanel: Initial panels from panelService:', bottomPanels);
    setTabs(bottomPanels);

    const { unsubscribe } = panelService.subscribe(
      panelService.EVENTS.PANELS_CHANGED,
      panelChangedEvent => {
        console.log('BottomPanel: Panel changed event:', panelChangedEvent);
        if (panelChangedEvent.position !== 'bottom') {
          return;
        }

        const updatedPanels = panelService.getPanels('bottom');
        console.log('BottomPanel: Updated panels:', updatedPanels);
        setTabs(updatedPanels);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [panelService]);

  // Subscribe to panel activation events
  useEffect(() => {
    if (!panelService) {
      return;
    }

    const activatePanelSubscription = panelService.subscribe(
      panelService.EVENTS.ACTIVATE_PANEL,
      (activatePanelEvent: Types.ActivatePanelEvent) => {
        if (bottomPanelExpanded || activatePanelEvent.forceActive) {
          const tabIndex = tabs.findIndex(tab => tab.id === activatePanelEvent.panelId);
          if (tabIndex !== -1) {
            if (!closedManually) {
              setBottomPanelExpanded(true);
            }
            setActiveTabIndex(tabIndex);
          }
        }
      }
    );

    return () => {
      activatePanelSubscription.unsubscribe();
    };
  }, [tabs, bottomPanelExpanded, panelService, closedManually]);

  const finalTabs = tabs.length > 0 ? tabs : defaultTabs;

  return (
    <BottomPanel
      className={props.className || ''}
      tabs={finalTabs as any}
      activeTabIndex={activeTabIndex}
      isExpanded={bottomPanelExpanded}
      onOpen={handleOpen}
      onClose={handleClose}
      onActiveTabIndexChange={handleActiveTabIndexChange}
      expandedHeight={props.expandedHeight}
      collapsedHeight={props.collapsedHeight}
      expandedInsideBorderSize={props.expandedInsideBorderSize}
      collapsedInsideBorderSize={props.collapsedInsideBorderSize}
      collapsedOutsideBorderSize={props.collapsedOutsideBorderSize}
    />
  );
};

export default BottomPanelWithServices;
