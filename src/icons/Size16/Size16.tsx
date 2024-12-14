/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

interface Props {
  className: any;
}

export const Size16 = ({ className }: Props): JSX.Element => {
  return (
    <svg
      className={`size-16 ${className}`}
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="g" clipPath="url(#clip0_268_7436)">
        <path
          className="path"
          d="M7.99999 10.6666V7.99992M7.99999 5.33325H8.00666M14.6667 7.99992C14.6667 11.6818 11.6819 14.6666 7.99999 14.6666C4.3181 14.6666 1.33333 11.6818 1.33333 7.99992C1.33333 4.31802 4.3181 1.33325 7.99999 1.33325C11.6819 1.33325 14.6667 4.31802 14.6667 7.99992Z"
          stroke="#1E1E1E"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </g>
      <defs className="defs">
        <clipPath className="clip-path" id="clip0_268_7436">
          <rect className="rect" fill="white" height="16" width="16" />
        </clipPath>
      </defs>
    </svg>
  );
};
