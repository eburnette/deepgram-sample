import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import { Star } from "../../icons/Star";

interface Props {
  className?: string;
  highlighted?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void; // Add onMouseEnter prop
  onMouseLeave?: () => void; // Add onMouseLeave prop
}

export const StarButton = ({
  className,
  highlighted = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: Props): JSX.Element => {
  return (
    <button
      className={`star-button ${className} ${highlighted ? "highlighted" : ""}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter} // Handle mouse enter
      onMouseLeave={onMouseLeave} // Handle mouse leave
    >
      <Star className="star-instance" />
    </button>
  );
};

StarButton.propTypes = {
  className: PropTypes.string,
  enabled: PropTypes.bool,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func, // Validate onMouseEnter prop
  onMouseLeave: PropTypes.func, // Validate onMouseLeave prop
};
