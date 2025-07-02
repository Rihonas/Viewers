import classnames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { Icons } from '../Icons';
import { TooltipTrigger, TooltipContent, Tooltip } from '../Tooltip';
import { Separator } from '../Separator';

type BottomPanelProps = {
  //side: 'bottom';
  className: string;
  activeTabIndex: number;
  onOpen: () => void;
  onClose: () => void;
  // onActiveTabIndexChange: () => void;
  onActiveTabIndexChange: (args: { activeTabIndex: number }) => void;
  isExpanded: boolean;
  expandedHeight?: number;
  collapsedHeight?: number;
  expandedInsideBorderSize: number;
  collapsedInsideBorderSize: number;
  collapsedOutsideBorderSize: number;
  tabs: any;
};

type StyleMap = {
  open: {
    bottom: {
      marginTop: string;
      marginBottom: string;
    };
  };
  closed: {
    bottom: {
      marginTop: string;
      marginBottom: string;
      alignItems: 'flex-end';
    };
  };
};
// const closeIconWidth = 30;
const closeIconHeight = 30;
//const gridHorizontalPadding = 10;
const gridVerticalPadding = 10;
// const tabSpacerWidth = 2;
const tabSpacerHeight = 2;

const baseClasses = 'bg-black border-black justify-start box-content flex flex-col';

const openStateIconName = {
  // left: 'SidePanelCloseLeft',
  // right: 'SidePanelCloseRight',
  bottom: 'SidePanelCloseBottom',
};

// const getTabWidth = (numTabs: number) => {
//   if (numTabs < 3) {
//     return 68;
//   } else {
//     return 40;
//   }
// };
const getTabHeight = (numTabs: number) => {
  if (numTabs < 3) {
    return 28;
  } else {
    return 20;
  }
};

// const getGridWidth = (numTabs: number, gridAvailableWidth: number) => {
//   const spacersWidth = (numTabs - 1) * tabSpacerWidth;
//   const tabsWidth = getTabWidth(numTabs) * numTabs;

//   if (gridAvailableWidth > tabsWidth + spacersWidth) {
//     return tabsWidth + spacersWidth;
//   }

//   return gridAvailableWidth;
// };
const getGridHeight = (numTabs: number, gridAvailableHeight: number) => {
  const spacersHeight = (numTabs - 1) * tabSpacerHeight;
  const tabsHeight = getTabHeight(numTabs) * numTabs;

  if (gridAvailableHeight > tabsHeight + spacersHeight) {
    return tabsHeight + spacersHeight;
  }

  return gridAvailableHeight;
};

// const getNumGridColumns = (numTabs: number, gridWidth: number) => {
//   if (numTabs === 1) {
//     return 1;
//   }

//   // Start by calculating the number of tabs assuming each tab was accompanied by a spacer.
//   const tabWidth = getTabWidth(numTabs);
//   const numTabsWithOneSpacerEach = Math.floor(gridWidth / (tabWidth + tabSpacerWidth));

//   // But there is always one less spacer than tabs, so now check if an extra tab with one less spacer fits.
//   if (
//     (numTabsWithOneSpacerEach + 1) * tabWidth + numTabsWithOneSpacerEach * tabSpacerWidth <=
//     gridWidth
//   ) {
//     return numTabsWithOneSpacerEach + 1;
//   }

//   return numTabsWithOneSpacerEach;
// };
const getNumGridRows = (numTabs: number, gridHeight: number) => {
  if (numTabs === 1) {
    return 1;
  }

  // Start by calculating the number of tabs assuming each tab was accompanied by a spacer.
  const tabHeight = getTabHeight(numTabs);
  const numTabsWithOneSpacerEach = Math.floor(gridHeight / (tabHeight + tabSpacerHeight));

  // But there is always one less spacer than tabs, so now check if an extra tab with one less spacer fits.
  if (
    (numTabsWithOneSpacerEach + 1) * tabHeight + numTabsWithOneSpacerEach * tabSpacerHeight <=
    gridHeight
  ) {
    return numTabsWithOneSpacerEach + 1;
  }

  return numTabsWithOneSpacerEach;
};

