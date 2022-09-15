import React, { FC } from "react";

export const LoaderScreen: FC = () => {
  return (
    <div id="loader-screen">
      <div className="fill">
        <div></div>
      </div>
      <div className="content-center">
        <div className="content-text">
          <div className="logo">YUREX</div>
        </div>
      </div>
    </div>
  );
};
