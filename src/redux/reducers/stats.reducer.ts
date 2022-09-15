import { Action } from "..";

export interface PlayersTeam {
  [playerId: string]: {
    score: number;
    name: string;
  };
}

export interface StatsReducer {
  fps: number;
  ping: number;
  players: number;
  score: number;
  account_latency: number;
  team?: {
    color: string;
    players: PlayersTeam;
  };
}

export const statsReducer = (
  state: StatsReducer = {
    fps: 0x0,
    ping: 0x0,
    players: 0x0,
    account_latency: 0x0,
    score: 0x0,
  },
  action: Action<StatsReducer>,
): StatsReducer => {
  switch (action.type) {
    case "UPDATE_STATS_STATE":
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};