const getTabClassNames = (
  // numColumns: number,
  numRows: number,
  numTabs: number,
  tabIndex: number,
  isActiveTab: boolean,
  isTabDisabled: boolean
) =>
  classnames('h-[28px] mb-[2px] cursor-pointer text-white bg-black', {
    'hover:text-primary': !isActiveTab && !isTabDisabled,
    'rounded-l': tabIndex % numRows === 0,
    'rounded-r': (tabIndex + 1) % numRows === 0 || tabIndex === numTabs - 1,
  });

const getTabStyle = (numTabs: number) => {
  return {
    // width: `${getTabWidth(numTabs)}px`,
    height: `${getTabHeight(numTabs)}px`,
  };
};

const getTabIconClassNames = (numTabs: number, isActiveTab: boolean) => {
  return classnames('h-full w-full flex items-center justify-center', {
    'bg-customblue-40': isActiveTab,
    rounded: isActiveTab,
  });
};

const createStyleMap = (
  // expandedWidth: number,
  expandedHeight: number,
  expandedInsideBorderSize: number,
  // collapsedWidth: number,
  collapsedHeight: number,
  collapsedInsideBorderSize: number,
  collapsedOutsideBorderSize: number
): StyleMap => {
  // const collapsedHideWidth = expandedWidth - collapsedWidth - collapsedOutsideBorderSize;
  const collapsedHideHeight = expandedHeight - collapsedHeight - collapsedOutsideBorderSize;

  return {
    open: {
      bottom: { marginTop: '0px', marginBottom: `${expandedInsideBorderSize}px` },
    },
    closed: {
      bottom: {
        marginTop: `${collapsedInsideBorderSize}px`,
        marginBottom: `-${collapsedHideHeight}px`,
        alignItems: `flex-end`,
      },
    },
  };
};

const getToolTipContent = (label: string, disabled: boolean) => {
  return (
    <>
      <div>{label}</div>
      {disabled && <div className="text-white">{'Not available based on current context'}</div>}
    </>
  );
};

// const createBaseStyle = (expandedWidth: number) => {
//   return {
//     maxWidth: `${expandedWidth}px`,
//     width: `${expandedWidth}px`,
//     // To align the top of the side panel with the top of the viewport grid, use position relative and offset the
//     // top by the same top offset as the viewport grid. Also adjust the height so that there is no overflow.
//     position: 'relative',
//     top: '0.2%',
//     height: '99.8%',
//   };
// };
const createBaseStyle = (
  // expandedWidth: number,
  expandedHeight: number
  //side: 'bottom'
) => {
  // if (side === 'bottom') {
  return {
    maxHeight: `${expandedHeight}px`,
    height: `${expandedHeight}px`,
    width: '99.8%',
    position: 'relative' as React.CSSProperties['position'],
    left: '0.2%',
  };
  // }
  // return {
  //   maxWidth: `${expandedWidth}px`,
  //   width: `${expandedWidth}px`,
  //   position: 'relative',
  //   top: '0.2%',
  //   height: '99.8%',
  // };
};

