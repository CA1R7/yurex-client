import React, { FC, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, StateInterface } from "../redux";
import { SettingsReducer } from "../redux/reducers/settings.reducer";
import { keysKeyboardDefault } from "../utils/other/keyboard_keys";
import { settings } from "../utils/other/settings_handler";
import { Button } from "./Button";

export const KeyChangerWrap: FC<{
  onSelect?: (index: number) => void;
  id?: string;
  key_code: number;
  active?: boolean;
}> = ({ onSelect, id, active, key_code }) => {
  const dispatch = useDispatch<Dispatch<SettingsReducer>>();
  const { keyboard } = useSelector<StateInterface, SettingsReducer>(
    (state) => state.settingsReducer,
  );

  const show = keyboard.keyInChange === key_code;

  const setKeyIn = (code: number | null) => {
    dispatch({
      type: "UPDATE_SETTINGS_STATE",
      payload: {
        keyboard: Object.assign(keyboard, {
          keyInChange: code,
        }),
      },
    });
  };

  const changeKey = (code: number) => {
    let keysAlreadyExists: number[] = [];

    for (let keyObject in settings.options.keyboard.main.options) {
      let object = settings.options.keyboard.main.options[keyObject];
      object.target && keysAlreadyExists.push(object.target as number);
    }

    if (keysAlreadyExists.indexOf(code) >= 0x0) {
      toast.error("This key is already in use");
      return;
    }

    show && onSelect && onSelect(code);
    setKeyIn(null);
  };

  const getKeyCharacter = (code: number) => {
    let result = "";
    let chrCode = code - 48 * Math.floor(code / 48);
    let chr = String.fromCharCode(96 <= code ? chrCode : code);

    if (!chr || !chr.toString().match(/^[A-Za-z0-9]+$/)) {
      let valuesKeys: number[] = Object.values(keysKeyboardDefault);
      let indexOfKey: number = valuesKeys.indexOf(code);
      if (indexOfKey >= 0x0) {
        result = Object.keys(keysKeyboardDefault)
          [indexOfKey].toString()
          .toUpperCase();
      }
    } else {
      result = chr;
    }

    return result;
  };

  return active && key_code ? (
    <div
      className={"key-changer" + (show ? " active" : "")}
      onClick={() => key_code !== keyboard.keyInChange && setKeyIn(key_code)}
      tabIndex={0}
      onKeyDown={(e) => changeKey(e.keyCode)}
    >
      {getKeyCharacter(key_code)}
    </div>
  ) : null;
};
