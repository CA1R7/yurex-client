import React, { FC, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, StateInterface } from "../redux";
import { GameReducer } from "../redux/reducers/game.reducer";
import { bytesToHex } from "../utils/other/color_handler";
import { ColorPickerHandler, RGBColor } from "../utils/other/color_picker";

export const ColorPicker: FC<{
  onSelect?: (color: string) => void;
  colorOf?: string;
  active: boolean;
}> = ({ colorOf, onSelect, active }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const dispatch = useDispatch<Dispatch<GameReducer>>();
  const [visibilityButton, setVisibilityButton] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>(colorOf ?? "#fff");
  const { picker } = useSelector<StateInterface, GameReducer>(
    (state) => state.gameReducer,
  );

  if (!active) {
    return null;
  }

  const setPublicPicker = (a: boolean) => {
    dispatch({
      type: "UPDATE_GAME_STATE",
      payload: {
        picker: a,
      },
    });
    return a;
  };

  useEffect(() => {
    if (!picker) {
      setVisibilityButton(false);
    }
  }, [picker]);

  useEffect(() => {
    (async () => {
      if (canvas.current) {
        setPublicPicker(true);

        const pickerHandler = new ColorPickerHandler(canvas.current, 150, 150);
        await pickerHandler.initImage();
        pickerHandler.initDraw();
        pickerHandler.onChange((color: RGBColor | null) => {
          if (color) {
            let hex = bytesToHex(color);
            onSelect && onSelect(hex);
            setCurrentColor(hex);
          }
        });
      }
    })();

    return () => {
      console.log("amiine");
      setPublicPicker(false);
    };
  }, [canvas.current]);

  return (
    <div className="color-picker">
      <div
        className="color-preview"
        onClick={() => setPublicPicker(true) && setVisibilityButton(true)}
      >
        <div
          className="sq-color"
          style={{ backgroundColor: currentColor }}
        ></div>
        <div className="color-hex">{currentColor}</div>
      </div>
      {visibilityButton && picker ? (
        <canvas className="picker" ref={canvas}></canvas>
      ) : null}
    </div>
  );
};
