import axios from "axios";

import hoverSound from "../../layout/sounds/hover.mp3";
import hoveroutSound from "../../layout/sounds/moveout.wav";

class AudioHandler {
  private sounds_url: { [key: string]: string }[];
  private clicked: boolean;
  public sounds: { [key: string]: AudioContext & { buffer?: AudioBuffer } };
  constructor() {
    this.sounds = {};
    this.sounds_url = [{ hoverSound }, { hoveroutSound }];
    this.clicked = false;
  }
  public initLoad() {
    return new Promise(async (resolve) => {
      let soundsLoaded = 0x0;

      window.addEventListener("click", () => {
        if (!this.clicked) {
          this.clicked = true;
        }
      });

      for (let sound of this.sounds_url) {
        let soundName = Object.keys(sound)[0x0];
        let soundLoad = await this.loadSound(soundName, sound[soundName]);

        if (soundLoad) {
          soundsLoaded++;
        }
      }

      return resolve(soundsLoaded === this.sounds_url.length);
    });
  }
  public loadSound(soundName: string, url: string) {
    return new Promise(async (resolve) => {
      try {
        if (soundName in this.sounds) {
          return resolve(false);
        }

        const fetchAudio = await axios.request({
          url,
          method: "GET",
          responseType: "arraybuffer",
        });

        if (fetchAudio.data) {
          this.sounds[soundName] = new AudioContext();
          this.sounds[soundName].decodeAudioData(
            fetchAudio.data,
            (buffer) => {
              this.sounds[soundName].buffer = buffer;
              return resolve(true);
            },
            console.error,
          );
        }
      } catch (error) {
        console.error(error);
        return resolve(false);
      }
    });
  }
  public async playSound(sound: string) {
    try {
      if (!this.clicked) {
        throw new Error("[AUDIO]: The client didn't interact yet");
      }

      if (!(sound in this.sounds)) {
        throw new Error("[AUDIO]: Could not find that sound");
      }

      let soundContext = this.sounds[sound];
      let buffer = soundContext.buffer;

      if (buffer) {
        let source = soundContext.createBufferSource();

        source.buffer = buffer;

        source.connect(soundContext.destination);

        if (source.start) {
          source.start();
        } else {
          // @ts-ignore
          source.noteOn();
        }
      }
    } catch (error) {
      console.warn(String(error));
    }
  }
}

export const audio_handler = new AudioHandler();

(window as any).audio_handler = audio_handler;
