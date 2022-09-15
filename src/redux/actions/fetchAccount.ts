import axios from "axios";
import toast from "react-hot-toast";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "..";
import { ENDPOINT } from "../..";
import { AccountType, GameReducer } from "../reducers/game.reducer";

export interface ResponseEndpoint<Y> {
  status: boolean;
  msg?: string;
  content?: Y;
  code?: number;
}

export const fetchAccount = (token: string) => {
  return new Promise<Action<GameReducer> & { pass: boolean; loaded: boolean }>(
    async (resolve) => {
      let payload: Partial<GameReducer> | null = null,
        pass: boolean = true;

      const accountFetch = await axios.request<ResponseEndpoint<AccountType>>({
        url: `${ENDPOINT}/users/me`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      });

      const data = accountFetch.data;

      if (data.status) {
        payload = {
          account: data.content,
        };
      } else {
        if (data.code === 0x2) {
          localStorage.removeItem("token");
        } else if (data.code === 0x1) {
          pass = false;
          payload = {
            error_page_content: {
              title: "System Error",
              msg: "You're banned from this game.",
            },
          };
        }

        toast.error(data.msg ?? "Something went wrong");
      }

      resolve({
        type: "UPDATE_GAME_STATE",
        payload: payload ?? {},
        pass,
        loaded: "account" in (payload ?? {}),
      });
    },
  );
};
