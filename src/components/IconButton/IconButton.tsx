/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { useReducer } from "react";
import { Icon196 } from "../../icons/Icon196";
import "./style.css";

interface Props {
  style: "filled" | "outlined" | "tonal" | "standard";
  stateProp: "enabled" | "focused" | "pressed" | "hovered" | "disabled";
  icon: JSX.Element;
}

export const IconButton = ({
  style,
  stateProp,
  icon = <Icon196 className="icon" color="#49454F" />,
}: Props): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, {
    style: style || "outlined",
    state: stateProp || "disabled",
  });

  return (
    <div
      className={`icon-button ${state.state} ${state.style}`}
      onMouseLeave={() => {
        dispatch("mouse_leave");
      }}
      onMouseEnter={() => {
        dispatch("mouse_enter");
      }}
    >
      <div className="container">
        <div className="state-layer">{icon}</div>
      </div>
    </div>
  );
};

function reducer(state: any, action: any) {
  switch (action) {
    case "mouse_enter":
      return {
        ...state,
        state: "hovered",
      };

    case "mouse_leave":
      return {
        ...state,
        state: "enabled",
      };
  }

  return state;
}

IconButton.propTypes = {
  style: PropTypes.oneOf(["filled", "outlined", "tonal", "standard"]),
  stateProp: PropTypes.oneOf(["enabled", "focused", "pressed", "hovered", "disabled"]),
};
