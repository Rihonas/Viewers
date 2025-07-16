import React, { useEffect, useState, useCallback } from 'react';
import { BottomPanel } from './BottomPanel/BottomPanel';
import { Types } from '@ohif/core';
import { panelGroupDefinition } from '../ViewerLayout/constants/panels';

export type BottomPanelWithServicesProps = {
  servicesManager: AppTypes.ServicesManager;
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
  const side = 'bottom';

  // Tracks whether this BottomPanel has been opened at least once since this BottomPanel was inserted into the DOM.
  // Thus going to the Study List page and back to the viewer resets this flag for a BottomPanel.
  const [bottomPanelExpanded, setBottomPanelExpanded] = useState(isExpanded);
  const [activeTabIndex, setActiveTabIndex] = useState(activeTabIndexProp ?? 0);
  const [closedManually, setClosedManually] = useState(false);
  const [tabs, setTabs] = useState(tabsProp ?? (panelService.getPanels(side) as any));

  const handleActiveTabIndexChange = useCallback(({ activeTabIndex }) => {
    setActiveTabIndex(activeTabIndex);
  }, []);

  const handleOpen = useCallback(() => {
    setBottomPanelExpanded(true);
    onOpen?.();
  }, [onOpen]);

  const handleClose = useCallback(() => {
    setBottomPanelExpanded(false);
    setClosedManually(true);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    setBottomPanelExpanded(isExpanded);
  }, [isExpanded]);

  /** update the active tab index from outside */
  useEffect(() => {
    setActiveTabIndex(activeTabIndexProp ?? 0);
  }, [activeTabIndexProp]);

  useEffect(() => {
    const { unsubscribe } = panelService.subscribe(
      panelService.EVENTS.PANELS_CHANGED,
      (panelChangedEvent: any) => {
        if ((panelChangedEvent as any).position !== side) {
          return;
        }

        setTabs(panelService.getPanels(side as any) as any);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [panelService, side]);

  useEffect(() => {
    const activatePanelSubscription = panelService.subscribe(
      panelService.EVENTS.ACTIVATE_PANEL,
      (activatePanelEvent: Types.ActivatePanelEvent) => {
        if (bottomPanelExpanded || activatePanelEvent.forceActive) {
          const tabIndex = tabs.findIndex((tab: any) => tab.id === activatePanelEvent.panelId);
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

  return (
    <BottomPanel
      className={props.className || ''}
      tabs={tabs as any}
      activeTabIndex={activeTabIndex}
      isExpanded={bottomPanelExpanded}
      onOpen={handleOpen}
      onClose={handleClose}
      onActiveTabIndexChange={handleActiveTabIndexChange}
      expandedHeight={props.expandedHeight}
      collapsedHeight={
        props.collapsedHeight ?? panelGroupDefinition.verticalGroup.bottom.collapsedOffsetHeight
      }
      expandedInsideBorderSize={props.expandedInsideBorderSize}
      collapsedInsideBorderSize={props.collapsedInsideBorderSize}
      collapsedOutsideBorderSize={props.collapsedOutsideBorderSize}
    />
  );
};

export default BottomPanelWithServices;
