import { shields_handler } from "../game/features/shields";
import { qualities, settings } from "./settings_handler";
import { skins_handler } from "./skins_handler";

class SkinsPreviewCanvas {
  public canvas: HTMLCanvasElement | null;
  public ctx?: CanvasRenderingContext2D | null;
  public size: number;
  public shieldSaved: boolean | null;
  constructor() {
    this.size = 0x0;
    this.canvas = null;
    this.shieldSaved = null;
  }
  public init() {
    this.canvas = document.querySelector("#skin-preview") as HTMLCanvasElement;

    if (this.canvas) {
      this.ctx = this.canvas.getContext("2d");
      this.canvas.width = window.innerWidth / 0x3;
      this.canvas.height = window.innerWidth / 0x3;
    }

    this.size = this.canvas.width / 1.5;

    if (this.ctx) {
      window.requestAnimationFrame(this.loop.bind(this));
    }
  }

  public draw_skin_path(image: HTMLImageElement, isMulti: boolean = false) {
    this.ctx?.save();

    if (!this.canvas || !this.ctx) {
      return;
    }

    if (isMulti) {
      this.ctx?.translate(this.size, 0);
      this.ctx?.scale(-1, 1);
    }

    let x = this.canvas.width / 2;
    let y = this.canvas.height / 2;

    this.ctx?.beginPath();

    this.rotate((90 * Math.PI) / 180);

    this.ctx?.arc(
      x,
      y + (isMulti ? this.size / 2 : 0),
      this.size / 2,
      Math.PI,
      0x0,
      true,
    );

    this.rotate(-((90 * Math.PI) / 180));

    this.ctx?.closePath();
    this.ctx?.clip();

    this.ctx?.drawImage(
      image,
      x - (this.size / 2) * (isMulti ? 2 : 1),
      y - this.size / 2,
      this.size,
      this.size,
    );

    this.ctx?.restore();
  }

  private async loop() {
    if (
      this.canvas &&
      this.ctx &&
      window.state.gameReducer.escOverlayShown &&
      (this.shieldSaved === null || this.shieldSaved)
    ) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = "rgba(255,255,255,0.1)";

      this.ctx.arc(
        this.canvas.width / 2,
        this.canvas.height / 2,
        this.size / 2,
        Math.PI * 2,
        0,
        true,
      );

      this.ctx.fill();

      skins_handler.primarySkin in skins_handler.skins_loaded &&
        this.draw_skin_path(
          skins_handler.skins_loaded[skins_handler.primarySkin],
        );

      skins_handler.multiSkin in skins_handler.skins_loaded &&
        this.draw_skin_path(
          skins_handler.skins_loaded[skins_handler.multiSkin],
          true,
        );

      let shield = window.state.gameReducer?.profile.shield;

      if (
        shield &&
        settings.options.general.cell.options.showHatShield.target &&
        window.state.gameReducer.account &&
        qualities[
          settings.options.graphics.main.options.quality.target as number
        ] !== "low"
      ) {
        let _canvas = null;
        let account = window.state.gameReducer.account;
        if (
          shield in account.inventory.shields &&
          !(shield in shields_handler.canvases)
        ) {
          await shields_handler.setShield(
            shield,
            account.inventory.shields[shield].data,
          );
        } else if (shield === "default") {
          let name_base64 = window.btoa(account.username);

          if (!(name_base64 in shields_handler.canvases)) {
            shields_handler.addCanvas(name_base64, true);
          }

          _canvas = shields_handler.canvases[name_base64].canvas;
        } else {
          _canvas = shields_handler.canvases[shield].canvas;
        }

        let width = this.size * 1.3;
        let height = this.size * 1.3;

        if (_canvas) {
          this.shieldSaved = true;
          this.ctx.drawImage(
            _canvas,
            this.canvas.width / 2 - width / 0x2,
            this.canvas.height / 2 - height / 0x2,
            width,
            height,
          );
        }
      } else {
        this.shieldSaved = false;
      }
    }

    window.requestAnimationFrame(this.loop.bind(this));
  }

  public rotate(rat: number) {
    if (this.canvas) {
      this.ctx?.translate(this.canvas.width / 0x2, this.canvas.width / 0x2);
      this.ctx?.rotate(rat);
      this.ctx?.translate(
        -(this.canvas.width / 0x2),
        -(this.canvas.width / 0x2),
      );
    }
  }
}

export const skins_preview = new SkinsPreviewCanvas();
