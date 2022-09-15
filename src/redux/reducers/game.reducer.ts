import { Action } from "..";

export interface ShieldType {
  data: string;
  path: string;
  pid: string;
}

export interface AccountType {
  pid: string;
  discriminator: string;
  username: string;
  banner_color: string;
  email: string;
  discord_id: string;
  createdAt: number;
  balance: number;
  lastBalance: number;
  lastLogin: number;
  level: number;
  avatar: string | null;
  banner: string | null;
  banned: boolean;
  xp: number;
  key: string | null;
  verified: boolean;
  totalXp: number;
  inventory: InventoryAccountType;
}

export interface InventoryAccountType {
  shields: { [id: string]: ShieldType };
}
export interface TagPlayerType {
  code: string | null;
  pin: number | null;
}

export interface GameReducer {
  picker: boolean;
  error_page_content?: {
    title: string;
    msg: string;
  };
  escOverlayShown: boolean;
  loaded: boolean;
  profile: {
    skin: string;
    skinMultibox: string;
    shield: string;
    tag?: TagPlayerType;
  };
  account?: AccountType;
}

export const gameReducer = (
  state: GameReducer = {
    picker: false,
    escOverlayShown: true,
    loaded: false,
    profile: {
      skin: "https://i.imgur.com/pbItPlb.jpg",
      skinMultibox: "https://i.imgur.com/bPH358L.jpg",
      shield: "default",
      tag: {
        code: null,
        pin: null,
      },
    },
  },
  action: Action<GameReducer | boolean>,
): GameReducer => {
  switch (action.type) {
    case "UPDATE_GAME_STATE":
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};
