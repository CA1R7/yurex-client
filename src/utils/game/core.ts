import { cache_handler } from "../other/cache_handler";
import { Cell } from "./cell";
import { qualities, settings } from "../other/settings_handler";
import { BinaryWriter } from "../other/binary_packet";
import { WebsocketHandler } from "./wshandler";
import { stats_handler } from "../other/stats_canvas";
import { drawBackgroundGrid } from "./features/backgroundgrid";
import { store } from "../../redux";
import { gameId } from "../../main/EntryGame";
import corwnImage from "../../layout/img/own_crown.png";
import { TagPlayerType } from "../../redux/reducers/game.reducer";
import { tags_handler } from "../other/tags_handler";
import { StatsReducer } from "../../redux/reducers/stats.reducer";
import { skins_handler } from "../other/skins_handler";
import toast from "react-hot-toast";

export type WheelEventType = WheelEvent & { wheelDelta: number };

export interface CellsConstantType {
  mine: number[];
  byId: {
    [id: number]: Cell;
  };
  list: Cell[];
}

export class YurexGame {
  public main_canvas: HTMLCanvasElement | null;
  public main_ctx: CanvasRenderingContext2D | null;
  public mouseZ: number;
  public mouseX: number;
  public mouseY: number;
  public cameraY: number;
  public background: HTMLImageElement;
  public crown?: HTMLImageElement;
  public cameraX: number;
  public cameraZ: number;
  public targetX: number;
  public targetY: number;
  public cameraZInvd: number;
  public targetZ: number;
  public viewMult: number;
  public syncUpdStamp: number;
  public syncAppStamp: number;
  public PI: number;
  public cells: CellsConstantType;
  public mapCenterSet: boolean;
  public gameId: number;
  public multiGame: boolean;
  public timesFrames: number[];
  public spectating: boolean;
  public isPlaying: boolean;
  public enabled: boolean;
  public got_fist_update: boolean;
  public wshandler: WebsocketHandler;
  public border: {
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  };
  constructor(multi: boolean = false) {
    this.timesFrames = [];
    this.got_fist_update = false;
    this.spectating = false;
    this.isPlaying = false;
    this.wshandler = new WebsocketHandler(this, multi);
    this.gameId = Math.round(Math.random() * Date.now());
    this.background = new Image();
    this.multiGame = multi;
    this.enabled = !multi;
    this.mapCenterSet = false;
    this.border = {
      left: -2000,
      right: 2000,
      top: -2000,
      bottom: 2000,
      width: 4000,
      height: 4000,
      centerX: -1,
      centerY: -1,
    };
    this.syncUpdStamp = Date.now();
    this.syncAppStamp = Date.now();
    this.cameraX = this.cameraY = this.targetX = this.targetY = 0x0;
    this.mouseX = this.mouseY = NaN;
    this.mouseZ =
      this.viewMult =
      this.cameraZ =
      this.cameraZInvd =
      this.targetZ =
        0x1;
    this.main_canvas = null;
    this.main_ctx = null;
    this.PI = Math.PI * 2;
    this.cells = {
      mine: [],
      byId: {},
      list: [],
    };

    if (!multi) {
      this.crown = new Image();
      this.crown.src = corwnImage;
    }
  }
  public init(): void {
    this.main_canvas = document.getElementById(
      "main-canvas",
    ) as HTMLCanvasElement;
    this.main_ctx = this.main_canvas?.getContext("2d") ?? null;
    this.main_canvas.focus();
    this.main_canvas.width = window.innerWidth;
    this.main_canvas.height = window.innerHeight;

    this.viewMult = Math.sqrt(
      Math.min(this.main_canvas.height / 1080, this.main_canvas.width / 1920),
    );

    this.wshandler.pid = gameId;

    !this.multiGame && this.setMouseWatcher();

    window.requestAnimationFrame(this.drawGame);
  }
  public setVisibility(enabled: boolean) {
    if (this.main_canvas) {
      if (enabled) {
        this.enabled = false;
      } else {
        this.enabled = true;
        this.setMouseWatcher();
      }
    }
  }

  private setMouseWatcher = () => {
    this.main_canvas &&
      (this.main_canvas.onmousemove = (event) => {
        if (this.enabled) {
          this.mouseX = event.clientX;
          this.mouseY = event.clientY;
        }
      });
  };

  public connect(url: string) {
    if (!this.multiGame) {
      this.wshandler.init(url);
      yurex_game_multi.wshandler.init(url);
    }
  }

  public checkMyTag(tag_user: TagPlayerType) {
    let { tag } = window.state.gameReducer.profile;
    if (tag && tag_user) {
      tags_handler.addTag(tag_user);
      return !!(tag.code === tag_user.code && tag.pin === tag_user.pin);
    }
    return false;
  }

