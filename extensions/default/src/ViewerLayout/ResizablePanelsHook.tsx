import { useState, useCallback, useLayoutEffect, useRef } from 'react';
import { getPanelElement, getPanelGroupElement } from 'react-resizable-panels';
import { panelGroupDefinition } from './constants/panels';

/**
 * Set the minimum and maximum css style width attributes for the given element.
 * The two style attributes are cleared whenever the width
 * argument is undefined.
 * <p>
 * This utility is used as part of a HACK throughout the ViewerLayout component as
 * the means of restricting the side panel widths during the resizing of the
 * browser window. In general, the widths are always set unless the resize
 * handle for either side panel is being dragged (i.e. a side panel is being resized).
 *
 * @param elem the element
 * @param width the max and min width to set on the element
 */
const setMinMaxWidth = (elem, width?) => {
  if (!elem) {
    return;
  }

  elem.style.minWidth = width === undefined ? '' : `${width}px`;
  elem.style.maxWidth = elem.style.minWidth;
};

/**
 * Set the minimum and maximum css style height attributes for the given element.
 */
const setMinMaxHeight = (elem, height?) => {
  if (!elem) {
    return;
  }

  elem.style.minHeight = height === undefined ? '' : `${height}px`;
  elem.style.maxHeight = elem.style.minHeight;
};

