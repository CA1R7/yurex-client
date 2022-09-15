import toast from "react-hot-toast";
import { ENDPOINT } from "../..";
import { store } from "../../redux";
import { BinaryWriter } from "../other/binary_packet";
import { accountPacketHandler } from "./account_packet_handler";

export class WebsocketAccount {
  public ws: WebSocket | null;
  public protocol: string;

  constructor() {
    this.ws = null;
    this.protocol = "https:" == window.location.protocol ? "wss" : "ws";
  }

  public init() {
    this.ws = new WebSocket(
      `${this.protocol}://${ENDPOINT.replace(
        /(https?|\:\/\/|\/)/g,
        "",
      )}/gateaway`,
    );
    this.ws.binaryType = "arraybuffer";
    this.ws.onopen = this.wsOpen;
    this.ws.onmessage = accountPacketHandler;
    this.ws.onerror = this.wsError;
    this.ws.onclose = this.wsClose;
  }
  public sendPacket(packet: Uint8Array) {
    if (this.ws) {
      this.ws.send(packet);
    }
  }
  private wsOpen = () => {
    let account = window.state.gameReducer.account ?? null;
    if (account && account.key && this.ws) {
      console.log("[WS_ACCOUNT]: Connected to Server");
      let bnf = new BinaryWriter();
      bnf.setUint8(254).setStringZeroUtf8(account.key);
      this.sendPacket(bnf.build());
    }
  };
  private wsError = (error: Event) => {
    console.log("[WS_ACCOUNT]: " + error);
  };
  private wsClose = (event: CloseEvent) => {
    console.log("[WS_ACCOUNT]: Connection Closed");
    this.ws = null;

    if (event.code === 1e3 || event.code === 0x3f6) {
      let message: string = "";

      if (event.reason) {
        switch (event.reason) {
          case "IP limit reached":
            message = "IP limit reached";
            break;
          case "No slots":
            message = "You can't access to the website currently, try later";
            break;
          case "Invalid key":
            message = "Couldn't handle your key access";
        }
      }

      if (message) {
        store.dispatch({
          type: "UPDATE_GAME_STATE",
          payload: {
            error_page_content: {
              title: "System Message",
              msg: message,
            },
          },
        });
      } else {
        setTimeout(() => {
          this.init();
        }, 2e3);
      }
    } else if (event.reason) {
      toast.error(event.reason);
    }
  };
}

export const account_websocket = new WebsocketAccount();
