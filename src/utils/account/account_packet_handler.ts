import toast from "react-hot-toast";
import { store } from "../../redux";
import { yurex_game } from "../game/core";
import { shields_handler } from "../game/features/shields";
import { initFullGame } from "../game/init_full_game";
import { BinaryReader } from "../other/binary_packet";
import { stats_handler } from "../other/stats_canvas";
import { account_websocket } from "./ws_endpoint_handler";

export const accountPacketHandler = (event: MessageEvent<ArrayBuffer>) => {
  let syncUpdStamp = Date.now();
  let reader = new BinaryReader(new DataView(event.data), 0x0, true);
  let packetId = reader.getUint8();

  try {
    switch (packetId) {
      case 0x0: // remove loader-screen
        store.dispatch({
          type: "UPDATE_GAME_STATE",
          payload: {
            loaded: true,
          },
        });
        
        initFullGame();

        stats_handler.pingAccountLoopId = setInterval(() => {
          account_websocket.sendPacket(new Uint8Array([0x55]));
          stats_handler.pingAccountLoopStamp = Date.now();
        }, 2e3);
        break;
      case 0x1: // Push new shield
        let shield_id = reader.getStringUTF8();
        let shield_data = reader.getStringUTF8();
        shields_handler.setShield(shield_id, shield_data);
        break;
      case 0x2: // change account data
        let account_data = JSON.parse(reader.getStringUTF8());
        let account = window.state.gameReducer?.account;
        if (account_data && account) {
          if (account_data.level > account?.level) {
            toast.success("You've leveled up, Congrats!");
          }
          console.log("[WS_ACCOUNT]: Account Data Received");
          store.dispatch({
            type: "UPDATE_GAME_STATE",
            payload: {
              account: Object.assign({}, account, account_data),
            },
          });
        }
        break;
      case 0x3:
        console.log("[WS_ACCOUNT]: Latency Received");
        stats_handler.account_latency =
          syncUpdStamp - (stats_handler.pingAccountLoopStamp ?? 0x0);
        break;
    }
  } catch (e) {
    console.log(e);
  }
};
