import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Dispatch, StateInterface } from "../redux";
import { SettingsReducer } from "../redux/reducers/settings.reducer";
import backImage from "../layout/img/back.svg";
import {
  GameReducer,
  InventoryAccountType,
} from "../redux/reducers/game.reducer";
import { profilesHandler } from "../utils/game/profiles_hander";
import toast from "react-hot-toast";

import defaultShield from "../layout/img/hats/default.png";

export const InventoryPanel: FC = () => {
  const navigate = useNavigate();
  const [currentContent, setCurrentContent] =
    useState<keyof InventoryAccountType>("shields");
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

  const setShield = (shield: string) => {
    profilesHandler.setProperty("shield", shield);
    toast.success("Shield set!");
  };

  return account ? (
    <div id="inventory-panel" className="panel">
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
        <div className="task-bar">
          {Object.keys(account.inventory).map((prop, i) => (
            <div
              key={i}
              onClick={() =>
                setCurrentContent(prop as keyof InventoryAccountType)
              }
              className={
                "button-wrap" + (currentContent === prop ? " active" : "")
              }
            >
              <Button sounded={true} className="button">
                {prop.toUpperCase()}
              </Button>
              <div className="line-active"></div>
            </div>
          ))}
        </div>
        <div className="content">
          <div className="label">ITEMS</div>
          <div className="items">
            {currentContent
              ? Object.keys(account.inventory[currentContent]).map(
                  (prop, i) => (
                    <div
                      className={
                        "item" + (prop === profile.shield ? " active" : "")
                      }
                      key={i}
                      onClick={() =>
                        setShield(account.inventory[currentContent][prop].path)
                      }
                    >
                      <img src={account.inventory[currentContent][prop].data} />
                    </div>
                  ),
                )
              : null}
            <div
              className={
                "item" + ("default" === profile.shield ? " active" : "")
              }
              onClick={() => setShield("default")}
            >
              <img src={defaultShield} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
