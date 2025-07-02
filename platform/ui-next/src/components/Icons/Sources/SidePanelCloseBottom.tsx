import React from 'react';
import type { IconProps } from '../types';

export const SidePanelCloseBottom = (props: IconProps) => (
  <svg
    width="20px"
    height="20px"
    viewBox="0 0 20 20"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g
      stroke="none"
      strokeWidth="1"
      fill="none"
      fillRule="evenodd"
    >
      <g transform="translate(0, 0)">
        <rect
          x="0"
          y="0"
          width="20"
          height="20"
          fill="none"
        />
        {/* 下向きの矢印 */}
        <line
          x1="10"
          y1="5"
          x2="10"
          y2="13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <polyline
          points="6 11 10 15 14 11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </g>
  </svg>
);

export default SidePanelCloseBottom;