const BottomPanel = ({
  // side = 'bottom', // デフォルト値を追加
  className,
  activeTabIndex: activeTabIndexProp,
  isExpanded,
  tabs,
  onOpen,
  onClose,
  onActiveTabIndexChange,
  expandedHeight = 220,
  collapsedHeight = 25,
  expandedInsideBorderSize = 4,
  collapsedInsideBorderSize = 8,
  collapsedOutsideBorderSize = 4,
}: BottomPanelProps) => {
  const [panelOpen, setPanelOpen] = useState(isExpanded);
  const [activeTabIndex, setActiveTabIndex] = useState(activeTabIndexProp ?? 0);

  const [styleMap, setStyleMap] = useState(
    createStyleMap(
      // expandedWidth
      expandedHeight,
      expandedInsideBorderSize,
      // collapsedWidth,
      collapsedHeight,
      collapsedInsideBorderSize,
      collapsedOutsideBorderSize
    )
  );

  const [baseStyle, setBaseStyle] = useState(createBaseStyle(expandedHeight));

  // const [gridAvailableWidth, setGridAvailableWidth] = useState(
  //   expandedWidth - closeIconWidth - gridHorizontalPadding
  // );
  const [gridAvailableHeight, setGridAvailableHeight] = useState(
    expandedHeight - closeIconHeight - gridVerticalPadding
  );

  // const [gridWidth, setGridWidth] = useState(getGridWidth(tabs.length, gridAvailableWidth));
  const [gridHeight, setGridHeight] = useState(getGridHeight(tabs.length, gridAvailableHeight));
  const openStatus = panelOpen ? 'open' : 'closed';
  const style = Object.assign({}, styleMap[openStatus]['bottom'], baseStyle);

  const updatePanelOpen = useCallback(
    (isOpen: boolean) => {
      setPanelOpen(isOpen);
      if (isOpen !== panelOpen) {
        // only fire events for changes
        if (isOpen && onOpen) {
          onOpen();
        } else if (onClose && !isOpen) {
          onClose();
        }
      }
    },
    [panelOpen, onOpen, onClose]
  );

  const updateActiveTabIndex = useCallback(
    (activeTabIndex: number, forceOpen: boolean = false) => {
      if (forceOpen) {
        updatePanelOpen(true);
      }

      setActiveTabIndex(activeTabIndex);

      if (onActiveTabIndexChange) {
        onActiveTabIndexChange({ activeTabIndex });
      }
    },
    [onActiveTabIndexChange, updatePanelOpen]
  );

  useEffect(() => {
    updatePanelOpen(isExpanded);
  }, [isExpanded, updatePanelOpen]);

  useEffect(() => {
    setStyleMap(
      createStyleMap(
        expandedHeight,
        expandedInsideBorderSize,
        collapsedHeight,
        collapsedInsideBorderSize,
        collapsedOutsideBorderSize
      )
    );
    setBaseStyle(createBaseStyle(expandedHeight));

    // const gridAvailableWidth = expandedWidth - closeIconWidth - gridHorizontalPadding;
    // setGridAvailableWidth(gridAvailableWidth);
    // setGridWidth(getGridWidth(tabs.length, gridAvailableWidth));

    const gridAvailableHeight = expandedHeight - closeIconHeight - gridVerticalPadding;
    setGridAvailableHeight(gridAvailableHeight);
    setGridHeight(getGridHeight(tabs.length, gridAvailableHeight));
  }, [
    collapsedInsideBorderSize,
    expandedHeight,
    collapsedHeight,
    expandedInsideBorderSize,
    tabs.length,
    collapsedOutsideBorderSize,
  ]);

  useEffect(() => {
    updateActiveTabIndex(activeTabIndexProp ?? 0);
  }, [activeTabIndexProp, updateActiveTabIndex]);

  const getCloseStateComponent = () => {
    const _childComponents = Array.isArray(tabs) ? tabs : [tabs];
    return (
      <>
        <div
          className={classnames(
            'bg-secondary-dark flex h-[28px] w-full cursor-pointer items-center justify-end rounded-md pr-2' //: 'justify-start pl-2'
          )}
          onClick={() => {
            updatePanelOpen(!panelOpen);
          }}
          data-cy={`side-panel-header-bottom`}
        >
          <Icons.NavigationPanelReveal
            className={classnames('text-primary', !panelOpen && 'rotate-180 transform')}
          />
        </div>
        <div className={classnames('mt-3 flex flex-col space-y-3')}>
          {_childComponents.map((childComponent, index) => (
            <Tooltip key={index}>
              <TooltipTrigger>
                <div
                  id={`${childComponent.name}-btn`}
                  data-cy={`${childComponent.name}-btn`}
                  className="text-primary hover:cursor-pointer"
                  onClick={() => {
                    return childComponent.disabled ? null : updateActiveTabIndex(index, true);
                  }}
                >
                  {React.createElement(Icons[childComponent.iconName] || Icons.MissingIcon, {
                    className: classnames({
                      'text-primary': true,
                      'ohif-disabled': childComponent.disabled,
                    }),
                    style: {
                      width: '22px',
                      height: '22px',
                    },
                  })}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div
                  className={classnames(
                    'flex items-center justify-end' // : 'justify-start'
                  )}
                >
                  {getToolTipContent(childComponent.label, childComponent.disabled)}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </>
    );
  };

  const getCloseIcon = () => {
    return (
      <div
        className={classnames(
          'absolute top-0 flex cursor-pointer items-center justify-center'
          //side === 'left' ? 'right-0' : 'left-0'
        )}
        style={{ height: `${closeIconHeight}px` }} //{{ width: `${closeIconWidth}px` }}
        onClick={() => {
          updatePanelOpen(!panelOpen);
        }}
        data-cy={`bottom-panel-header`}
      >
        {React.createElement(Icons[openStateIconName['bottom']] || Icons.MissingIcon, {
          className: 'text-primary',
        })}
      </div>
    );
  };

  const getTabGridComponent = () => {
    // const numCols = getNumGridColumns(tabs.length, gridWidth);
    const numRows = getNumGridRows(tabs.length, gridHeight);

    return (
      <>
        {getCloseIcon()}
        <div className={classnames('flex grow justify-center')}>
          <div className={classnames('bg-primary-dark text-primary flex flex-wrap')}>
            {tabs.map((tab, tabIndex) => {
              const { disabled } = tab;
              return (
                <React.Fragment key={tabIndex}>
                  {tabIndex % numRows !== 0 && (
                    <div
                      className={classnames(
                        'flex h-[28px] w-[2px] items-center bg-black',
                        tabSpacerHeight //tabSpacerWidth
                      )}
                    >
                      <div className="bg-primary-dark h-[20px] w-full"></div>
                    </div>
                  )}
                  <Tooltip key={tabIndex}>
                    <TooltipTrigger>
                      <div
                        className={getTabClassNames(
                          //numCols,
                          numRows,
                          tabs.length,
                          tabIndex,
                          tabIndex === activeTabIndex,
                          disabled
                        )}
                        style={getTabStyle(tabs.length)}
                        onClick={() => {
                          return disabled ? null : updateActiveTabIndex(tabIndex);
                        }}
                        data-cy={`${tab.name}-btn`}
                      >
                        <div
                          className={getTabIconClassNames(tabs.length, tabIndex === activeTabIndex)}
                        >
                          {React.createElement(Icons[tab.iconName] || Icons.MissingIcon, {
                            className: classnames({
                              'text-primary': true,
                              'ohif-disabled': disabled,
                            }),
                            style: {
                              width: '22px',
                              height: '22px',
                            },
                          })}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {getToolTipContent(tab.label, disabled)}
                    </TooltipContent>
                  </Tooltip>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const getOneTabComponent = () => {
    return (
      <div
        className={classnames(
          'text-primary flex grow cursor-pointer select-none justify-center self-center text-[13px]'
        )}
        data-cy={`${tabs[0].name}-btn`}
        onClick={() => updatePanelOpen(!panelOpen)}
      >
        {getCloseIcon()}
        <span>{tabs[0].label}</span>
      </div>
    );
  };

  const getOpenStateComponent = () => {
    return (
      <>
        <div className="bg-bkg-med flex h-[40px] flex-shrink-0 select-none rounded-t p-2">
          {tabs.length === 1 ? getOneTabComponent() : getTabGridComponent()}
        </div>
        <Separator
          orientation="horizontal"
          className="h-[2px] bg-black"
          // thickness="2px"
        />
      </>
    );
  };

  return (
    <div
      className={classnames(className, baseClasses)}
      style={style}
    >
      {panelOpen ? (
        <>
          {getOpenStateComponent()}
          {tabs.map((tab, tabIndex) => {
            if (tabIndex === activeTabIndex) {
              return <tab.content key={tabIndex} />;
            }
            return null;
          })}
        </>
      ) : (
        <React.Fragment>{getCloseStateComponent()}</React.Fragment>
      )}
    </div>
  );
};

export { BottomPanel };
