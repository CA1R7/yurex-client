import React, { FC } from "react";
import { VERSION } from "../..";

export const Footer: FC = () => {
  return (
    <div id="footer-overlay">
      <div className="version-app wrap">
        <div className="type">{VERSION.type}</div>
        <div className="version">{VERSION.version}</div>
      </div>
      <div className="conditionals wrap">
        <div className="policy button">Pivacy prolicy</div>
        <div>|</div>
        <div className="terms button">Terms</div>
      </div>
    </div>
  );
};
