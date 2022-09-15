import { compose, createStore, applyMiddleware } from "redux";
import thunk, { ThunkDispatch } from "redux-thunk";
import { ReducersCollection } from "./reducer.collection";

export const store = createStore(
  ReducersCollection,
  compose(applyMiddleware(thunk)),
);

export type StateInterface = ReturnType<typeof store.getState>;

export interface Action<T = string> {
  type:
    | "UPDATE_GAME_STATE"
    | "UPDATE_CHAT_STATE"
    | "UPDATE_LEADERBOARD_STATE"
    | "UPDATE_STATS_STATE"
    | "UPDATE_SETTINGS_STATE";
  payload: Partial<T>;
}

export type Dispatch<A> = ThunkDispatch<
  StateInterface,
  Record<string, unknown>,
  Action<A>
>;
