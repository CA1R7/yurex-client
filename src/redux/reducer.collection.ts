import { combineReducers } from "redux";
import { chatReducer } from "./reducers/chat.reducer";
import { gameReducer } from "./reducers/game.reducer";
import { leaderReducer } from "./reducers/leader.reducer";
import { settingsReducer } from "./reducers/settings.reducer";
import { statsReducer } from "./reducers/stats.reducer";

export const ReducersCollection = combineReducers({
  gameReducer,
  chatReducer,
  leaderReducer,
  statsReducer,
  settingsReducer,
});
