import React from "react";
import "./style.css";

interface Props {
  className?: any;
}

export const Star = ({ className }: Props): JSX.Element => {
  return (
    <svg 
      className={`star ${className}`} 
      fill="gray"
      width="40"
      height="37"
      viewBox="0 0 40 37"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0.5L24.6435 14.1088L39.0211 14.3197L27.5133 22.9412L31.7557 36.6803L20 28.4L8.2443 36.6803L12.4867 22.9412L0.97887 14.3197L15.3565 14.1088L20 0.5Z" />
    </svg>
  );
};
