import classnames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { Icons } from '../../icon';
import { TooltipTrigger, TooltipContent, Tooltip } from '@ohif/ui-next';
import { Separator } from '@ohif/ui-next';

/**
 * BottomPanel component properties.
 * Note that the component monitors changes to the various heights and border sizes and will resize dynamically
 * @property {boolean} isExpanded - boolean indicating if the bottom panel is expanded/open or collapsed
 * @property {number} expandedHeight - the height of this bottom panel when expanded not including any borders or margins
 * @property {number} collapsedHeight - the height of this bottom panel when collapsed not including any borders or margins
 * @property {number} expandedInsideBorderSize - the height of the space between the expanded bottom panel content and viewport grid
 * @property {number} collapsedInsideBorderSize - the height of the space between the collapsed bottom panel content and the viewport grid
 * @property {number} collapsedOutsideBorderSize - the height of the space between the collapsed bottom panel content and the edge of the browser window
 */
type BottomPanelProps = {
  className: string;
  activeTabIndex: number;
  onOpen: () => void;
  onClose: () => void;
  onActiveTabIndexChange: (args: { activeTabIndex: number }) => void;
  isExpanded: boolean;
  expandedHeight?: number;
  collapsedHeight?: number;
  expandedInsideBorderSize?: number;
  collapsedInsideBorderSize?: number;
  collapsedOutsideBorderSize?: number;
  tabs: Array<{
    name: string;
    label: string;
    iconName: string;
    disabled?: boolean;
    content: React.ComponentType;
  }>;
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

const closeIconHeight = 30;
const gridVerticalPadding = 10;
const tabSpacerHeight = 2;

const baseClasses = 'bg-black border-black justify-start box-content flex flex-col';

const getTabHeight = (numTabs: number) => {
  if (numTabs < 3) {
    return 28;
  } else {
    return 20;
  }
};

const getGridHeight = (numTabs: number, gridAvailableHeight: number) => {
  const spacersHeight = (numTabs - 1) * tabSpacerHeight;
  const tabsHeight = getTabHeight(numTabs) * numTabs;

  if (gridAvailableHeight > tabsHeight + spacersHeight) {
    return tabsHeight + spacersHeight;
  }

  return gridAvailableHeight;
};

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
  numRows: number,
  numTabs: number,
  tabIndex: number,
  isActiveTab: boolean,
  isTabDisabled: boolean = false
) =>
  classnames('h-[28px] mb-[2px] cursor-pointer text-white bg-black', {
    'hover:text-primary': !isActiveTab && !isTabDisabled,
    'rounded-l': tabIndex % numRows === 0,
    'rounded-r': (tabIndex + 1) % numRows === 0 || tabIndex === numTabs - 1,
  });

const getTabStyle = (numTabs: number) => {
  return {
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
  expandedHeight: number,
  expandedInsideBorderSize: number,
  collapsedHeight: number,
  collapsedInsideBorderSize: number,
  collapsedOutsideBorderSize: number
): StyleMap => {
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

const getToolTipContent = (label: string, disabled: boolean = false) => {
  return (
    <>
      <div>{label}</div>
      {disabled && <div className="text-white">{'Not available based on current context'}</div>}
    </>
  );
};

const createBaseStyle = (expandedHeight: number) => {
  return {
    maxHeight: `${expandedHeight}px`,
    height: `${expandedHeight}px`,
    position: 'relative' as const,
    width: '100%',
  };
};

const BottomPanel = ({
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
      expandedHeight,
      expandedInsideBorderSize,
      collapsedHeight,
      collapsedInsideBorderSize,
      collapsedOutsideBorderSize
    )
  );

  const [baseStyle, setBaseStyle] = useState(createBaseStyle(expandedHeight));

  const [gridAvailableHeight, setGridAvailableHeight] = useState(
    expandedHeight - closeIconHeight - gridVerticalPadding
  );

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

    const gridAvailableHeight = expandedHeight - closeIconHeight - gridVerticalPadding;
    setGridAvailableHeight(gridAvailableHeight);
    setGridHeight(getGridHeight(tabs.length, gridAvailableHeight));
  }, [
    collapsedInsideBorderSize,
    collapsedHeight,
    expandedHeight,
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
        <div className={classnames('bg-secondary-dark relative flex h-[28px] w-full rounded-md')}>
          {/* 右上固定の開閉ボタン */}
          <div
            className={classnames(
              'absolute top-0 right-0 flex cursor-pointer items-center justify-center'
            )}
            style={{ height: `${closeIconHeight}px`, width: `${closeIconHeight}px` }}
            onClick={() => {
              updatePanelOpen(!panelOpen);
            }}
            data-cy={`bottom-panel-header`}
          >
            {/* {React.createElement(Icons['BottomPanelOpen'] || Icons.MissingIcon, {
              className: 'text-primary',
            })} */}
            <Icons.ByName
              name="BottomPanelOpen"
              className="text-primary"
            />
          </div>
        </div>
        <div className={classnames('mt-3 flex flex-row justify-center space-x-3')}>
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
                  {/* {React.createElement(Icons[childComponent.iconName] || Icons.MissingIcon, {
                    className: classnames({
                      'text-primary': true,
                      'ohif-disabled': childComponent.disabled,
                    }),
                    style: {
                      width: '22px',
                      height: '22px',
                    },
                  })}                   */}
                  <Icons.ByName
                    name={childComponent.iconName}
                    className={classnames('h-[22px] w-[22px]', {
                      'text-primary': true,
                      'ohif-disabled': childComponent.disabled,
                    })}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className={classnames('flex items-center justify-center')}>
                  {getToolTipContent(childComponent.label, childComponent.disabled ?? false)}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </>
    );
  };

  const getCloseIcon = () => {
    // パネルの開閉状態に応じてアイコンを選択
    const iconName = panelOpen ? 'BottomPanelClose' : 'BottomPanelOpen';

    return (
      <div
        className={classnames(
          'absolute top-0 right-0 flex cursor-pointer items-center justify-center'
        )}
        style={{ height: `${closeIconHeight}px`, width: `${closeIconHeight}px` }}
        onClick={() => {
          updatePanelOpen(!panelOpen);
        }}
        data-cy={`bottom-panel-header`}
      >
        {/* {React.createElement(Icons[iconName] || Icons.MissingIcon, {
          className: 'text-primary',
        })}         */}
        <Icons.ByName
          name={iconName}
          className="text-primary"
        />
      </div>
    );
  };

  const getTabGridComponent = () => {
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
                    <div className={classnames('flex h-[2px] w-[28px] items-center bg-black')}>
                      <div className="bg-primary-dark h-full w-[20px]"></div>
                    </div>
                  )}
                  <Tooltip key={tabIndex}>
                    <TooltipTrigger>
                      <div
                        className={getTabClassNames(
                          numRows,
                          tabs.length,
                          tabIndex,
                          tabIndex === activeTabIndex,
                          disabled ?? false
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
                          {/* {React.createElement(Icons[tab.iconName] || Icons.MissingIcon, {
                            className: classnames({
                              'text-primary': true,
                              'ohif-disabled': disabled,
                            }),
                            style: {
                              width: '22px',
                              height: '22px',
                            },
                          })}                           */}
                          <Icons.ByName
                            name={tab.iconName}
                            className={classnames('h-[22px] w-[22px]', {
                              'text-primary': true,
                              'ohif-disabled': disabled,
                            })}
                          />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {getToolTipContent(tab.label, disabled ?? false)}
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
          className="bg-black"
          thickness="2px"
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
