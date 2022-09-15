import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Dispatch, StateInterface, store } from "../redux";
import { SettingsReducer } from "../redux/reducers/settings.reducer";
import backImage from "../layout/img/back.svg";
import addImage from "../layout/img/add.svg";
import { GameReducer } from "../redux/reducers/game.reducer";
import { Profile, profilesHandler } from "../utils/game/profiles_hander";
import toast from "react-hot-toast";

import defaultShield from "../layout/img/hats/default.png";

export const ProfilesPanel: FC = () => {
  const navigate = useNavigate();
  const [changePanel, setChangePanel] = useState<boolean>(false);
  const dispatch = useDispatch<Dispatch<SettingsReducer>>();

  const { account, profile } = useSelector<StateInterface, GameReducer>(
    (state) => state.gameReducer,
  );
  const { turned_off } = useSelector<StateInterface, SettingsReducer>(
    (state) => state.settingsReducer,
  );

  useEffect(() => {
    if (!account) {
      updateSettings({ turned_off: true });
      toast.error("You need to sign in");
      return;
    }
    updateSettings({ active: true });
    return () => {
      updateSettings({ active: false, turned_off: false });
    };
  }, []);

  useEffect(() => {
    if (turned_off) {
      navigate("/");
    }
  }, [turned_off]);

  const updateSettings = (state: Partial<SettingsReducer>) => {
    dispatch({
      type: "UPDATE_SETTINGS_STATE",
      payload: state,
    });
  };

  const getShieldData = (_profile: Profile) => {
    let shieldId = profilesHandler.getShieldByPath(_profile.shield);
    if (_profile.shield === "default") {
      return defaultShield;
    } else if (shieldId && account) {
      return account.inventory.shields[shieldId.id].data;
    } else {
      return null;
    }
  };

  const addProfile = () => {
    if (profilesHandler.profiles.length >= 0x5) {
      return toast.error("You can't add more than 5 profiles");
    }
    profilesHandler.setProfile(
      profilesHandler.currentIndex + 0x1,
      profilesHandler.profiles[profilesHandler.currentIndex],
      true,
    );
  };

  const setIndex = (i: number) => {
    if (profilesHandler.profiles.length >= i) {
      profilesHandler.currentIndex = i;
      store.dispatch({
        type: "UPDATE_GAME_STATE",
        payload: {
          profile: profilesHandler.profiles[i],
        },
      });
      profilesHandler.setProfile(i, profilesHandler.profiles[i]);
      location.reload();
    }
  };

  const save = () => {
    profilesHandler.setProperty("skin", profile.skin);
    profilesHandler.setProperty("skinMultibox", profile.skinMultibox);
    setChangePanel(false);
  };

  return account ? (
    <div id="profiles-panel" className="panel">
      {changePanel ? (
        <div className="edite-panel">
          <div className="panel-inside">
            <div className="form">
              <div className="label">SKIN URL (must be imgur)</div>
              <input
                type="text"
                placeholder="Skin URL imgur"
                defaultValue={profile.skin}
                onChange={(e) =>
                  store.dispatch({
                    type: "UPDATE_GAME_STATE",
                    payload: {
                      profile: { ...profile, skin: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div className="form">
              <div className="label">SKIN Multibox URL (must be imgur)</div>
              <input
                type="text"
                placeholder="Skin Multibox URL imgur"
                onChange={(e) =>
                  store.dispatch({
                    type: "UPDATE_GAME_STATE",
                    payload: {
                      profile: { ...profile, skinMultibox: e.target.value },
                    },
                  })
                }
                defaultValue={profile.skinMultibox}
              />
            </div>
            <div className="bottom-form">
              <div
                className="button back"
                onClick={() => setChangePanel(false)}
              >
                BACK
              </div>
              <div className="button" onClick={() => save()}>
                SAVE
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="close-wrap">
        <Button
          className="close-button"
          sounded={true}
          onClick={() => updateSettings({ turned_off: true })}
        >
          <img src={backImage} className="icon" />
          <span className="text">BACK [ESC]</span>
        </Button>
      </div>
      <div className="content-wrap">
        <div className="content">
          <div className="label">PROFILES</div>
          <div className="profiles">
            {profilesHandler.profiles.map((_profile, i) => (
              <div
                key={i}
                className={
                  "profile" +
                  (i === profilesHandler.currentIndex ? " active" : "")
                }
              >
                <div className="skins-wrap" onClick={() => setIndex(i)}>
                  <div className="shield">
                    <img src={getShieldData(_profile) ?? ""} />
                  </div>
                  <div className="skins">
                    <div
                      className="skin"
                      style={{ backgroundImage: `url(${_profile.skin})` }}
                    ></div>
                    <div
                      className="skin"
                      style={{
                        backgroundImage: `url(${_profile.skinMultibox})`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="hover-panel">
                  <div
                    className="edite-button"
                    onClick={() =>
                      i === profilesHandler.currentIndex && setChangePanel(true)
                    }
                  >
                    Edite profile
                  </div>
                </div>
              </div>
            ))}
            {profilesHandler.profiles.length < 0x5 ? (
              <div className="profile add" onClick={() => addProfile()}>
                <img src={addImage} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
