import circleColors from "../../layout/img/colors_wheel.png";

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}
export class ColorPickerHandler {
  private x: number;
  private y: number;
  private canvas: HTMLCanvasElement;
  private circleSize: number;
  private pickerCircleSelectorSize: number;
  private circleImage: HTMLImageElement;
  private ctx: CanvasRenderingContext2D | null;
  private onChangeCallback?: (color: RGBColor | null) => void;
  constructor(target: HTMLCanvasElement, width: number, height: number) {
    this.canvas = target;
    this.canvas.width = width;
    this.canvas.height = height;
    this.circleImage = new Image();
    this.circleSize = this.canvas.width / 2;
    console.log(this.circleImage.width);
    this.ctx = this.canvas.getContext("2d");
    this.x = this.y = this.canvas.width / 2;
    this.pickerCircleSelectorSize = 0x7;
    this.setListeners();
  }
  public initImage() {
    return new Promise((resolve) => {
      this.circleImage.onload = () => {
        resolve(true);
      };
      this.circleImage.src = circleColors;
    });
  }
  public initDraw() {
    if (this.ctx && this.circleImage.src.length) {
      let size = this.circleSize / 1.3;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.save();

      this.ctx.beginPath();
      this.ctx.arc(this.circleSize, this.circleSize, size, 0x0, Math.PI * 0x2);
      this.ctx.strokeStyle = "white";
      this.ctx.closePath();
      this.ctx.clip();

      this.ctx.drawImage(
        this.circleImage,
        this.circleSize / 4.3,
        this.circleSize / 4.3,
        size * 2,
        size * 2,
      );

      this.ctx.beginPath();

      this.ctx.arc(
        this.x,
        this.y,
        this.pickerCircleSelectorSize,
        0x0,
        Math.PI * 0x2,
      );

      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.closePath();

      this.ctx.restore();
    }

    window.requestAnimationFrame(this.initDraw.bind(this));
  }
  public setListeners() {
    let isMouseDown = false;

    const getMousePos = (event: MouseEvent) => {
      let rect = this.canvas.getBoundingClientRect();
      let scaleX = this.canvas.width / rect.width;
      let scaleY = this.canvas.height / rect.height;

      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    };

    const onMouseMove = (event: MouseEvent) => {
      let { x, y } = getMousePos(event);

      if (
        isMouseDown &&
        this.circleSize / 0x3 < x &&
        x < this.circleSize * 1.6 &&
        this.circleSize / 0x3 < y &&
        y < this.circleSize * 1.7
      ) {
        this.x = x;
        this.y = y;

        let color = this.getCurrentColor();
        
        if (color?.r || color?.g || color?.b) {
          this.onChangeCallback?.(color);
        }
      }
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    this.canvas.addEventListener("mousedown", () => {
      isMouseDown = true;
    });

    this.canvas.addEventListener("mousemove", onMouseMove);

    this.canvas.addEventListener("mouseup", onMouseUp);
  }
  public onChange(callback: (color: RGBColor | null) => void) {
    this.onChangeCallback = callback;
  }
  private getCurrentColor() {
    if (this.ctx) {
      let imageData = this.ctx.getImageData(this.x, this.y, 0x1, 0x1);
      return {
        r: imageData.data[0x0],
        g: imageData.data[0x1],
        b: imageData.data[0x2],
      };
    } else {
      return null;
    }
  }
}
