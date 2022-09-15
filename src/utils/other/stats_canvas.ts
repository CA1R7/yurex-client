interface InfoStatsType {
  name: string;
  mode: string;
  uptime: number;
  update: string;
  playerTotal: number;
  playersAlive: number;
  playersSpect: number;
  playersLimit: number;
}

export class StatsCanvas {
  public framesPerSecond: number;
  public latency: number;
  public pingLoopId: NodeJS.Timer | null;
  public pingAccountLoopId: NodeJS.Timer | null;
  public pingLoopStamp: number | null;
  public pingAccountLoopStamp: number | null;
  public canvas: HTMLCanvasElement;
  public visible: boolean;
  public maxScore: number;
  public score: number;
  public info: InfoStatsType | null;
  public supports: string | null;
  public account_latency: number;
  constructor() {
    this.canvas = document.createElement("canvas");
    this.framesPerSecond = 0x0;
    this.latency = NaN;
    this.account_latency = NaN;
    this.pingLoopId = null;
    this.pingAccountLoopId = null;
    this.pingLoopStamp = null;
    this.pingAccountLoopStamp = null;
    this.visible = false;
    this.maxScore = 0x0;
    this.score = NaN;
    this.supports = null;
    this.info = null;
  }
  public cleanup() {
    this.framesPerSecond = 0x0;
    this.latency = NaN;
    this.pingLoopId = null;
    this.pingLoopStamp = null;
    this.maxScore = 0x0;
    this.score = NaN;
    this.supports = null;
    this.info = null;
  }
  public setVisible(visible: boolean) {
    this.visible = visible;
    if (visible) {
      this.canvas.style.display = "block";
    } else {
      this.canvas.style.display = "none";
    }
  }
}

export const stats_handler = new StatsCanvas();
