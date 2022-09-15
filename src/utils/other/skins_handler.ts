import innerShadow from "../../layout/img/circle_inner_shadow.png";

export interface SkinsType {
  [skin: string]: HTMLImageElement;
}

export class SkinsHandler {
  public skins_loaded: SkinsType;
  public innerShadow: HTMLImageElement;
  public primarySkin: string;
  public multiSkin: string;
  constructor() {
    this.skins_loaded = {};
    this.primarySkin = this.randomId();
    this.multiSkin = this.randomId();
    this.innerShadow = new Image();
  }
  public init() {
    return new Promise<void>((resolve) => {
      try {
        this.innerShadow.onload = async () => {
          let profile = window.state.gameReducer.profile;
          await this.loadImages({
            [this.primarySkin]: profile.skin,
            [this.multiSkin]: profile.skinMultibox,
          });
          resolve();
        };
        this.innerShadow.src = innerShadow;
      } catch (e) {
        console.error(`[SKINS_HANDLER]: ${String(e)}`);
        resolve();
      }
    });
  }
  public randomId() {
    return Date.now().toString(0x16) + ~~(Math.random() * 0x36);
  }
  public loadImages(skins: { [skin: string]: string } | string[]) {
    return new Promise<boolean>(async (resolve) => {
      try {
        if (Array.isArray(skins)) {
          for (let skin_url of skins) {
            await this.loadSkinOnce(null, skin_url);
          }
          return resolve(true);
        } else {
          let skinsTags = Object.keys(skins);
          for (let i = 0x0; i < skinsTags.length; i++) {
            let skin_url = skins[skinsTags[i]];
            await this.loadSkinOnce(skinsTags[i], skin_url);
          }
          return resolve(true);
        }
      } catch (e) {
        console.error(`[SKINS_LOAD]: ${String(e)}`);
        return resolve(false);
      }
    });
  }
  public loadSkinOnce(_tag: string | null, _url: string) {
    return new Promise<string | boolean>((resolve) => {
      try {
        let tag: string | null = _tag ?? null;
        let url = _url ?? null;

        if (!_tag) {
          if (url.match(/^([A-Za-z0-9])+\.(jpeg|png|jpg)+$/g)) {
            tag = _url;
            url = "https://i.imgur.com/" + _url;
          } else if (
            url.match(
              /^(https?)\:\/\/i\.imgur\.com\/([A-Za-z0-9])+\.(jpg|jpeg|png)+$/g,
            )
          ) {
            let imageName = url.match(/(\/([A-Za-z0-9])+\.(jpeg|png|jpg))+$/g);
            tag = (imageName && imageName[0x0].replace(/\//, "")) ?? null;
          } else {
            tag = null;
          }
        }

        if (!tag || tag in this.skins_loaded) {
          return resolve(false);
        }

        this.skins_loaded[tag] = new Image();

        this.skins_loaded[tag].onload = () => {
          resolve(tag ?? "");
        };

        this.skins_loaded[tag].onerror = () => {
          tag && delete this.skins_loaded[tag];
          return resolve(false);
        };

        this.skins_loaded[tag].src = url;
      } catch (e) {
        resolve(false);
      }
    });
  }
}

export const skins_handler = new SkinsHandler();
