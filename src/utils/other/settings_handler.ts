export interface OptionIn {
  title: string;
  input?: string;
  type: "range" | "switcher" | "input" | "color" | "key";
  description: string;
  target: boolean | number | string;
  switcher_details?: {
    params: string[];
  };
  range_details?: {
    precentage?: boolean;
    max: number;
    min: number;
  };
}

export interface OptionsSettings {
  general: {
    [type: string]: {
      title: string;
      options: {
        [option: string]: OptionIn;
      };
    };
  };
  theme: {
    [type: string]: {
      title: string;
      options: {
        [option: string]: OptionIn;
      };
    };
  };
  graphics: {
    [type: string]: {
      title: string;
      options: {
        [option: string]: OptionIn;
      };
    };
  };

  keyboard: {
    [type: string]: {
      title: string;
      options: {
        [option: string]: OptionIn;
      };
    };
  };
}

export const qualities = ["high", "medium", "low"];

export class SettingsHandler {
  options: OptionsSettings;
  constructor() {
    this.options = {
      keyboard: {
        main: {
          title: "Main",
          options: {
            w: {
              type: "key",
              title: "Normal Eject",
              description: "Eject food one per click",
              target: 87,
            },
            e: {
              type: "key",
              title: "Fast Eject",
              description: "Eject food quickly while holding",
              target: 69,
            },
            space: {
              type: "key",
              title: "Split",
              description: "Split cell",
              target: 32,
            },
            tab: {
              type: "key",
              title: "Multibox",
              description: "Turn multibox on/off or switch",
              target: 9,
            },
            a: {
              type: "key",
              title: "MegaSplit x4",
              description: "Slit x4 time at once",
              target: 65,
            },
            d: {
              type: "key",
              title: "MegaSplit x16",
              description: "Slit x16 time at once",
              target: 68,
            },
            c: {
              type: "key",
              title: "MegaSplit x32",
              description: "Slit x32 time at once",
              target: 67,
            },
          },
        },
      },
      general: {
        main: {
          title: "Main",
          options: {
            showTextOutline: {
              type: "switcher",
              switcher_details: {
                params: ["ON", "OFF"],
              },
              title: "Text Outline",
              description: "Show stroke/outline of text",
              target: true,
            },

            showGrid: {
              type: "switcher",
              switcher_details: {
                params: ["ON", "OFF"],
              },
              title: "GAME GRID",
              description: "Show game grid inside borders",
              target: true,
            },
            showBackground: {
              type: "switcher",
              switcher_details: {
                params: ["ON", "OFF"],
              },
              title: "Background Image",
              description: "Background image inside game borders",
              target: true,
            },
            showShadows: {
              type: "switcher",
              switcher_details: {
                params: ["ON", "OFF"],
              },
              title: "Shadows",
              description: "Enable shadow elements on game",
              target: true,
            },
          },
        },
        minimap: {
          title: "Minimap",
          options: {
            showMinimap: {
              type: "switcher",
              switcher_details: {
                params: ["ON", "OFF"],
              },
              title: "Minimap",
              description: "Show Minimap",
              target: true,
            },
          },
        },
        cell: {
          title: "Cell",
          options: {
            playAutomatically: {
              type: "switcher",
              switcher_details: {
                params: ["ON", "OFF"],
              },
              title: "Play Automatically",
              description:
                "Play again automatically when your multibox is playing after you die",
              target: true,
            },
            showNames: {
              type: "switcher",
              switcher_details: {
                params: ["ON", "OFF"],
              },
              title: "CELL NAMES",
              description: "Show names inside cell",
              target: true,
            },
            showMass: {
              type: "switcher",
              switcher_details: {
                params: ["ON", "OFF"],
              },
              title: "CELL MASS",
              description: "Show mass/score inside cell",
              target: true,
            },
            showColor: {
              type: "switcher",
              switcher_details: {
                params: ["ON", "OFF"],
              },
              title: "CELL color",
              description: "Show color of each cell",
              target: true,
            },
            showHatShield: {
              type: "switcher",
              switcher_details: {
                params: ["ON", "OFF"],
              },
              title: "Shield",
              description: "Show hat/shield rotating over cell",
              target: true,
            },
            showSkins: {
              type: "switcher",
              switcher_details: {
                params: ["ON", "OFF"],
              },
              title: "Cell Skins",
              description: "Show cell Skins (only works with skins)",
              target: true,
            },
          },
        },
      },

      theme: {
        border: {
          title: "Border",
          options: {
            borderLineWidth: {
              type: "range",
              target: 0x4,
              title: "Border Line",
              description: "Width line of borders",
              range_details: {
                min: 0x1,
                max: 0x7,
              },
            },
            borderShadow: {
              type: "range",
              target: 20,
              title: "Border Shadow",
              description: "Shadow Size of borders",
              range_details: {
                min: 0x0,
                max: 30,
              },
            },
            borderShadowColor: {
              type: "color",
              target: "white",
              title: "Border Shadow Color",
              description: "Color of border shadows",
            },
            borderStrokeColor: {
              type: "color",
              target: "white",
              title: "Borders Color",
              description: "Color of border",
            },
          },
        },

        background: {
          title: "Background",
          options: {
            backgroundImage: {
              type: "input",
              target: "https://i.imgur.com/yARzcKF.png",
              title: "Background Image URL",
              description:
                "Use your an image as your background [NEED RESTART]",
            },
            backgroundColor: {
              type: "color",
              target: "#161616",
              title: "Background Color",
              description: "Color of game background",
            },
          },
        },

        minimap: {
          title: "Minimap",
          options: {
            minimapSize: {
              type: "range",
              target: 150,
              title: "MINIMAP SIZE",
              description: "Size of minimap (size=width/height)",
              range_details: {
                precentage: false,
                min: 120,
                max: 200,
              },
            },
          },
        },

        mass: {
          title: "Mass/Food",
          options: {
            shadowSize: {
              type: "range",
              target: 20,
              title: "Mass Shadow",
              description: "Size of food shadow",
              range_details: {
                min: 0,
                max: 30,
              },
            },
            massColor: {
              type: "color",
              target: "#5731d5",
              title: "Mass/food Color",
              description: "Color of mass/food",
            },
          },
        },

        multibox: {
          title: "Multibox",
          options: {
            borderColorOn: {
              type: "color",
              target: "#e56ed6",
              title: "Multibox border ON",
              description: "Color of multibox when it's on",
            },
            borderColorOff: {
              type: "color",
              target: "#444444",
              title: "Multibox border Off",
              description: "Color of multibox when it's off",
            },
          },
        },
      },
      graphics: {
        main: {
          title: "MAIN",
          options: {
            quality: {
              type: "switcher",
              target: 0,
              title: "Video Quality",
              description: "Select better choice for your performance",
              switcher_details: {
                params: ["high", "medium", "low"],
              },
            },
            text_quality: {
              type: "switcher",
              target: 0,
              title: "Text Quality",
              description: "Quality of cells text",
              switcher_details: {
                params: ["high", "medium", "low"],
              },
            },
          },
        },
      },
    };
  }
  public init(): void {
    try {
      const settings = localStorage.getItem("settings");

      if (settings) {
        let new_options = Object.assign({}, this.options, JSON.parse(settings));
        this.options = new_options;
      } else {
        localStorage.setItem("settings", JSON.stringify(this.options));
        console.log("[SETTINGS]: Stored default settings");
      }
    } catch (e) {
      console.log(`[SETTINGS]: ${String(e)}`);
    }
  }
  public setProperty<K extends keyof OptionsSettings = keyof OptionsSettings>(
    type: K,
    object: OptionsSettings[K],
  ): void {
    try {
      this.options = Object.assign(this.options, {
        [type]: { ...this.options[type], ...object },
      });
      localStorage.setItem("settings", JSON.stringify(this.options));
    } catch (e) {
      console.log(`Error settings option: ${String(e)}`);
    }
  }
}

export const settings = new SettingsHandler();
