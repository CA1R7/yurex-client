import { Action } from "..";

export interface SettingsReducer {
  active: boolean | null;
  turned_off: boolean;
  current_content: number;
  keyboard: {
    keyInChange: null;
  };
}

export const settingsReducer = (
  state: SettingsReducer = {
    active: null,
    turned_off: false,
    current_content: 0x0,
    keyboard: {
      keyInChange: null,
    },
  },
  action: Action<SettingsReducer>,
): SettingsReducer => {
  switch (action.type) {
    case "UPDATE_SETTINGS_STATE":
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};
