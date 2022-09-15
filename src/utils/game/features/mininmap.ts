import { settings } from "../../other/settings_handler";
import { yurex_game, yurex_game_multi } from "../core";
import { multibox_handler } from "../multiplayer_handler";

class MiniMapGame {
  public canvas: HTMLCanvasElement | null;
  public ctx: CanvasRenderingContext2D | null;
  constructor() {
    this.canvas = this.ctx = null;
  }
  public init(): void {
    if (settings.options.general["minimap"]["options"]["showMinimap"].target) {
      this.canvas = document.getElementById(
        "minimap-canvas",
      ) as HTMLCanvasElement;
      let size = 170;
      this.canvas.style.display = "block";
      this.canvas.width = size = settings.options.theme.minimap.options
        .minimapSize.target as number;
      this.canvas.height = size;
      this.ctx = this.canvas.getContext("2d");
    }

    window.requestAnimationFrame(this.draw);
  }

  public draw = () => {
    let game = multibox_handler.multibox ? yurex_game_multi : yurex_game;

    if (settings.options.general["minimap"]["options"]["showMinimap"].target) {
      if (!this.canvas) {
        this.init();
      }

      if (
        game.border.centerX === 0 &&
        game.border.centerY === 0 &&
        this.ctx &&
        this.canvas
      ) {
        let width, height;

        width = height = this.canvas.width;

        this.ctx.clearRect(0, 0, width, height);

        let beginX = 0;
        let beginY = 0;

        this.ctx.save();

        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";

        this.ctx.fillRect(beginX, beginY, width, height);

        this.ctx.globalAlpha = 1;

        let sectorCount = 3;
        let sectorNames = ["ABCDE", "12345"];
        let sectorWidth = width / sectorCount;
        let sectorHeight = height / sectorCount;
        let sectorNameSize = Math.min(sectorWidth, sectorHeight) / 4;

        this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";

        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        this.ctx.font = `${sectorNameSize}px Karla`;

        for (let i = 0; i < sectorCount; i++) {
          let x = sectorWidth / 2 + i * sectorWidth;
          for (let j = 0; j < sectorCount; j++) {
            let y = sectorHeight / 2 + j * sectorHeight;
            this.ctx.fillText(
              `${sectorNames[0][i]}${sectorNames[1][j]}`,
              beginX + x,
              beginY + y,
            );
          }
        }

        this.ctx.lineWidth = 2;

        let myPosX =
          beginX +
          ((game.cameraX + game.border.width / 2) / game.border.width) * width;

        let myPosY =
          beginY +
          ((game.cameraY + game.border.height / 2) / game.border.height) *
            height;

        if (multibox_handler.multibox !== null) {
          // Get exact game to get position details.
          let gameMulti = multibox_handler.multibox
            ? yurex_game
            : yurex_game_multi;

          if (gameMulti.isPlaying) {
            let multiPosX =
              beginX +
              ((gameMulti.cameraX + gameMulti.border.width / 2) /
                gameMulti.border.width) *
                width;
            let multiPosY =
              beginY +
              ((gameMulti.cameraY + gameMulti.border.height / 2) /
                gameMulti.border.height) *
                height;
            // draw mine circle
            this.ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
            this.ctx.fillStyle = "rgba(255,255,255,0.3)" ?? "#FAA";
            this.ctx.beginPath();
            this.ctx.arc(multiPosX, multiPosY, 5, 0, Math.PI * 0x2, false);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
          }
        }

        // draw mine circle
        this.ctx.fillStyle = "rgba(255,255,255,0.3)" ?? "#FAA";
        this.ctx.strokeStyle = "#FFF";
        this.ctx.beginPath();
        this.ctx.arc(myPosX, myPosY, 5, 0, Math.PI * 0x2, false);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
      }
    } else if (this.canvas) {
      this.canvas.style.display = "none";
      this.canvas = null;
    }
    window.requestAnimationFrame(this.draw);
  };
}

export const minimapCanvas = new MiniMapGame();
