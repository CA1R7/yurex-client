import { StateInterface, store } from "../../redux";
import { yurex_game, yurex_game_multi } from "../game/core";
import { multibox_handler } from "../game/multiplayer_handler";
import { settings } from "./settings_handler";

export class KeyboardHandler {
  public keys_pressed: {
    [key: string]: boolean;
  };
  constructor() {
    this.keys_pressed = {
      e: false,
      w: false,
      q: false,
      tab: false,
      space: false,
      entre: false,
      esc: false,
      d: false,
      a: false,
      c: false,
    };
    this.up = this.up.bind(this);
    this.down = this.down.bind(this);
  }
  public init(): void {
    window.onkeyup = this.up;
    window.onkeydown = this.down;
  }

  public getChatCode(key: string): number {
    let code = 0x0;
    if (key in settings.options.keyboard.main.options) {
      code = settings.options.keyboard.main.options[key].target as number;
    }
    return code;
  }

  public down(event: KeyboardEvent): void {
    try {
      if (!settings.options.keyboard) return;

      const {
        gameReducer: { escOverlayShown },
        chatReducer: { chat_input, isTyping },
      } = (window as any).state as StateInterface;

      const _yurex_game = !multibox_handler.multibox
        ? yurex_game
        : yurex_game_multi;

      const split = () => {
        _yurex_game.wshandler.sendpacket(
          _yurex_game.wshandler.cache.UINTS8[17],
        );
      };
      switch (event.keyCode) {
        case 65: // a
          if (this.keys_pressed.a) {
            break;
          }
          this.keys_pressed.a = true;
          for (let b = 0; b < 4; b++) {
            setTimeout(split, b * 20);
          }
          break;
        case 68: // d
          if (this.keys_pressed.d) {
            break;
          }
          this.keys_pressed.d = true;
          split();
          for (let b = 0; b < 16; b++) {
            setTimeout(split, b * 50);
          }
          break;
        case 67: // c
          if (this.keys_pressed.c) {
            break;
          }
          this.keys_pressed.c = true;
          split();
          for (let b = 0; b < 32; b++) {
            setTimeout(split, b * 50);
          }
          break;
        case 0xd: // enter
          if (!escOverlayShown && !this.keys_pressed.entre) {
            store.dispatch({
              type: "UPDATE_CHAT_STATE",
              payload: {
                chat_input: !chat_input,
              },
            });
            this.keys_pressed.entre = true;
          }
          break;
        case 27: // ESC - you can't change it
          if (this.keys_pressed.esc) {
            break;
          }
          this.keys_pressed.esc = true;

          if (window.state.settingsReducer.active) {
            store.dispatch({
              type: "UPDATE_SETTINGS_STATE",
              payload: {
                turned_off: true,
              },
            });
          } else {
            store.dispatch({
              type: "UPDATE_GAME_STATE",
              payload: {
                escOverlayShown: !escOverlayShown,
              },
            });
          }

          break;
        case this.getChatCode("e"):
          if (escOverlayShown || isTyping) {
            break;
          }
          this.keys_pressed.e = true;
          _yurex_game.wshandler.sendpacket(
            _yurex_game.wshandler.cache.UINTS8[21],
          );
          break;
        case this.getChatCode("tab"):
          event.preventDefault();
          if (escOverlayShown || isTyping || this.keys_pressed.tab) {
            break;
          }
          this.keys_pressed.tab = true;
          multibox_handler.switch(!multibox_handler.multibox);
          break;
        case this.getChatCode("w"):
          if (escOverlayShown || isTyping || this.keys_pressed.w) {
            break;
          }
          this.keys_pressed.w = true;
          _yurex_game.wshandler.sendpacket(
            _yurex_game.wshandler.cache.UINTS8[21],
          );

          break;
        case this.getChatCode("space"):
          if (escOverlayShown || isTyping || this.keys_pressed.space) {
            break;
          }

          this.keys_pressed.space = true;

          split();
          break;
      }
    } catch (e) {
      console.error(e);
    }
  }
  public up(event: KeyboardEvent): void {
    if (!settings.options.keyboard) return;
    switch (event.keyCode) {
      case 65:
        this.keys_pressed.a = false;
        break;
      case 68:
        this.keys_pressed.d = false;
        break;
      case 67:
        this.keys_pressed.c = false;
        break;
      case 0xd: // enter
        this.keys_pressed.entre = false;
        break;
      case this.getChatCode("e"):
        this.keys_pressed.e = false;
        break;
      case this.getChatCode("space"):
        this.keys_pressed.space = false;
        break;
      case this.getChatCode("tab"):
        event.preventDefault();
        this.keys_pressed.tab = false;
        break;
      case this.getChatCode("w"):
        this.keys_pressed.w = false;
        break;
      case 27: // esc
        this.keys_pressed.esc = false;
        break;
    }
  }
}

export const keyboard_handler = new KeyboardHandler();
