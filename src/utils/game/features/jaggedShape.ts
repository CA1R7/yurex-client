import JaggedImage from "../../../layout/img/jagged.png";
import { qualities, settings } from "../../other/settings_handler";

class JaggedShape {
  outer: HTMLImageElement;
  imageSize: number;
  halfSize: number;
  pi: number;
  rot: number;
  rad: number;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  constructor() {
    this.outer = new Image();

    this.outer.src = JaggedImage;

    this.imageSize = 512;

    this.halfSize = this.imageSize / 2;

    this.pi = Math.PI;
    this.rot = 0;
    this.rad = 0;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = this.canvas.height = this.imageSize;

    setInterval(() => {
      this.rot < 360 ? (this.rot += 0.3) : (this.rot = 0);
      this.rad = (this.rot * this.pi) / 180;
    }, 40);

    this.loop();
  }

  public loop() {
    if (
      !this.ctx ||
      qualities[
        settings.options.graphics.main.options.quality.target as number
      ] !== "high"
    ) {
      return;
    }

    this.ctx.clearRect(0, 0, this.imageSize, this.imageSize);

    let rad = this.rad;

    this.rotate(rad);

    this.ctx.drawImage(this.outer, 0, 0, this.imageSize, this.imageSize);

    this.rotate(-rad);

    requestAnimationFrame(this.loop.bind(this));
  }

  private rotate(rad: number) {
    if (!this.ctx) {
      return;
    }
    this.ctx.translate(this.imageSize / 2, this.imageSize / 2);
    this.ctx.rotate(rad);
    this.ctx.translate(-(this.imageSize / 2), -(this.imageSize / 2));
  }
}

export const jaggedShape = new JaggedShape();
