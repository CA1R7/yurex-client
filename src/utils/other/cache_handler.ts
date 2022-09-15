import { yurex_game } from "../game/core";
import { settings } from "./settings_handler";

export interface CanvasesType {
  [canvasId: string]: {
    canvas?: HTMLCanvasElement;
    width?: number;
    height?: number;
  };
}

export class CacheHandler {
  public cachedNames: {
    [name: string]: {
      [size: number]: {
        accessTime: number;
        canvas: HTMLCanvasElement;
        height: number;
        size: number;
        value: string;
        width: number;
      };
    };
  };
  public cachedMass: any;
  constructor() {
    this.cachedNames = {};
    this.cachedMass = {};
  }
  public newNameCache(value: string, size: number) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");

    if (!ctx) return;

    yurex_game.drawTextOnto(canvas, ctx, value, size);

    this.cachedNames[value] = this.cachedNames[value] || {};

    this.cachedNames[value][size] = {
      width: canvas.width,
      height: canvas.height,
      canvas: canvas,
      value: value,
      size: size,
      accessTime: yurex_game.syncAppStamp,
    };

    return this.cachedNames[value][size];
  }
  public newMassCache(size: number) {
    let canvases: CanvasesType = {
      "0": {},
      "1": {},
      "2": {},
      "3": {},
      "4": {},
      "5": {},
      "6": {},
      "7": {},
      "8": {},
      "9": {},
    };

    for (let value in canvases) {
      let canvas = (canvases[value].canvas = document.createElement("canvas"));
      let ctx = canvas.getContext("2d");
      if (ctx) {
        yurex_game.drawTextOnto(canvas, ctx, value, size);
        canvases[value].canvas = canvas;
        canvases[value].width = canvas.width;
        canvases[value].height = canvas.height;
      }
    }

    this.cachedMass[size] = {
      canvases: canvases,
      size: size,
      lineWidth: settings.options.general.showTextOutline
        ? Math.max(~~(size / 0xa), 0x2)
        : 0x2,
      accessTime: yurex_game.syncAppStamp,
    };
    return this.cachedMass[size];
  }

  public toleranceTest(a: number, b: number, tolerance: number) {
    return a - tolerance <= b && b <= a + tolerance;
  }

  public getNameCache(value: string, size: number) {
    if (!this.cachedNames[value]) return this.newNameCache(value, size);
    let sizes = Object.keys(this.cachedNames[value]);
    for (let i = 0, l = sizes.length; i < l; i++)
      if (
        this.toleranceTest(
          size,
          typeof sizes[i] === "number"
            ? (sizes[i] as unknown as number)
            : Number(sizes[i]),
          size / 0x4,
        )
      )
        return this.cachedNames[value][sizes[i] as unknown as number];
    return this.newNameCache(value, size);
  }
  public getMassCache(size: number) {
    let sizes = Object.keys(this.cachedMass);
    for (let i = 0, l = sizes.length; i < l; i++)
      if (this.toleranceTest(size, sizes[i] as unknown as number, size / 4))
        return this.cachedMass[sizes[i]];
    return this.newMassCache(size);
  }
  public cacheCleanup() {
    for (var i in this.cachedNames) {
      for (var j in this.cachedNames[i])
        if (yurex_game.syncAppStamp - this.cachedNames[i][j].accessTime >= 5000)
          delete this.cachedNames[i][j];
      if (this.cachedNames[i] === {}) delete this.cachedNames[i];
    }
    for (var i in this.cachedMass)
      if (yurex_game.syncAppStamp - this.cachedMass[i].accessTime >= 5000)
        delete this.cachedMass[i];
  }
}

export const cache_handler = new CacheHandler();
