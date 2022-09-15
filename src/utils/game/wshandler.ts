import { BinaryWriter } from "../other/binary_packet";
import { YurexGame, yurex_game, yurex_game_multi } from "./core";
import { gamePacketHandler } from "./game_packet_handler";
import { multibox_handler } from "./multiplayer_handler";

export class WebsocketHandler {
  public ws_url: string | null;
  public ws: WebSocket | null;
  public protocol: string;
  private game: YurexGame;
  public pid: string | null;
  public cache: {
    SEND_254: Uint8Array;
    SEND_255: Uint8Array;
    UINTS8: {
      [key: number]: Uint8Array;
    };
  };
  private disconnectDelay: number;
  private multibox_connection: boolean;
  constructor(game: YurexGame, multi: boolean) {
    this.game = game;
    this.multibox_connection = multi;
    this.ws = null;
    this.ws_url = null;
    this.pid = null;
    this.disconnectDelay = 0x0;
    this.protocol = "https:" == window.location.protocol ? "wss" : "ws";
    this.cache = {
      SEND_254: new Uint8Array([254, 6, 0, 0, 0]),
      SEND_255: new Uint8Array([255, 1, 0, 0, 0]),
      UINTS8: {
        1: new Uint8Array([1]),
        17: new Uint8Array([17]),
        21: new Uint8Array([21]),
        18: new Uint8Array([18]),
        19: new Uint8Array([19]),
        22: new Uint8Array([22]),
        23: new Uint8Array([23]),
        24: new Uint8Array([24]),
        254: new Uint8Array([254]),
      },
    };
  }
  public init = (url: string): void => {
    this.cleanup();
    this.ws_url = this.ws_url;
    this.ws = new WebSocket(`${this.protocol}://${(this.ws_url = url)}`);
    this.ws.binaryType = "arraybuffer";
    this.ws.onopen = this.wsOpen;
    this.ws.onmessage = (event) => gamePacketHandler(event, this.game);
    this.ws.onerror = this.wsError;
    this.ws.onclose = this.wsClose;
  };
  public cleanup(): void {
    if (this.ws) {
      console.log("Websocket connection cleaned");
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
  }
  private wsOpen = () => {
    this.disconnectDelay = 1000;
    this.sendpacket(this.cache.SEND_254);
    this.setUserKey();
    this.sendpacket(this.cache.SEND_255);
    this.setTag();
    console.log(`Websocket Server Connected`);
  };
  private setTag() {
    let tag = window.state.gameReducer.profile.tag;
    if (tag?.code) {
      let tag_data = new BinaryWriter();
      tag_data.setUint8(0x4b);
      tag_data.setStringUTF8(tag.code);
      tag_data.setStringUTF8(String(tag.pin ?? 0x0));
      this.sendpacket(tag_data);
    }
  }
  private setUserKey() {
    if (this.pid) {
      let key_data = new BinaryWriter();
      key_data.setUint8(0x4b);
      key_data.setStringZeroUtf8(this.pid);
      this.sendpacket(key_data);
    }
  }

  private wsError(error: Event) {
    console.error(error);
  }
  private wsClose = (error: CloseEvent) => {
    console.error(
      `[WSHANDLER]: server disconnected ${error.code} '${error.reason}'`,
    );
    this.cleanup();
    yurex_game.gameReset();
    setTimeout(() => {
      if (!this.ws_url) {
        return;
      }
      this.init(this.ws_url);
    }, (this.disconnectDelay *= 1.5));
  };
  public sendpacket(data: Uint8Array | BinaryWriter) {
    if (this.ws) {
      if (this.ws.readyState !== 1) {
        return;
      }
      if ("build" in data && data.build) {
        this.ws.send(data.build());
      } else {
        this.ws.send(data as Uint8Array);
      }
    }
  }
}
