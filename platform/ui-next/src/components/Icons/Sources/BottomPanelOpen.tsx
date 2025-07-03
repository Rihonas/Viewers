import React from 'react';
import type { IconProps } from '../types';

export const BottomPanelOpen = (props: IconProps) => (
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
        {/* 上向きの矢印 */}
        <line
          x1="10"
          y1="12"
          x2="10"
          y2="4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <polyline
          points="6 6 10 2 14 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* 下部の横棒 */}
        <line
          x1="5"
          y1="16"
          x2="15"
          y2="16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </g>
  </svg>
);

export default BottomPanelOpen;
