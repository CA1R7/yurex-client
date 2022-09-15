import toast from "react-hot-toast";
import { BinaryWriter } from "../other/binary_packet";
import { keyboard_handler } from "../other/keyboard_handler";
import { yurex_game, yurex_game_multi } from "./core";
import { WebsocketHandler } from "./wshandler";

export class MultiCell {
  public multibox: boolean | null;
  constructor() {
    this.multibox = null;
  }
  public switch(toMulti: boolean = false, dontPlay: boolean = false) {
    if (!yurex_game.isPlaying && toMulti) {
      return toast.error("You can't switch to multi mode");
    }

    this.multibox = toMulti;
    yurex_game.enabled = !toMulti;
    yurex_game_multi.enabled = toMulti;

    if (!toMulti) {
      yurex_game.setVisibility(false);
      yurex_game_multi.setVisibility(true);
      dontPlay && yurex_game.play();
    } else {
      yurex_game_multi.setVisibility(false);
      yurex_game.setVisibility(true);
      yurex_game_multi.play();
    }
  }
}

export const multibox_handler = new MultiCell();
