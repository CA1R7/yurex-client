import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { AppEntry } from "./main/EntryGame";
import { StateInterface, store } from "./redux";
import { Cell } from "./utils/game/cell";
import { Toaster } from "react-hot-toast";

import "./layout/styles/main.scss";


export const ENDPOINT: string = "http://localhost:7070";

export const VERSION: { type: "beta" | "release"; version: string } = {
  type: "beta",
  version: "v1.2.6 (0d4a4bc2)",
};

declare global {
  interface Array<T> {
    remove: (target: number | Cell) => boolean;
  }
  interface HTMLElement {
    onmousewheel: (e: WheelEvent) => void;
  }
  interface CanvasRenderingContext2D {
    roundRect: (
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
    ) => void;
  }
  interface Window {
    state: StateInterface;
  }
}

ReactDOM.render(
  <Provider store={store}>
    <Toaster />
    <AppEntry />
  </Provider>,
  document.getElementById("app"),
);
