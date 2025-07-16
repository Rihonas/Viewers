const expandedInsideBorderSize = 0;
const collapsedInsideBorderSize = 4;
const collapsedOutsideBorderSize = 4;
const collapsedWidth = 25;
const collapsedHeight = 25;

const rightPanelInitialExpandedWidth = 280;
const leftPanelInitialExpandedWidth = 282;
const bottomPanelInitialExpandedHeight = 200;

const panelGroupDefinition = {
  // 垂直グループ（メインの分割グループ）
  verticalGroup: {
    groupId: 'viewerLayoutVerticalResizablePanelGroup',
    shared: {
      expandedInsideBorderSize,
      collapsedInsideBorderSize,
      collapsedOutsideBorderSize,
      collapsedHeight,
    },
    bottom: {
      panelId: 'viewerLayoutResizableBottomPanel',
      initialExpandedHeight: bottomPanelInitialExpandedHeight,
      minimumExpandedOffsetHeight: 100 + expandedInsideBorderSize,
      initialExpandedOffsetHeight: bottomPanelInitialExpandedHeight + expandedInsideBorderSize,
      collapsedOffsetHeight:
        collapsedHeight + collapsedInsideBorderSize + collapsedOutsideBorderSize,
    },
  },
  // 水平グループ（左パネル + ViewPort + 右パネル）
  horizontalGroup: {
    groupId: 'viewerLayoutHorizontalResizablePanelGroup',
    shared: {
      expandedInsideBorderSize,
      collapsedInsideBorderSize,
      collapsedOutsideBorderSize,
      collapsedWidth,
    },
    left: {
      panelId: 'viewerLayoutResizableLeftPanel',
      initialExpandedWidth: leftPanelInitialExpandedWidth,
      minimumExpandedOffsetWidth: 145 + expandedInsideBorderSize,
      initialExpandedOffsetWidth: leftPanelInitialExpandedWidth + expandedInsideBorderSize,
      collapsedOffsetWidth: collapsedWidth + collapsedInsideBorderSize + collapsedOutsideBorderSize,
    },
    right: {
      panelId: 'viewerLayoutResizableRightPanel',
      initialExpandedWidth: rightPanelInitialExpandedWidth,
      minimumExpandedOffsetWidth: rightPanelInitialExpandedWidth + expandedInsideBorderSize,
      initialExpandedOffsetWidth: rightPanelInitialExpandedWidth + expandedInsideBorderSize,
      collapsedOffsetWidth: collapsedWidth + collapsedInsideBorderSize + collapsedOutsideBorderSize,
    },
  },
};

export { panelGroupDefinition };
