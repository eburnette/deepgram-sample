/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { useReducer } from "react";
import { Size201 } from "../../icons/Size201";
import "./style.css";

interface Props {
  variant: "primary" | "neutral" | "subtle";
  stateProp: "disabled" | "hover" | "default";
  size: "medium" | "small";
  className: any;
  icon: JSX.Element;
}

export const VariantPrimaryWrapper = ({
  variant,
  stateProp,
  size,
  className,
  icon = <Size201 className="size-20-1" color="#1E1E1E" />,
}: Props): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, {
    variant: variant || "primary",
    state: stateProp || "default",
    size: size || "medium",
  });

  return (
    <div
      className={`variant-primary-wrapper state-3-${state.state} ${state.size} ${state.variant} ${className}`}
      onMouseEnter={() => {
        dispatch("mouse_enter");
      }}
      onMouseLeave={() => {
        dispatch("mouse_leave");
      }}
    >
      {icon}
    </div>
  );
};

function reducer(state: any, action: any) {
  switch (action) {
    case "mouse_enter":
      return {
        ...state,
        state: "hover",
      };

    case "mouse_leave":
      return {
        ...state,
        state: "default",
      };
  }

  return state;
}

VariantPrimaryWrapper.propTypes = {
  variant: PropTypes.oneOf(["primary", "neutral", "subtle"]),
  stateProp: PropTypes.oneOf(["disabled", "hover", "default"]),
  size: PropTypes.oneOf(["medium", "small"]),
};
