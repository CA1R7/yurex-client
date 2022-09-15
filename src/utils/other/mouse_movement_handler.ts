import { WheelEventType, yurex_game, yurex_game_multi } from "../game/core";
import { multibox_handler } from "../game/multiplayer_handler";

export class MouseMovementHandler {
  constructor() {}
  public init(): void {
    this.sendMovement();

    if (/firefox/i.test(navigator.userAgent)) {
      document.addEventListener("DOMMouseScroll", this.handleScroll, false);
    } else {
      document.body.onmousewheel = this.handleScroll;
    }
  }
  private handleScroll(event: WheelEvent | Event): void {
    if (window.state.gameReducer.escOverlayShown) {
      return;
    }
    if (multibox_handler.multibox) {
      yurex_game_multi.handleScroll(event as unknown as WheelEventType);
    } else {
      yurex_game.handleScroll(event as unknown as WheelEventType);
    }
  }

  private sendMovement(): void {
    setInterval(() => {
      if (multibox_handler.multibox) {
        if (yurex_game_multi.main_canvas) {
          yurex_game_multi.sendMouseMove(
            (yurex_game_multi.mouseX - yurex_game_multi.main_canvas.width / 2) /
              yurex_game_multi.cameraZ +
              yurex_game_multi.cameraX,
            (yurex_game_multi.mouseY -
              yurex_game_multi.main_canvas.height / 2) /
              yurex_game_multi.cameraZ +
              yurex_game_multi.cameraY,
          );
        }
      } else {
        if (yurex_game.main_canvas) {
          yurex_game.sendMouseMove(
            (yurex_game.mouseX - yurex_game.main_canvas.width / 2) /
              yurex_game.cameraZ +
              yurex_game.cameraX,
            (yurex_game.mouseY - yurex_game.main_canvas.height / 2) /
              yurex_game.cameraZ +
              yurex_game.cameraY,
          );
        }
      }
    }, 40);
  }
}

export const mouse_movement_handler = new MouseMovementHandler();