const useResizablePanels = (
  leftPanelClosed,
  setLeftPanelClosed,
  rightPanelClosed,
  setRightPanelClosed,
  bottomPanelClosed,
  setBottomPanelClosed,
  hasLeftPanels,
  hasRightPanels,
  hasBottomPanels
) => {
  // 水平グループ（左右パネル）のstate
  const [leftPanelExpandedWidth, setLeftPanelExpandedWidth] = useState(
    panelGroupDefinition.horizontalGroup.left.initialExpandedWidth
  );
  const [rightPanelExpandedWidth, setRightPanelExpandedWidth] = useState(
    panelGroupDefinition.horizontalGroup.right.initialExpandedWidth
  );
  const [leftResizablePanelMinimumSize, setLeftResizablePanelMinimumSize] = useState(0);
  const [rightResizablePanelMinimumSize, setRightResizablePanelMinimumSize] = useState(0);
  const [leftResizablePanelCollapsedSize, setLeftResizePanelCollapsedSize] = useState(0);
  const [rightResizePanelCollapsedSize, setRightResizePanelCollapsedSize] = useState(0);

  // 垂直グループ（ボトムパネル）のstate
  const [bottomPanelExpandedHeight, setBottomPanelExpandedHeight] = useState(
    panelGroupDefinition.verticalGroup.bottom.initialExpandedHeight
  );
  const [bottomResizablePanelMinimumSize, setBottomResizablePanelMinimumSize] = useState(0);
  const [bottomResizablePanelCollapsedSize, setBottomResizablePanelCollapsedSize] = useState(0);

  // 水平グループのrefs
  const resizableHorizontalPanelGroupElemRef = useRef(null);
  const resizableLeftPanelElemRef = useRef(null);
  const resizableRightPanelElemRef = useRef(null);
  const resizableLeftPanelAPIRef = useRef(null);
  const resizableRightPanelAPIRef = useRef(null);
  const isHorizontalResizableHandleDraggingRef = useRef(false);

  // 垂直グループのrefs
  const resizableVerticalPanelGroupElemRef = useRef(null);
  const resizableBottomPanelElemRef = useRef(null);
  const resizableBottomPanelAPIRef = useRef(null);
  const isVerticalResizableHandleDraggingRef = useRef(false);

  // The total width of horizontal handles and height of vertical handles.
  const resizableHorizontalHandlesWidth = useRef(null);
  const resizableVerticalHandlesHeight = useRef(null);

  // 水平グループの初期化
  useLayoutEffect(() => {
    const horizontalPanelGroupElem = getPanelGroupElement(
      panelGroupDefinition.horizontalGroup.groupId
    );
    resizableHorizontalPanelGroupElemRef.current = horizontalPanelGroupElem;

    const leftPanelElem = getPanelElement(panelGroupDefinition.horizontalGroup.left.panelId);
    resizableLeftPanelElemRef.current = leftPanelElem;

    const rightPanelElem = getPanelElement(panelGroupDefinition.horizontalGroup.right.panelId);
    resizableRightPanelElemRef.current = rightPanelElem;

    // Calculate horizontal handles width
    const horizontalResizeHandles = document.querySelectorAll(
      '[data-panel-resize-handle-id*="horizontal"]'
    );
    resizableHorizontalHandlesWidth.current = 0;
    horizontalResizeHandles.forEach(resizeHandle => {
      resizableHorizontalHandlesWidth.current += (resizeHandle as HTMLElement).offsetWidth;
    });

    if (!leftPanelClosed) {
      const leftResizablePanelExpandedSize = getHorizontalPercentageSize(
        panelGroupDefinition.horizontalGroup.left.initialExpandedOffsetWidth
      );
      resizableLeftPanelAPIRef?.current?.expand(leftResizablePanelExpandedSize);
      setMinMaxWidth(
        leftPanelElem,
        panelGroupDefinition.horizontalGroup.left.initialExpandedOffsetWidth
      );
    }

    if (!rightPanelClosed) {
      const rightResizablePanelExpandedSize = getHorizontalPercentageSize(
        panelGroupDefinition.horizontalGroup.right.initialExpandedOffsetWidth
      );
      resizableRightPanelAPIRef?.current?.expand(rightResizablePanelExpandedSize);
      setMinMaxWidth(
        rightPanelElem,
        panelGroupDefinition.horizontalGroup.right.initialExpandedOffsetWidth
      );
    }
  }, []);

  // 垂直グループの初期化
  useLayoutEffect(() => {
    const verticalPanelGroupElem = getPanelGroupElement(panelGroupDefinition.verticalGroup.groupId);
    resizableVerticalPanelGroupElemRef.current = verticalPanelGroupElem;

    const bottomPanelElem = getPanelElement(panelGroupDefinition.verticalGroup.bottom.panelId);
    resizableBottomPanelElemRef.current = bottomPanelElem;

    // Calculate vertical handles height
    const verticalResizeHandles = document.querySelectorAll(
      '[data-panel-resize-handle-id*="vertical"]'
    );
    resizableVerticalHandlesHeight.current = 0;
    verticalResizeHandles.forEach(resizeHandle => {
      resizableVerticalHandlesHeight.current += (resizeHandle as HTMLElement).offsetHeight;
    });

    if (!bottomPanelClosed) {
      const bottomResizablePanelExpandedSize = getVerticalPercentageSize(
        panelGroupDefinition.verticalGroup.bottom.initialExpandedOffsetHeight
      );
      resizableBottomPanelAPIRef?.current?.expand(bottomResizablePanelExpandedSize);
      setMinMaxHeight(
        bottomPanelElem,
        panelGroupDefinition.verticalGroup.bottom.initialExpandedOffsetHeight
      );
    }
  }, []);

  // 水平グループのResizeObserver
  useLayoutEffect(() => {
    if (!resizableHorizontalPanelGroupElemRef.current) {
      return;
    }

    if (!resizableLeftPanelAPIRef.current?.isCollapsed()) {
      const leftSize = getHorizontalPercentageSize(
        leftPanelExpandedWidth +
          panelGroupDefinition.horizontalGroup.shared.expandedInsideBorderSize
      );
      resizableLeftPanelAPIRef.current?.resize(leftSize);
    }

    if (!resizableRightPanelAPIRef?.current?.isCollapsed()) {
      const rightSize = getHorizontalPercentageSize(
        rightPanelExpandedWidth +
          panelGroupDefinition.horizontalGroup.shared.expandedInsideBorderSize
      );
      resizableRightPanelAPIRef?.current?.resize(rightSize);
    }

    const observer = new ResizeObserver(() => {
      const minimumLeftSize = getHorizontalPercentageSize(
        panelGroupDefinition.horizontalGroup.left.minimumExpandedOffsetWidth
      );
      const minimumRightSize = getHorizontalPercentageSize(
        panelGroupDefinition.horizontalGroup.right.minimumExpandedOffsetWidth
      );

      setLeftResizablePanelMinimumSize(minimumLeftSize);
      setRightResizablePanelMinimumSize(minimumRightSize);
      setLeftResizePanelCollapsedSize(
        getHorizontalPercentageSize(panelGroupDefinition.horizontalGroup.left.collapsedOffsetWidth)
      );
      setRightResizePanelCollapsedSize(
        getHorizontalPercentageSize(panelGroupDefinition.horizontalGroup.right.collapsedOffsetWidth)
      );
    });

    observer.observe(resizableHorizontalPanelGroupElemRef.current);

    return () => {
      observer.disconnect();
    };
  }, [
    leftPanelExpandedWidth,
    rightPanelExpandedWidth,
    leftResizablePanelMinimumSize,
    rightResizablePanelMinimumSize,
    hasLeftPanels,
    hasRightPanels,
  ]);

  // 垂直グループのResizeObserver
  useLayoutEffect(() => {
    if (!resizableVerticalPanelGroupElemRef.current) {
      return;
    }

    if (!resizableBottomPanelAPIRef?.current?.isCollapsed()) {
      const bottomSize = getVerticalPercentageSize(
        bottomPanelExpandedHeight +
          panelGroupDefinition.verticalGroup.shared.expandedInsideBorderSize
      );
      resizableBottomPanelAPIRef?.current?.resize(bottomSize);
    }

    const observer = new ResizeObserver(() => {
      const minimumBottomSize = getVerticalPercentageSize(
        panelGroupDefinition.verticalGroup.bottom.minimumExpandedOffsetHeight
      );

      setBottomResizablePanelMinimumSize(minimumBottomSize);
      setBottomResizablePanelCollapsedSize(
        getVerticalPercentageSize(panelGroupDefinition.verticalGroup.bottom.collapsedOffsetHeight)
      );
    });

    observer.observe(resizableVerticalPanelGroupElemRef.current);

    return () => {
      observer.disconnect();
    };
  }, [bottomPanelExpandedHeight, bottomResizablePanelMinimumSize, hasBottomPanels]);

  /**
   * Handles dragging of horizontal resize handles (left/right panels).
   */
  const onHorizontalHandleDragging = useCallback(
    isStartDrag => {
      if (isStartDrag) {
        isHorizontalResizableHandleDraggingRef.current = true;
        setMinMaxWidth(resizableLeftPanelElemRef.current);
        setMinMaxWidth(resizableRightPanelElemRef.current);
      } else {
        isHorizontalResizableHandleDraggingRef.current = false;

        if (resizableLeftPanelAPIRef?.current?.isExpanded()) {
          setMinMaxWidth(
            resizableLeftPanelElemRef.current,
            leftPanelExpandedWidth +
              panelGroupDefinition.horizontalGroup.shared.expandedInsideBorderSize
          );
        }

        if (resizableRightPanelAPIRef?.current?.isExpanded()) {
          setMinMaxWidth(
            resizableRightPanelElemRef.current,
            rightPanelExpandedWidth +
              panelGroupDefinition.horizontalGroup.shared.expandedInsideBorderSize
          );
        }
      }
    },
    [leftPanelExpandedWidth, rightPanelExpandedWidth]
  );

  /**
   * Handles dragging of vertical resize handles (bottom panel).
   */
  const onVerticalHandleDragging = useCallback(
    isStartDrag => {
      if (isStartDrag) {
        isVerticalResizableHandleDraggingRef.current = true;
        setMinMaxHeight(resizableBottomPanelElemRef.current);
      } else {
        isVerticalResizableHandleDraggingRef.current = false;

        if (resizableBottomPanelAPIRef?.current?.isExpanded()) {
          setMinMaxHeight(
            resizableBottomPanelElemRef.current,
            bottomPanelExpandedHeight +
              panelGroupDefinition.verticalGroup.shared.expandedInsideBorderSize
          );
        }
      }
    },
    [bottomPanelExpandedHeight]
  );

  // 左パネルの操作
  const onLeftPanelClose = useCallback(() => {
    setLeftPanelClosed(true);
    setMinMaxWidth(resizableLeftPanelElemRef.current);
    resizableLeftPanelAPIRef?.current?.collapse();
  }, [setLeftPanelClosed]);

  const onLeftPanelOpen = useCallback(() => {
    resizableLeftPanelAPIRef?.current?.expand(
      getHorizontalPercentageSize(
        panelGroupDefinition.horizontalGroup.left.initialExpandedOffsetWidth
      )
    );
    setLeftPanelClosed(false);
  }, [setLeftPanelClosed]);

  const onLeftPanelResize = useCallback(size => {
    if (
      !resizableHorizontalPanelGroupElemRef?.current ||
      resizableLeftPanelAPIRef.current?.isCollapsed()
    ) {
      return;
    }

    const newExpandedWidth = getHorizontalExpandedPixelWidth(size);
    setLeftPanelExpandedWidth(newExpandedWidth);

    if (!isHorizontalResizableHandleDraggingRef.current) {
      setMinMaxWidth(resizableLeftPanelElemRef.current, newExpandedWidth);
    }
  }, []);

  // 右パネルの操作
  const onRightPanelClose = useCallback(() => {
    setRightPanelClosed(true);
    setMinMaxWidth(resizableRightPanelElemRef.current);
    resizableRightPanelAPIRef?.current?.collapse();
  }, [setRightPanelClosed]);

  const onRightPanelOpen = useCallback(() => {
    resizableRightPanelAPIRef?.current?.expand(
      getHorizontalPercentageSize(
        panelGroupDefinition.horizontalGroup.right.initialExpandedOffsetWidth
      )
    );
    setRightPanelClosed(false);
  }, [setRightPanelClosed]);

  const onRightPanelResize = useCallback(size => {
    if (
      !resizableHorizontalPanelGroupElemRef?.current ||
      resizableRightPanelAPIRef?.current?.isCollapsed()
    ) {
      return;
    }

    const newExpandedWidth = getHorizontalExpandedPixelWidth(size);
    setRightPanelExpandedWidth(newExpandedWidth);

    if (!isHorizontalResizableHandleDraggingRef.current) {
      setMinMaxWidth(resizableRightPanelElemRef.current, newExpandedWidth);
    }
  }, []);

  // ボトムパネルの操作
  const onBottomPanelClose = useCallback(() => {
    setBottomPanelClosed(true);
    setMinMaxHeight(resizableBottomPanelElemRef.current);
    resizableBottomPanelAPIRef?.current?.collapse();
  }, [setBottomPanelClosed]);

  const onBottomPanelOpen = useCallback(() => {
    resizableBottomPanelAPIRef?.current?.expand(
      getVerticalPercentageSize(
        panelGroupDefinition.verticalGroup.bottom.initialExpandedOffsetHeight
      )
    );
    setBottomPanelClosed(false);
  }, [setBottomPanelClosed]);

  const onBottomPanelResize = useCallback(size => {
    if (
      !resizableVerticalPanelGroupElemRef?.current ||
      resizableBottomPanelAPIRef?.current?.isCollapsed()
    ) {
      return;
    }

    const newExpandedHeight = getVerticalExpandedPixelHeight(size);
    setBottomPanelExpandedHeight(newExpandedHeight);

    if (!isVerticalResizableHandleDraggingRef.current) {
      setMinMaxHeight(resizableBottomPanelElemRef.current, newExpandedHeight);
    }
  }, []);

  /**
   * Gets the horizontal percentage size corresponding to the given pixel size.
   */
  const getHorizontalPercentageSize = pixelSize => {
    if (!resizableHorizontalPanelGroupElemRef.current) {
      return 0;
    }
    const { width: panelGroupWidth } =
      resizableHorizontalPanelGroupElemRef.current.getBoundingClientRect();
    return (pixelSize / (panelGroupWidth - (resizableHorizontalHandlesWidth.current || 0))) * 100;
  };

  /**
   * Gets the vertical percentage size corresponding to the given pixel size.
   */
  const getVerticalPercentageSize = pixelSize => {
    if (!resizableVerticalPanelGroupElemRef.current) {
      return 0;
    }
    const { height: panelGroupHeight } =
      resizableVerticalPanelGroupElemRef.current.getBoundingClientRect();
    return (pixelSize / (panelGroupHeight - (resizableVerticalHandlesHeight.current || 0))) * 100;
  };

  /**
   * Gets the width in pixels for an expanded horizontal panel given its percentage size.
   */
  const getHorizontalExpandedPixelWidth = percentageSize => {
    if (!resizableHorizontalPanelGroupElemRef.current) {
      return 0;
    }
    const { width: panelGroupWidth } =
      resizableHorizontalPanelGroupElemRef.current.getBoundingClientRect();
    const expandedWidth =
      (percentageSize / 100) * (panelGroupWidth - (resizableHorizontalHandlesWidth.current || 0)) -
      panelGroupDefinition.horizontalGroup.shared.expandedInsideBorderSize;
    return expandedWidth;
  };

  /**
   * Gets the height in pixels for an expanded vertical panel given its percentage size.
   */
  const getVerticalExpandedPixelHeight = percentageSize => {
    if (!resizableVerticalPanelGroupElemRef.current) {
      return 0;
    }
    const { height: panelGroupHeight } =
      resizableVerticalPanelGroupElemRef.current.getBoundingClientRect();
    const expandedHeight =
      (percentageSize / 100) * (panelGroupHeight - (resizableVerticalHandlesHeight.current || 0)) -
      panelGroupDefinition.verticalGroup.shared.expandedInsideBorderSize;
    return expandedHeight;
  };

  // 水平グループのprops（左パネル、右パネル、ViewPort）
  const horizontalPanelGroupProps = [
    // leftPanelProps
    {
      expandedWidth: leftPanelExpandedWidth,
      collapsedWidth: panelGroupDefinition.horizontalGroup.shared.collapsedWidth,
      collapsedInsideBorderSize:
        panelGroupDefinition.horizontalGroup.shared.collapsedInsideBorderSize,
      collapsedOutsideBorderSize:
        panelGroupDefinition.horizontalGroup.shared.collapsedOutsideBorderSize,
      expandedInsideBorderSize:
        panelGroupDefinition.horizontalGroup.shared.expandedInsideBorderSize,
      onClose: onLeftPanelClose,
      onOpen: onLeftPanelOpen,
    },
    // rightPanelProps
    {
      expandedWidth: rightPanelExpandedWidth,
      collapsedWidth: panelGroupDefinition.horizontalGroup.shared.collapsedWidth,
      collapsedInsideBorderSize:
        panelGroupDefinition.horizontalGroup.shared.collapsedInsideBorderSize,
      collapsedOutsideBorderSize:
        panelGroupDefinition.horizontalGroup.shared.collapsedOutsideBorderSize,
      expandedInsideBorderSize:
        panelGroupDefinition.horizontalGroup.shared.expandedInsideBorderSize,
      onClose: onRightPanelClose,
      onOpen: onRightPanelOpen,
    },
    // horizontalGroup
    { direction: 'horizontal', id: panelGroupDefinition.horizontalGroup.groupId },
    // resizableLeftPanelProps
    {
      defaultSize: leftResizablePanelMinimumSize,
      minSize: leftResizablePanelMinimumSize,
      onResize: onLeftPanelResize,
      collapsible: true,
      collapsedSize: leftResizablePanelCollapsedSize,
      onCollapse: () => setLeftPanelClosed(true),
      onExpand: () => setLeftPanelClosed(false),
      ref: resizableLeftPanelAPIRef,
      order: 0,
      id: panelGroupDefinition.horizontalGroup.left.panelId,
    },
    // resizableViewportGridPanelProps
    { order: 1, id: 'viewerLayoutResizableViewportGridPanel' },
    // resizableRightPanelProps
    {
      defaultSize: rightResizablePanelMinimumSize,
      minSize: rightResizablePanelMinimumSize,
      onResize: onRightPanelResize,
      collapsible: true,
      collapsedSize: rightResizePanelCollapsedSize,
      onCollapse: () => setRightPanelClosed(true),
      onExpand: () => setRightPanelClosed(false),
      ref: resizableRightPanelAPIRef,
      order: 2,
      id: panelGroupDefinition.horizontalGroup.right.panelId,
    },
  ];

  // 垂直グループのprops（水平グループ、ボトムパネル）
  const verticalPanelGroupProps = [
    // bottomPanelProps
    {
      expandedHeight: bottomPanelExpandedHeight,
      collapsedHeight: panelGroupDefinition.verticalGroup.shared.collapsedHeight,
      collapsedInsideBorderSize:
        panelGroupDefinition.verticalGroup.shared.collapsedInsideBorderSize,
      collapsedOutsideBorderSize:
        panelGroupDefinition.verticalGroup.shared.collapsedOutsideBorderSize,
      expandedInsideBorderSize: panelGroupDefinition.verticalGroup.shared.expandedInsideBorderSize,
      onClose: onBottomPanelClose,
      onOpen: onBottomPanelOpen,
    },
    // verticalGroup
    { direction: 'vertical', id: panelGroupDefinition.verticalGroup.groupId },
    // horizontalPanelGroupWrapperProps
    { order: 0, id: 'viewerLayoutHorizontalGroupPanel' },
    // resizableBottomPanelProps
    {
      defaultSize: bottomResizablePanelMinimumSize,
      minSize: bottomResizablePanelMinimumSize,
      onResize: onBottomPanelResize,
      collapsible: true,
      collapsedSize: bottomResizablePanelCollapsedSize,
      onCollapse: () => setBottomPanelClosed(true),
      onExpand: () => setBottomPanelClosed(false),
      ref: resizableBottomPanelAPIRef,
      order: 1,
      id: panelGroupDefinition.verticalGroup.bottom.panelId,
    },
  ];

  return [
    horizontalPanelGroupProps,
    verticalPanelGroupProps,
    onHorizontalHandleDragging,
    onVerticalHandleDragging,
  ];
};

export default useResizablePanels;
