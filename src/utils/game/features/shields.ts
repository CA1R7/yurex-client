import { qualities, settings } from "../../other/settings_handler";

import defaultShield from "../../../layout/img/hats/default.png";

class HatShields {
  public canvases: {
    [key: string]: {
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D | null;
      default: boolean;
    };
  };
  public shields: { [key: string]: HTMLImageElement };
  public imageSize: number;
  private pi: number;
  private rot: number;
  private rad: number;
  constructor() {
    this.imageSize = 513;
    this.pi = Math.PI;
    this.rot = 0x0;
    this.rad = 0x0;

    this.shields = { default: new Image() };
    this.shields.default.src = defaultShield;

    this.canvases = {};

    setInterval(() => {
      this.rot < 360 ? (this.rot += 1) : (this.rot = 0);
      this.rad = (this.rot * this.pi) / 180;
    }, 40);

    this.loop();
  }

  public setShield(id: string, shield_base64: string) {
    return new Promise((resolve) => {
      if (id === "default") {
        return resolve(false);
      }
      if (!(id in this.canvases)) {
        this.addCanvas(id);
      }
      if (!(id in this.shields)) {
        this.shields[id] = new Image();
        this.shields[id].onload = () => {
          resolve(true);
        };
        this.shields[id].src = shield_base64;
      }
    });
  }

  public addCanvas(id: string, isDefault: boolean = false) {
    if (!(id in this.canvases)) {
      this.canvases[id] = {
        canvas: document.createElement("canvas"),
        default: isDefault,
        ctx: null,
      };
      this.canvases[id].ctx = this.canvases[id].canvas.getContext("2d");
      this.canvases[id].canvas.width = this.imageSize;
      this.canvases[id].canvas.height = this.imageSize;
    }
  }

  public loop() {
    if (
      settings.options.general.cell.options.showHatShield.target &&
      qualities[settings.options.graphics.main.options.quality.target as number] !== "low"
    ) {
      for (let id in this.canvases) {
        let canvas_object = this.canvases[id];
        let ctx = this.canvases[id].ctx;

        if (ctx) {
          ctx.clearRect(0, 0, this.imageSize, this.imageSize);

          let rad = this.rad;

          this.rotate(rad, ctx);

          ctx.drawImage(
            canvas_object.default ? this.shields.default : this.shields[id],
            0,
            0,
            this.imageSize,
            this.imageSize,
          );

          this.rotate(-rad, ctx);
        }
      }

      requestAnimationFrame(this.loop.bind(this));
    }
  }
  private rotate(rad: number, context: CanvasRenderingContext2D) {
    if (context) {
      context.translate(this.imageSize / 2, this.imageSize / 2);
      context.rotate(rad);
      context.translate(-(this.imageSize / 2), -(this.imageSize / 2));
    }
  }
}

export const shields_handler = new HatShields();
