import { Action } from "..";
import { TagPlayerType } from "./game.reducer";

export interface LeaderType {
  name: string;
  tag: TagPlayerType;
  isMine: boolean;
  playerId: string;
  score: number;
}

export interface LeadersReducer {
  leaders: LeaderType[];
}

export const leaderReducer = (
  state: LeadersReducer = {
    leaders: [],
  },
  action: Action<LeadersReducer>,
): LeadersReducer => {
  switch (action.type) {
    case "UPDATE_LEADERBOARD_STATE":
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};