  public checkXp() {
    let account = window.state.gameReducer?.account;
    if (account && account?.key) {
      let writer = new BinaryWriter();
      writer.setUint8(0x55);
      writer.setStringZeroUtf8(account.key);
      this.wshandler.sendpacket(writer);
    }
  }

  public parseTagString(value: string): TagPlayerType | null {
    try {
      let tagArray: string[] = value.split("_");
      let tag: TagPlayerType = { code: null, pin: null };

      if (tagArray[0x0]) {
        tag.code = tagArray[0x0];
      }

      if (tagArray[0x1]) {
        tag.pin = parseInt(tagArray[0x1]);
      }

      if (Object.keys(tag).length !== 0x0) {
        return tag;
      }
    } catch (e) {
      console.log(e);
    }
    return null;
  }

  public parseName(_name: string) {
    let name = _name;
    let skin: string | null = null;
    let nameTag = /\{([\w\W]+)\}/.exec(name);
    let nameSkin = /\[([\w\W]+)\]/.exec(name);
    let tag: TagPlayerType = { code: null, pin: null };

    if (tag.code === null && nameTag !== null) {
      name = _name.replace(nameTag[0], "").trim();
      if (/\{([A-Za-z0-9_]+)\}/g.test(_name)) {
        tag = this.parseTagString(nameTag[1]) ?? tag;
      }
    }

    if (nameSkin !== null) {
      name = name.replace(nameSkin[0], "").trim();
      skin = nameSkin[1].trim();
    }

    return { name, tag, skin };
  }

  public getNamePlayer() {
    let randomId = Math.round(Math.random() * 100000);
    let target: string = "Guest" + randomId;

    try {
      let {
        gameReducer: {
          profile: { shield, tag },
          account,
        },
      } = window.state;

      if (account && account?.username) {
        target = account?.username;
      }

      if (account && shield && shield.length > 0) {
        // Shield
        target = `<${shield}>${target}`;
      }

      if (tag && tag.code && tag.code.length >= 0) {
        // Team Tag
        target += `{${tag.code}_${tag.pin ?? randomId}}`;
      }

      if (
        this.multiGame &&
        skins_handler.multiSkin in skins_handler.skins_loaded
      ) {
        target += `[${skins_handler.multiSkin}]`; // Local Skin
      } else if (
        !this.multiGame &&
        skins_handler.primarySkin in skins_handler.skins_loaded
      ) {
        target += `[${skins_handler.primarySkin}]`;
      }
    } catch (e) {
      console.error(e);
    }

    return target;
  }

  public overlayScreen = (active: boolean) => {
    store.dispatch({
      type: "UPDATE_GAME_STATE",
      payload: {
        escOverlayShown: active,
      },
    });
  };

  public spectate() {
    if (!this.isPlaying) {
      this.spectating = true;
      this.wshandler.sendpacket(this.wshandler.cache.UINTS8[0x1]);
      stats_handler.maxScore = 0x0;
      this.overlayScreen(false);
    } else {
      toast.error("You can't spectate while you playing");
    }
  }

  public play() {
    if (this.spectating) {
      this.gameReset();
      this.setMouseWatcher();
      this.spectating = false;
    }

    let writer = new BinaryWriter(true);
    writer.setUint8(0x00);
    writer.setStringUTF8(this.getNamePlayer());
    this.wshandler.sendpacket(writer);
    this.isPlaying = true;
    this.overlayScreen(false);
  }

  private cellSort(a: Cell, b: Cell) {
    return a.s === b.s ? a.id - b.id : a.s - b.s;
  }

