import React, { FC, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { ColorPicker } from "../components/ColorPicker";
import { KeyChangerWrap } from "../components/KeyChanger";
import { Range } from "../components/Range";
import { Switcher } from "../components/Switcher";
import backImage from "../layout/img/back.svg";
import { Dispatch, StateInterface } from "../redux";
import { SettingsReducer } from "../redux/reducers/settings.reducer";
import { OptionsSettings, settings } from "../utils/other/settings_handler";

interface TargetType extends EventTarget {
  files: FileList;
}
export const SettingsPanel: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch<SettingsReducer>>();
  const { current_content, turned_off } = useSelector<
    StateInterface,
    SettingsReducer
  >((state) => state.settingsReducer);

  useEffect(() => {
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

  const reset = () => {
    localStorage.removeItem("settings");
    location.reload();
  };

  const download = () => {
    let data = localStorage.getItem("settings");
    if (data) {
      let element = document.createElement("a");

      element.setAttribute(
        "href",
        "data:application/octet-stream;charset=base64, " + btoa(data),
      );

      element.setAttribute("download", "yurex-settings.yrx");

      element.style.display = "none";

      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
  };

  const upload = () => {
    let element = document.createElement("input");

    element.type = "file";

    element.style.display = "none";

    element.onchange = (event) => {
      const file = (event.target as TargetType).files[0x0] ?? null;

      if (file) {
        const reader = new FileReader();
        reader.onload = async () => {
          let data = await file.text();
          if (data && typeof data === "string") {
            let object = JSON.parse(atob(data));
            settings.options = object;
            localStorage.setItem("settings", JSON.stringify(settings.options));
            toast.success("Settings Loaded!");
          }
        };
        reader.readAsDataURL(file);
      }
      document.body.removeChild(element);
    };

    document.body.appendChild(element);
    element.click();
  };
  return (
    <div id="settings-panel" className="panel">
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
        <div className="task-bar spb">
          <div className="left-buttons">
            {Object.keys(settings.options).map((setting_prop, i) => (
              <div
                key={i}
                onClick={() => updateSettings({ current_content: i })}
                className={
                  "button-wrap" + (current_content === i ? " active" : "")
                }
              >
                <Button sounded={true} className="button">
                  {setting_prop}
                </Button>
                <div className="line-active"></div>
              </div>
            ))}
          </div>
          <div className="right-buttons">
            <Button
              sounded={true}
              id="reset"
              className="button"
              onClick={() => download()}
            >
              DOWNLOAD
            </Button>
            <Button
              sounded={true}
              id="reset"
              className="button"
              onClick={() => upload()}
            >
              UPLOAD
            </Button>
            <Button
              sounded={true}
              id="reset"
              className="button"
              onClick={() => reset()}
            >
              RESET
            </Button>
          </div>
        </div>
        <div className="content">
          {(Object.keys(settings.options) as (keyof OptionsSettings)[]).map(
            (setting_prop, i) =>
              i === current_content && (
                <div key={i} id={setting_prop} className="wrap-content">
                  {Object.keys(settings.options[setting_prop]).map(
                    (main_title, index) => (
                      <div id={main_title} key={index} className="form">
                        <div className="title">
                          {settings.options[setting_prop][main_title].title}
                        </div>
                        {Object.keys(
                          settings.options[setting_prop][main_title].options,
                        ).map((param_key, pi) => (
                          <div className="param" key={pi}>
                            <div className="label">
                              <span className="title-label">
                                {
                                  settings.options[setting_prop][main_title]
                                    .options[param_key].title
                                }
                              </span>
                              <div className="description">
                                -{" "}
                                {
                                  settings.options[setting_prop][main_title]
                                    .options[param_key].description
                                }
                              </div>
                            </div>
                            <div className="controller">
                              <Range
                                active={
                                  !!(
                                    settings.options[setting_prop][main_title]
                                      .options[param_key].type === "range" &&
                                    settings.options[setting_prop][main_title]
                                      .options[param_key]?.range_details
                                  )
                                }
                                onSelect={(int) => {
                                  settings.options[setting_prop][
                                    main_title
                                  ].options[param_key].target = int;
                                  settings.setProperty(setting_prop, {
                                    [main_title]:
                                      settings.options[setting_prop][
                                        main_title
                                      ],
                                  });
                                }}
                                defaultSize={
                                  (settings.options[setting_prop][main_title]
                                    .options[param_key]?.target as number) ??
                                  0x0
                                }
                                max={
                                  settings.options[setting_prop][main_title]
                                    .options[param_key]?.range_details?.max ??
                                  0x0
                                }
                                min={
                                  settings.options[setting_prop][main_title]
                                    .options[param_key]?.range_details?.min ??
                                  0x0
                                }
                              />
                              <KeyChangerWrap
                                active={
                                  !!(
                                    settings.options[setting_prop][main_title]
                                      .options[param_key].type === "key"
                                  )
                                }
                                key_code={
                                  settings.options[setting_prop][main_title]
                                    .options[param_key].target as number
                                }
                                onSelect={(int) => {
                                  settings.options[setting_prop][
                                    main_title
                                  ].options[param_key].target = int;
                                  settings.setProperty(setting_prop, {
                                    [main_title]:
                                      settings.options[setting_prop][
                                        main_title
                                      ],
                                  });
                                }}
                              />
                              <Switcher
                                active={
                                  !!(
                                    settings.options[setting_prop][main_title]
                                      .options[param_key].type === "switcher" &&
                                    settings.options[setting_prop][main_title]
                                      .options[param_key]?.switcher_details
                                  )
                                }
                                defaultActive={
                                  (typeof settings.options[setting_prop][
                                    main_title
                                  ].options[param_key]?.target === "boolean"
                                    ? settings.options[setting_prop][main_title]
                                        .options[param_key]?.target === true
                                      ? 0x0
                                      : 0x1
                                    : (settings.options[setting_prop][
                                        main_title
                                      ].options[param_key]
                                        ?.target as number)) ?? 0x0
                                }
                                params={
                                  settings.options[setting_prop][main_title]
                                    .options[param_key]?.switcher_details
                                    ?.params ?? []
                                }
                                onSelect={(icontent) => {
                                  settings.options[setting_prop][
                                    main_title
                                  ].options[param_key].target =
                                    settings.options[setting_prop][
                                      main_title
                                    ].options[
                                      param_key
                                    ].switcher_details?.params.join("") ===
                                    "ONOFF"
                                      ? !icontent
                                      : icontent;
                                  settings.setProperty(setting_prop, {
                                    [main_title]:
                                      settings.options[setting_prop][
                                        main_title
                                      ],
                                  });
                                }}
                              />

                              <ColorPicker
                                active={
                                  !!(
                                    settings.options[setting_prop][main_title]
                                      .options[param_key].type === "color"
                                  )
                                }
                                colorOf={
                                  settings.options[setting_prop][main_title]
                                    .options[param_key].target as string
                                }
                                onSelect={(hex) => {
                                  settings.options[setting_prop][
                                    main_title
                                  ].options[param_key].target = hex;
                                  settings.setProperty(setting_prop, {
                                    [main_title]:
                                      settings.options[setting_prop][
                                        main_title
                                      ],
                                  });
                                }}
                              />
                              {settings.options[setting_prop][main_title]
                                .options[param_key].type === "input" ? (
                                <input
                                  type="text"
                                  className="settings-input"
                                  onChange={(event) => {
                                    settings.options[setting_prop][
                                      main_title
                                    ].options[param_key].target =
                                      event.target.value;
                                    settings.setProperty(setting_prop, {
                                      [main_title]:
                                        settings.options[setting_prop][
                                          main_title
                                        ],
                                    });
                                  }}
                                  defaultValue={
                                    (settings.options[setting_prop][main_title]
                                      .options[param_key].target as string) ??
                                    ""
                                  }
                                  placeholder={
                                    settings.options[setting_prop][main_title]
                                      .options[param_key].title
                                  }
                                />
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ),
                  )}
                </div>
              ),
          )}
        </div>
      </div>
    </div>
  );
};
