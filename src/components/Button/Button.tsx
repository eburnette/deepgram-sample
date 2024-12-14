import PropTypes from "prop-types";
import React from "react";
import "./style.css";

interface Props {
  className?: string;
  highlighted?: boolean;
  onClick?: React.MouseEventHandler;
  labelText?: string;
}

export const Button = ({
  className,
  onClick,
  labelText="testing",
}: Props): JSX.Element => {
  return (
    <button
      className={`deepsample-button ${className}`}
      onClick={onClick}
    >
      {labelText}
    </button>
  );
};

Button.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  labelText: PropTypes.string,
};
