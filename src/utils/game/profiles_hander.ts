import { store } from "../../redux";
import { skins_handler } from "../other/skins_handler";

export interface Profile {
  skin: string;
  skinMultibox: string;
  shield: string;
}

class ProfilesHandler {
  public profiles: Profile[] = [];
  public currentIndex: number;
  constructor() {
    this.currentIndex = 0x0;
    this.profiles = [];
  }
  public initProfiles() {
    return new Promise<boolean>(async (resolve) => {
      try {
        let {
          gameReducer: { profile },
        } = window.state;
        let profilesStorage = localStorage.getItem("profiles");
        if (profilesStorage) {
          let profilesParsed: { currentProfile: number; profiles: Profile[] } =
            JSON.parse(profilesStorage);

          this.profiles = profilesParsed.profiles;

          let _profile = Object.assign(
            {},
            this.profiles[(this.currentIndex = profilesParsed.currentProfile)],
          );

          if (_profile.skin) {
            await skins_handler.loadSkinOnce(null, _profile.skin);
          }

          if (_profile.skinMultibox) {
            await skins_handler.loadSkinOnce(null, _profile.skinMultibox);
          }

          if (_profile.shield !== "default") {
            let shield_data = this.getShieldByPath(_profile.shield);
            shield_data && (_profile.shield = shield_data?.id);
          }

          store.dispatch({
            type: "UPDATE_GAME_STATE",
            payload: {
              profile: _profile,
            },
          });

          return resolve(true);
        } else {
          localStorage.setItem(
            "profiles",
            JSON.stringify({ currentProfile: 0x0, profiles: [profile] }),
          );

          return resolve(false);
        }
      } catch (e) {
        console.error(e);
      }
    });
  }
  public setProfile(
    index: number | null,
    profile: Profile,
    setDefaultIndex: boolean = false,
  ) {
    if (index === null) index = this.currentIndex;
    this.profiles[index] = profile;
    localStorage.setItem(
      "profiles",
      JSON.stringify({
        currentProfile: setDefaultIndex ? this.currentIndex : index,
        profiles: this.profiles,
      }),
    );
  }
  public setProperty<Y extends keyof Profile = keyof Profile>(
    prop: keyof Profile,
    data: Profile[Y],
  ) {
    this.profiles[this.currentIndex][prop] = data;

    localStorage.setItem(
      "profiles",
      JSON.stringify({
        currentProfile: this.currentIndex,
        profiles: this.profiles,
      }),
    );

    this.initProfiles();
  }
  public getShieldByPath(path: string) {
    let account = window.state.gameReducer.account ?? null;
    if (account) {
      if (path === "default") {
        return null;
      }
      for (let shield_id in account.inventory.shields) {
        let shield = account.inventory.shields[shield_id];
        if (shield?.path === path) {
          return { ...shield, id: shield_id };
        } else {
          return null;
        }
      }
    } else {
      return null;
    }
  }
}

export const profilesHandler = new ProfilesHandler();