  public drawGame = (): void => {
    try {
      if (!this.main_canvas || !this.main_ctx) {
        throw new Error("Canvas or context is null");
      }

      if (this.got_fist_update && window.state.gameReducer.escOverlayShown) {
        window.requestAnimationFrame(this.drawGame);
        return;
      }

      if (this.enabled) {
        const now = performance.now();

        while (
          this.timesFrames.length > 0 &&
          this.timesFrames[0] <= now - 1000
        ) {
          this.timesFrames.shift();
        }

        this.timesFrames.push(now);

        stats_handler.framesPerSecond = this.timesFrames.length;
      }

      this.syncAppStamp = Date.now();

      let drawList = null;

      if (this.enabled) {
        drawList = this.cells.list.slice(0).sort(this.cellSort);

        for (let i = 0, l = drawList.length; i < l; i++) {
          drawList[i].update(this.syncAppStamp);
        }
      }

      this.cameraUpdate();

      if (this.enabled) {
        this.main_ctx.save();

        this.main_ctx.fillStyle = settings.options.theme.background.options
          .backgroundColor.target as string;

        this.main_ctx.fillRect(
          0,
          0,
          this.main_canvas.width,
          this.main_canvas.height,
        );

        this.toCamera(this.main_ctx);

        if (settings.options.general.main.options.showGrid.target) {
          drawBackgroundGrid(this);
        }

        if (drawList && drawList.length) {
          this.got_fist_update = true;
          for (let i = 0, l = drawList.length; i < l; i++) {
            drawList[i].draw(this.main_ctx);
          }
        }

        this.fromCamera(this.main_ctx);

        this.main_ctx.scale(this.viewMult, this.viewMult);
      }

      let _state: Partial<StatsReducer> = {};

      if (this.enabled) {
        if (stats_handler.framesPerSecond !== window.state.statsReducer.fps) {
          _state.fps = stats_handler.framesPerSecond;
        }

        if (stats_handler.latency !== window.state.statsReducer.ping) {
          _state.ping = stats_handler.latency;
        }

        if (
          stats_handler.score &&
          stats_handler.score !== window.state.statsReducer.score
        ) {
          _state.score = stats_handler.score;
        }
      }

      if (
        stats_handler.account_latency !==
        window.state.statsReducer.account_latency
      ) {
        _state.account_latency = stats_handler.account_latency;
      }

      let players = stats_handler.info?.playersAlive ?? 0x0;

      if (players !== window.state.statsReducer.players) {
        _state.players = players;
      }

      let { tag } = window.state.gameReducer.profile;

      if (
        this.enabled &&
        tag &&
        tag.code &&
        tag.code in tags_handler.tags &&
        Object.keys(tags_handler.tags[tag.code].players).length > 0
      ) {
        _state.team = {
          color: tags_handler.tags[tag.code].color,
          players: tags_handler.tags[tag.code].players,
        };
      }

      store.dispatch({
        type: "UPDATE_STATS_STATE",
        payload: _state,
      });

      this.main_ctx.restore();

      cache_handler.cacheCleanup();

      window.requestAnimationFrame(this.drawGame);
    } catch (e) {
      console.error(e);
    }
  };

  private cameraUpdate() {
    let myCells = [];

    if (this.enabled && this.spectating) {
      let leaders = window.state.leaderReducer.leaders;
      if (leaders.length > 0) {
        let king_id = leaders[0].playerId;

        if (king_id) {
          for (let cell_id in this.cells.byId) {
            let cell = this.cells.byId[cell_id];

            if (cell.player_id === king_id) {
              myCells.push(cell);
              break;
            }
          }
        }
      }
    } else {
      for (let i = 0x0; i < this.cells.mine.length; i++) {
        if (this.cells.byId.hasOwnProperty(this.cells.mine[i])) {
          myCells.push(this.cells.byId[this.cells.mine[i]]);
        }
      }
    }

    if (myCells.length > 0x0) {
      let x = 0x0,
        y = 0x0,
        s = 0x0,
        score = 0x0,
        l,
        i = 0x0;

      for (l = myCells.length; i < l; i++) {
        let cell = myCells[i];
        score += ~~((cell.ns * cell.ns) / 1e2);
        x += cell.x;
        y += cell.y;
        s += cell.s;
      }

      this.targetX = x / l;
      this.targetY = y / l;
      this.targetZ = Math.pow(Math.min(64 / s, 0x1), 0.4);
      this.cameraX += (this.targetX - this.cameraX) / 0x2;
      this.cameraY += (this.targetY - this.cameraY) / 0x2;
      if (!this.spectating) {
        stats_handler.score = score;
        stats_handler.maxScore = Math.max(stats_handler.maxScore, score);
      }
    } else {
      stats_handler.score = NaN;
      stats_handler.maxScore = 0;
      this.cameraX += (this.targetX - this.cameraX) / 20;
      this.cameraY += (this.targetY - this.cameraY) / 20;
    }
    this.cameraZ +=
      (this.targetZ * this.viewMult * this.mouseZ - this.cameraZ) / 9;
    this.cameraZInvd = 1 / this.cameraZ;
  }

