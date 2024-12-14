/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

interface Props {
  className: any;
}

export const Size40 = ({ className }: Props): JSX.Element => {
  return (
    <svg
      className={`size-40 ${className}`}
      fill="none"
      height="40"
      viewBox="0 0 40 40"
      width="40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M20 26.6666V19.9999M20 13.3333H20.0167M36.6667 19.9999C36.6667 29.2047 29.2048 36.6666 20 36.6666C10.7953 36.6666 3.33334 29.2047 3.33334 19.9999C3.33334 10.7952 10.7953 3.33325 20 3.33325C29.2048 3.33325 36.6667 10.7952 36.6667 19.9999Z"
        stroke="#1E1E1E"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
    </svg>
  );
};
