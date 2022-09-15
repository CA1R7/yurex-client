import { customColorBytes } from "../other/color_handler";
import { YurexGame, yurex_game, yurex_game_multi } from "./core";
import { qualities, settings } from "../other/settings_handler";
import { skins_handler } from "../other/skins_handler";
import { shields_handler } from "./features/shields";
import { multibox_handler } from "./multiplayer_handler";
import { jaggedShape } from "./features/jaggedShape";
import { account_websocket } from "../account/ws_endpoint_handler";
import { BinaryWriter } from "../other/binary_packet";
import { TagPlayerType } from "../../redux/reducers/game.reducer";
import { tags_handler } from "../other/tags_handler";

let loadingList: { [key: string]: boolean } = {};

export class Cell {
  public x: number;
  public y: number;
  public s: number;
  public ns: number;
  public ny: number;
  public nx: number;
  public ox: number;
  public oy: number;
  public os: number;
  public id: number;
  public jagged: number;
  public ejected: boolean;
  public color?: string;
  public sColor?: string;
  public name?: string;
  public shield?: string;
  public born: number;
  public destroyed: boolean;
  public dead: number | null;
  public diedBy: number;
  public updated: number | null;
  public nameSize: number;
  public drawNameSize: number;
  public game: YurexGame;
  public mine: boolean;
  public multiMine: boolean;
  public tag: TagPlayerType;
  public player_id?: string | null;
  public skin: string | null;
  constructor(
    game: YurexGame,
    id: number,
    x: number,
    y: number,
    s: number,
    name: string,
    color: string,
    shield: string | null,
    flags: number,
    playerId: string | null,
  ) {
    this.skin = null;
    this.destroyed = false;
    this.game = game;
    this.dead = this.updated = null;
    this.diedBy = this.nameSize = this.drawNameSize = 0x0;
    this.id = id;
    this.tag = { code: null, pin: null };
    this.mine = false;
    this.multiMine = false;
    this.x = this.nx = this.ox = x;
    this.y = this.ny = this.oy = y;
    this.s = this.ns = this.os = s;
    this.setPlayerId(playerId);
    this.setColor(color);
    this.setName(name);
    this.setShield(shield);
    this.jagged = flags & 0x01 || flags & 0x10;
    this.ejected = !!(flags & 0x20);
    this.born = this.game.syncUpdStamp;
  }
  public destroy(killerId: number | null) {
    delete this.game.cells.byId[this.id];

    if (
      this.game.cells.mine.remove(this.id) &&
      this.game.cells.mine.length === 0x0
    ) {
      this.game.isPlaying = false;

      if (!this.game.multiGame) {
        this.game.checkXp();

        console.log("[YUREX_CELL]: Player dead");

        let canPlay = !!(
          yurex_game_multi.isPlaying &&
          settings.options.general.cell.options.playAutomatically.target
        );

        multibox_handler.switch(false, canPlay);

        if (!canPlay) {
          this.game.got_fist_update = false;
          this.game.overlayScreen(true);
        }
      } else {
        console.log("[YUREX_CELL]: Multbiox player dead");
        multibox_handler.switch();
      }
    }

    this.destroyed = true;
    this.dead = this.game.syncUpdStamp;

    if (killerId && !this.diedBy) {
      this.diedBy = killerId;
    }
  }
  public update(relativeTime: number) {
    var dt = (relativeTime - (this.updated ?? 0x0)) / 120; // BETA
    dt = Math.max(Math.min(dt, 1), 0);
    if (this.destroyed && Date.now() > (this.dead ?? 0x0) + 200) {
      this.game.cells.list.remove(this);
    } else if (
      this.diedBy &&
      this.game.cells.byId.hasOwnProperty(this.diedBy)
    ) {
      this.nx = this.game.cells.byId[this.diedBy].x;
      this.ny = this.game.cells.byId[this.diedBy].y;
    }
    this.x = this.ox + (this.nx - this.ox) * dt;
    this.y = this.oy + (this.ny - this.oy) * dt;
    this.s = this.os + (this.ns - this.os) * dt;
    this.nameSize = ~~(~~Math.max(~~(0.3 * this.ns), 24) / 3) * 3;
    this.drawNameSize = ~~(~~Math.max(~~(0.3 * this.s), 24) / 3) * 3;
  }
  public setPlayerId(value: string | null) {
    this.player_id = value ?? null;
  }
  public setColor(value: string) {
    if (value) {
      this.color = customColorBytes(value, 0.9, 0, true);
      this.sColor = "transparent";
    }
  }
  public setTag(value: TagPlayerType) {
    try {
      this.tag = value ?? this.tag;
      if (this.tag.code && this.player_id) {
        if (this.tag.code in tags_handler.tags) {
          tags_handler.tags[this.tag.code].players[this.player_id] = {
            name: "",
            score: 0x0,
          };
        } else {
          tags_handler.addTag(this.tag, this.player_id);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  public setName(value: string) {
    var nameParsed = this.game.parseName(value);
    this.name = nameParsed.name;

    if (nameParsed.tag.code) {
      this.setTag(nameParsed.tag);
    }

    if (nameParsed.skin) {
      this.setSkin(nameParsed.skin);
    }
  }

  public setSkin(value: string) {
    this.skin = value ?? null;
  }

  public setShield(value: string | null) {
    this.shield =
      (value && value[0] === "%" ? value.slice(1) : value) || this.shield;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this.drawShape(ctx);
    this.drawText(ctx);
    ctx.restore();
  }

  private async drawShape(ctx: CanvasRenderingContext2D) {
    this.mine = this.game.cells.mine.indexOf(this.id) !== -1;
    this.multiMine =
      (!this.game.multiGame ? yurex_game_multi : yurex_game).cells.mine.indexOf(
        this.id,
      ) !== -1;

    let color = settings.options.general.cell.options.showColor.target
      ? this.color
      : Cell.prototype.color;

    let strokeColor = settings.options.general.cell.options.showColor.target
      ? this.sColor
      : Cell.prototype.sColor;

    if (this.game.main_ctx && color && strokeColor) {
      this.game.main_ctx.fillStyle = color;
      this.game.main_ctx.strokeStyle = strokeColor;
    }

    ctx.lineWidth = Math.max(~~(this.s / 50), 5);

    if (!this.ejected && 20 < this.s) {
      this.s -= ctx.lineWidth / 2 - 2;
    }

    ctx.beginPath();

    if (this.jagged) {
      if (
        qualities[
          settings.options.graphics.main.options.quality.target as number
        ] === "high"
      ) {
        ctx.fillStyle = "transparent";
        ctx.strokeStyle = "transparent";

        ctx.arc(this.x, this.y, this.s, 0x0, this.game.PI, false);

        ctx.drawImage(
          jaggedShape.canvas,
          this.x - this.s - 8,
          this.y - this.s - 8,
          this.s * 2 + 10,
          this.s * 2 + 10,
        );
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 20;
        ctx.arc(this.x, this.y, this.s, 0, Math.PI * 0x2, false);
      }
    } else {
      // Outer Stroke
      if (
        !settings.options.general.cell.options.showHatShield.target ||
        qualities[
          settings.options.graphics.main.options.quality.target as number
        ] === "low"
      ) {
        if (this.mine && ~~(this.s / 10) > 2) {
          ctx.lineWidth = Math.max(~~(this.s / 4), 10);
          ctx.strokeStyle = settings.options.theme.multibox.options
            .borderColorOn.target as string;
        } else if (this.multiMine) {
          ctx.lineWidth = Math.max(~~(this.s / 4), 10);
          ctx.strokeStyle = settings.options.theme.multibox.options
            .borderColorOff.target as string;
        }
      }

      if (this.color && !this.name && this.s <= 40) {
        let color = settings.options.theme.mass.options.massColor
          .target as string;
        if (
          settings.options.general.main.options.showShadows.target &&
          qualities[
            settings.options.graphics.main.options.quality.target as number
          ] === "high"
        ) {
          ctx.shadowBlur = settings.options.theme.mass.options.shadowSize
            .target as number;
          ctx.shadowColor = color;
        }
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
      }

      ctx.arc(this.x, this.y, this.s, 0x0, this.game.PI, false);
    }

    ctx.closePath();

    if (this.destroyed) {
      ctx.globalAlpha =
        Math.max(200 - Date.now() + (this.dead ?? 0x0), 0) / 100;
    } else {
      ctx.globalAlpha = Math.min(Date.now() - this.born, 200) / 100;
    }

    ctx.fill();

    if (this.jagged) {
      ctx.stroke();
    }

    ctx.shadowBlur = 0;

    let sScaled = this.s * this.game.cameraZ;

    let _skin: HTMLImageElement | null = null;
    let profile = window.state.gameReducer.profile;

    if (profile && settings.options.general.cell.options.showSkins.target) {
      let skinName = null;

      if (this.skin && this.skin in skins_handler.skins_loaded) {
        skinName = this.skin;
      }

      if (skinName) {
        if (!(skinName in skins_handler.skins_loaded)) {
          skins_handler.loadSkinOnce(null, skinName);
        } else {
          let skin = skins_handler.skins_loaded[skinName];
          if (skin && skin.complete && skin.width && skin.height) {
            _skin = skin;
          }
        }
      }
    }

    if (!this.jagged) {
      ctx.save();
      ctx.clip();
      this.game.scaleBack(ctx);
      ctx.drawImage(
        _skin ?? skins_handler.innerShadow,
        this.x * this.game.cameraZ - sScaled,
        this.y * this.game.cameraZ - sScaled,
        (sScaled *= 2),
        sScaled,
      );
      this.game.scaleForth(ctx);
      ctx.restore();
    }

    if (this.mine && yurex_game.crown) {
      ctx.save();
      this.game.scaleBack(ctx);
      let width = (((this.s * this.game.cameraZ) / 2) * 1.5) / 2;
      let xhalf = this.x * this.game.cameraZ - width / 2;
      let height = (width / 1.5 / 2) * 1.6;
      let yhalf = this.y * this.game.cameraZ - height / 2;
      ctx.drawImage(
        yurex_game.crown,
        xhalf,
        yhalf - (this.s * this.game.cameraZ) / 0.7,
        width,
        height,
      );
      this.game.scaleForth(ctx);
      ctx.restore();
    }

    let sc = sScaled * 1.3;

    if (
      this.name &&
      this.shield &&
      qualities[
        settings.options.graphics.main.options.quality.target as number
      ] !== "low" &&
      settings.options.general.cell.options.showHatShield.target &&
      ~~(this.s / 10) > 2
    ) {
      if (
        this.shield !== "default" &&
        !(this.shield in shields_handler.shields)
      ) {
        if (!(this.shield in loadingList)) {
          loadingList[this.shield] = true;
          let writer = new BinaryWriter()
            .setUint8(0x4b)
            .setStringZeroUtf8(this.shield);

          account_websocket.sendPacket(writer.build());
        }
      } else {
        ctx.save();
        this.game.scaleBack(ctx);

        let name_base64 = this.name ? window.btoa(this.name.trim()) : null;

        if (
          this.shield === "default" &&
          name_base64 &&
          !(name_base64 in shields_handler.canvases)
        ) {
          shields_handler.addCanvas(name_base64, true);
        }

        ctx.drawImage(
          shields_handler.canvases[
            this.shield === "default" && name_base64 ? name_base64 : this.shield
          ].canvas,
          this.x * this.game.cameraZ - sc + sc / 2,
          this.y * this.game.cameraZ - sc + sc / 2,
          sc,
          sc,
        );

        this.game.scaleForth(ctx);

        ctx.restore();
      }
    }

    if (!this.ejected && 20 < this.s) {
      this.s += ctx.lineWidth / 2 - 2;
    }
  }
  private drawText(ctx: CanvasRenderingContext2D) {
    if (this.s < 20 || this.jagged) return;
    if (
      settings.options.general.cell.options.showMass.target &&
      (this.game.cells.mine.indexOf(this.id) !== -1 ||
        this.game.cells.mine.length === 0)
    ) {
      var mass = (~~((this.ns * this.ns) / 100)).toString();
      if (this.name && settings.options.general.cell.options.showNames.target) {
        this.game.drawText(
          ctx,
          false,
          this.x,
          this.y,
          this.nameSize,
          this.drawNameSize,
          this.name,
        );
        var y = this.y + Math.max(this.s / 4.5, this.nameSize / 1.5);
        this.game.drawText(
          ctx,
          true,
          this.x,
          y,
          this.nameSize / 2,
          this.drawNameSize / 2,
          mass,
        );
      } else
        this.game.drawText(
          ctx,
          true,
          this.x,
          this.y,
          this.nameSize / 2,
          this.drawNameSize / 2,
          mass,
        );
    } else if (
      this.name &&
      settings.options.general.cell.options.showNames.target
    ) {
      this.game.drawText(
        ctx,
        false,
        this.x,
        this.y,
        this.nameSize,
        this.drawNameSize,
        this.name,
      );
    }
  }
}
