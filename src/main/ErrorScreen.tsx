import React, { FC } from "react";
import { useSelector } from "react-redux";
import { StateInterface } from "../redux";
import { GameReducer } from "../redux/reducers/game.reducer";

import errorImage from "../layout/img/error.svg";

export const ErrorPage: FC = () => {
  const { error_page_content } = useSelector<StateInterface, GameReducer>(
    (state) => state.gameReducer,
  );

  return (
    (error_page_content && (
      <div id="error-page">
        <div className="middle-content">
          <div className="icon">
            <img src={errorImage} alt="Error" />
          </div>
          <div className="title">{error_page_content.title}</div>
          <div className="description">{error_page_content.msg}</div>
        </div>
      </div>
    )) ??
    null
  );
};