  public cleanupObject<I = any>(object: I) {
    for (let i in object) {
      delete object[i];
    }
  }
  public gameReset() {
    this.cleanupObject<CellsConstantType>(this.cells);
    this.cleanupObject(this.border);
    stats_handler.cleanup();
    this.cells.mine = [];
    this.cells.byId = {};
    this.cells.list = [];
    this.cameraX = this.cameraY = this.targetX = this.targetY = 0x0;
    this.cameraZ = this.targetZ = 0x1;
    this.mapCenterSet = false;
  }
  public sendMouseMove(x: number, y: number) {
    let writer = new BinaryWriter(true);
    writer.setUint8(0x10);
    writer.setUint32(x);
    writer.setUint32(y);
    writer._b.push(0x0, 0x0, 0x0, 0x0);
    this.wshandler.sendpacket(writer);
  }
  public toCamera(ctx: CanvasRenderingContext2D) {
    if (this.main_canvas) {
      ctx.translate(this.main_canvas.width / 2, this.main_canvas.height / 2);
      this.scaleForth(ctx);
      ctx.translate(-this.cameraX, -this.cameraY);
    }
  }
  public fromCamera(ctx: CanvasRenderingContext2D) {
    if (this.main_canvas) {
      ctx.translate(this.cameraX, this.cameraY);
      this.scaleBack(ctx);
      ctx.translate(-this.main_canvas.width / 2, -this.main_canvas.height / 2);
    }
  }
  public scaleForth(ctx: CanvasRenderingContext2D) {
    ctx.scale(this.cameraZ, this.cameraZ);
  }
  public scaleBack(ctx: CanvasRenderingContext2D) {
    ctx.scale(this.cameraZInvd, this.cameraZInvd);
  }
  public handleScroll(event: WheelEventType): void {
    let deltaCount: number = event.wheelDelta / -120 || event.detail || 0x0;
    let maxScale = stats_handler.maxScore === 0x0 ? 0.1 : 0.5;
    this.mouseZ *= Math.pow(0.9, deltaCount);
    maxScale > this.mouseZ && (this.mouseZ = maxScale);
    this.mouseZ > 0x4 / this.mouseZ && (this.mouseZ = 0x4 / this.mouseZ);
  }
  public drawText(
    ctx: CanvasRenderingContext2D,
    isMass: boolean,
    x: number,
    y: number,
    size: number,
    drawSize: number,
    value: string,
  ) {
    ctx.save();
    if (size > 500) return this.drawRaw(ctx, x, y, value, drawSize);
    ctx.imageSmoothingQuality = qualities[
      settings.options.graphics.main.options.text_quality.target as number
    ] as ImageSmoothingQuality;
    if (isMass) {
      let cache = cache_handler.getMassCache(size);
      cache.accessTime = this.syncAppStamp;
      let canvases = cache.canvases;
      let correctionScale = drawSize / cache.size;
      let width = 0x0;
      for (let i = 0x0; i < value.length; i++)
        width += canvases[value[i]].width - 0x2 * cache.lineWidth;

      ctx.scale(correctionScale, correctionScale);
      x /= correctionScale;
      y /= correctionScale;
      x -= width / 0x2;
      for (let i = 0x0; i < value.length; i++) {
        let item = canvases[value[i]];
        ctx.drawImage(item.canvas, x, y - item.height / 2);
        x += item.width - 0x2 * cache.lineWidth;
      }
    } else {
      let cache = cache_handler.getNameCache(value, size);
      if (cache) {
        cache.accessTime = this.syncAppStamp;
        let canvas = cache.canvas;
        let correctionScale = drawSize / cache.size;
        ctx.scale(correctionScale, correctionScale);
        x /= correctionScale;
        y /= correctionScale;
        ctx.drawImage(canvas, x - canvas.width / 0x2, y - canvas.height / 0x2);
      }
    }
    ctx.restore();
  }

  public drawTextOnto(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    text: string,
    size: number,
  ) {
    ctx.font = `${size}px Karla`;
    ctx.lineWidth = (settings.options.general.main.options.showTextOutline
      .target as boolean)
      ? Math.max(~~(size / 10), 2)
      : 2;
    canvas.width = ctx.measureText(text).width + 2 * ctx.lineWidth;
    canvas.height = 4 * size;
    ctx.font = `${size}px Karla`;
    ctx.lineWidth = (settings.options.general.main.options.showTextOutline
      .target as boolean)
      ? Math.max(~~(size / 10), 2)
      : 2;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "rgba(0,0,0, 0.5)";
    ctx.translate(canvas.width / 2, 2 * size);
    ctx.lineWidth !== 1 && ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
  }
  public drawRaw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    size: number,
  ) {
    ctx.font = `${size}px Karla`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.lineWidth = (settings.options.general.main.options.showTextOutline
      .target as boolean)
      ? Math.max(~~(size / 10), 0x2)
      : 0x2;
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";
    ctx.lineWidth !== 1 && ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.restore();
  }
}

export const yurex_game = new YurexGame();
export const yurex_game_multi = new YurexGame(true);
