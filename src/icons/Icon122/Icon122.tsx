/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";

interface Props {
  color: string;
  className: any;
}

export const Icon122 = ({ color = "#1D1B20", className }: Props): JSX.Element => {
  return (
    <svg
      className={`icon-122 ${className}`}
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M19.6 21.0001L13.3 14.7001C12.8 15.1001 12.225 15.4168 11.575 15.6501C10.925 15.8835 10.2333 16.0001 9.5 16.0001C7.68333 16.0001 6.14583 15.371 4.8875 14.1126C3.62917 12.8543 3 11.3168 3 9.50012C3 7.68346 3.62917 6.14596 4.8875 4.88762C6.14583 3.62929 7.68333 3.00012 9.5 3.00012C11.3167 3.00012 12.8542 3.62929 14.1125 4.88762C15.3708 6.14596 16 7.68346 16 9.50012C16 10.2335 15.8833 10.9251 15.65 11.5751C15.4167 12.2251 15.1 12.8001 14.7 13.3001L21 19.6001L19.6 21.0001ZM9.5 14.0001C10.75 14.0001 11.8125 13.5626 12.6875 12.6876C13.5625 11.8126 14 10.7501 14 9.50012C14 8.25012 13.5625 7.18762 12.6875 6.31262C11.8125 5.43762 10.75 5.00012 9.5 5.00012C8.25 5.00012 7.1875 5.43762 6.3125 6.31262C5.4375 7.18762 5 8.25012 5 9.50012C5 10.7501 5.4375 11.8126 6.3125 12.6876C7.1875 13.5626 8.25 14.0001 9.5 14.0001Z"
        fill={color}
      />
    </svg>
  );
};

Icon122.propTypes = {
  color: PropTypes.string,
};