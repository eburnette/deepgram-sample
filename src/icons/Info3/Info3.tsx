/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";

interface Props {
  className: any;
}

export const Info3 = ({ className }: Props): JSX.Element => {
  return (
    <svg
      className={`info-3 ${className}`}
      fill="none"
      height="20"
      viewBox="0 0 21 20"
      width="21"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M10.5 13.3332V9.99984M10.5 6.6665H10.5083M18.8333 9.99984C18.8333 14.6022 15.1024 18.3332 10.5 18.3332C5.89763 18.3332 2.16667 14.6022 2.16667 9.99984C2.16667 5.39746 5.89763 1.6665 10.5 1.6665C15.1024 1.6665 18.8333 5.39746 18.8333 9.99984Z"
        stroke="#757575"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};
