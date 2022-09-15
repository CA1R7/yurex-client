import React, { useEffect } from "react";
import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ChatHandler } from "../hooks/canvases/ChatHandler";
import { LeaderboardBox } from "../hooks/canvases/LeaderboardBox";
import { OverlayPanel } from "../hooks/OveralayPanel";
import { StatsBox } from "../hooks/canvases/StatsBox";
import { Dispatch, StateInterface } from "../redux";
import { fetchAccount } from "../redux/actions/fetchAccount";
import { ChatReducer } from "../redux/reducers/chat.reducer";
import { GameReducer } from "../redux/reducers/game.reducer";
import { account_websocket } from "../utils/account/ws_endpoint_handler";
import { setGameBackground } from "../utils/game/features/backgroundgrid";
import { initFullGame } from "../utils/game/init_full_game";
import { profilesHandler } from "../utils/game/profiles_hander";
import { audio_handler } from "../utils/other/audio_handler";
import { check_params } from "../utils/other/check_params";
import { initPrototypes } from "../utils/other/initPrototypes";
import { settings } from "../utils/other/settings_handler";
import { skins_handler } from "../utils/other/skins_handler";
import { ErrorPage } from "./ErrorScreen";
import { LoaderScreen } from "./LoaderScreen";
import { SettingsPanel } from "../hooks/SettingsPanel";
import { setFavIcon } from "../other/setFavIcon";
import { yurex_game } from "../utils/game/core";
import { InventoryPanel } from "../hooks/inventoryPanel";
import { ProfilesPanel } from "../hooks/ProfilesPanel";

export const gameId: string =
  Date.now().toString(0x16) + ~~(Math.random() * 0x36);

export const AppEntry: FC = () => {
  const dispatch = useDispatch<Dispatch<GameReducer & ChatReducer>>();
  const {
    gameReducer: {
      loaded,
      error_page_content,
      account,
      escOverlayShown,
      picker,
    },
    chatReducer: { chat_types_menu },
  } = (window.state = useSelector<StateInterface, StateInterface>(
    (state) => state,
  ));

  useEffect(() => {
    (async () => {
      try {
        const started = Date.now();
        const account_token = localStorage.getItem("token");

        setFavIcon();

        let account_loaded = false;

        check_params();

        // Update options needed
        initPrototypes();

        // Fetch Account
        if (account_token) {
          let accont_action = await fetchAccount(account_token);
          account_loaded = accont_action.loaded;
          dispatch(accont_action);
          if (!accont_action.pass) {
            // Return if user banned
            return;
          }
        }

        // Init settings
        settings.init();

        await profilesHandler.initProfiles();

        console.log(
          `[PROFILES]: Loaded successfully (${Date.now() - started}ms)`,
        );

        let background_url = settings.options.theme.background.options
          .backgroundImage.target as string;

        if (
          settings.options.general.main.options.showBackground.target &&
          background_url
        ) {
          // Load game background
          await setGameBackground(background_url);
        }

        console.log(
          `[GAME_BACKGROUND]: Loaded successfully (${Date.now() - started}ms)`,
        );

        // Load default skins
        await skins_handler.init();

        // Load all sounds needed
        await audio_handler.initLoad();

        console.log(
          `[GAME_SOUNDS]: Loaded successfully (${Date.now() - started}ms)`,
        );

        account_websocket.init();

        if (!account_loaded) {
          dispatch({
            type: "UPDATE_GAME_STATE",
            payload: {
              loaded: true,
            },
          });
          initFullGame();
        }
      } catch (e) {
        console.error(e);
        localStorage.removeItem("profiles");
        localStorage.removeItem("settings");
        location.reload();
      }
    })();
  }, []);

  const UnDropDownContent = (event: {
    target: { matches: (element: string) => boolean };
  }) => {
    if (chat_types_menu && !event.target.matches(".chat-types-menu *")) {
      dispatch({
        type: "UPDATE_CHAT_STATE",
        payload: {
          chat_types_menu: false,
        },
      });
    }

    if (
      picker &&
      !event.target.matches(".picker") &&
      !event.target.matches(".picker *")
    ) {
      dispatch({
        type: "UPDATE_GAME_STATE",
        payload: {
          picker: false,
        },
      });
    }
  };

  return (
    <div>
      {error_page_content ? (
        <ErrorPage />
      ) : !loaded ? (
        <LoaderScreen />
      ) : (
        <div id="app-entry" onClick={UnDropDownContent as any}>
          <ChatHandler enabled={!escOverlayShown} />
          <LeaderboardBox enabled={!escOverlayShown} />
          <StatsBox enabled={!escOverlayShown} />
          {!escOverlayShown && yurex_game.spectating ? (
            <div className="spectating">Spectating #1</div>
          ) : null}
          <div className="main-canvases">
            <canvas id="main-canvas"></canvas>
          </div>
          <div className="features-canvases">
            <canvas id="minimap-canvas" style={{ display: "none" }}></canvas>
          </div>
          <HashRouter>
            <div id="container-pages">
              <Routes>
                <Route path="/settings" element={<SettingsPanel />} />
                <Route path="/profiles" element={<ProfilesPanel />} />
                <Route path="/inventory" element={<InventoryPanel />} />
                <Route path="*" element={<OverlayPanel />} />
              </Routes>
            </div>
          </HashRouter>
        </div>
      )}
    </div>
  );
};
