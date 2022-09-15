import React, { FC, useEffect, useRef, useState } from "react";
import { yurex_game, yurex_game_multi } from "../utils/game/core";

import ParticlesImage from "../layout/img/particles.gif";
import { Button } from "../components/Button";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, StateInterface } from "../redux";
import { GameReducer } from "../redux/reducers/game.reducer";
import { SkinPreview } from "./overalay/SkinPreview";
import { AccountOverview } from "./overalay/AccountOverview";
import { Footer } from "./overalay/Footer";
import { OveralaySidebar } from "./overalay/SideBar";
import { skins_preview } from "../utils/other/skins_preview";
import { profilesHandler } from "../utils/game/profiles_hander";

export const OverlayPanel: FC = () => {
  const overalyRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<Dispatch<GameReducer>>();
  const [overlayTurned, setOveraly] = useState<boolean | null>(true);
  const { escOverlayShown, profile } = useSelector<StateInterface, GameReducer>(
    (state) => state.gameReducer,
  );

  useEffect(() => {
    document.title = "YUREX";
    // For Overaly Hide Animation
    if (!escOverlayShown) {
      setTimeout(() => {
        if (overalyRef.current) {
          overalyRef.current.classList.add("hide");
        }
        setTimeout(() => {
          setOveraly(false);
        }, 50);
      }, 50);
    } else {
      skins_preview.shieldSaved = null;
      setOveraly(true);
    }
  }, [escOverlayShown]);

  const setInput = (key: string, value?: string | number) => {
    if (value) {
      let _profile = Object.assign(profile, {
        tag: {
          ...profile.tag,
          [key]:
            key === "pin"
              ? value ?? ~~((Math.random() * 0xffffff) >>> 0x0)
              : value,
        },
      });
      profilesHandler.setProfile(null, _profile);
      dispatch({
        type: "UPDATE_GAME_STATE",
        payload: {
          profile: _profile,
        },
      });
    }
  };

  return overlayTurned ? (
    <div id="overlay" ref={overalyRef}>
      <AccountOverview />
      <OveralaySidebar />
      <Footer />
      <div className="center-content">
        <div className="content">
          <SkinPreview />
          <div className="tag-section">
            <input
              maxLength={10}
              className="tag-code"
              type="text"
              onChange={(e) =>
                e.target.value.length <= 10 && setInput("code", e.target.value)
              }
              defaultValue={profile?.tag?.code ?? ""}
              placeholder="Enter Team Tag"
            />
            <input
              className="tag-pin"
              type="number"
              onChange={(e) =>
                e.target.value.length <= 4 &&
                setInput("pin", parseInt(e.target.value))
              }
              defaultValue={profile?.tag?.pin ?? ""}
              placeholder="Enter TAG PIN"
              maxLength={4}
            />
            <span>Please restart Game after</span>
          </div>
        </div>
      </div>
      <div className="play-section">
        <Button id="server-selection" sounded={true}>
          <div className="server-panel"></div>
          <div className="server-details">
            <div className="label">SERVER</div>
            <div className="answer">
              <div className="region card">EU</div>
              <div className="server-name card">FFA</div>
            </div>
          </div>
        </Button>
        <Button
          id="play-button"
          sounded={true}
          onClick={() => yurex_game.play()}
        >
          <img src={ParticlesImage} />
          <div className="text-center">PLAY</div>
        </Button>
        <Button
          id="spectate-button"
          sounded={true}
          onClick={() => yurex_game.spectate()}
        >
          <div className="text-center">SPECTATE</div>
        </Button>
      </div>
    </div>
  ) : null;
};
