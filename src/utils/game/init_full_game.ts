import toast from "react-hot-toast";
import { keyboard_handler } from "../other/keyboard_handler";
import { mouse_movement_handler } from "../other/mouse_movement_handler";
import { yurex_game, yurex_game_multi } from "./core";
import { minimapCanvas } from "./features/mininmap";

export const initFullGame = async () => {
  // Init Main Game
  yurex_game.init();

  // Init Multi Game
  yurex_game_multi.init();

  // Update mouse movement of the server
  mouse_movement_handler.init();

  // Init keyboard watchers
  keyboard_handler.init();

  // Init minimap
  minimapCanvas.init();

  toast.success("Game loaded, You're ready to play!");

  yurex_game.connect("localhost:3333");
};
