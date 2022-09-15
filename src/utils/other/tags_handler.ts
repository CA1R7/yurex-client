import { TagPlayerType } from "../../redux/reducers/game.reducer";

export class TagsHandler {
  public tags: {
    [key: string]: {
      color: string;
      players: { [playerId: string]: { score: number; name: string } };
      pin: number;
    };
  };
  constructor() {
    this.tags = {};
  }

  public getRandomColor() {
    const prefered_colors = [
      "#ff4242",
      "#ffa74f",
      "#ffff67",
      "#a3ff48",
      "#46ff46",
      "#50fda6",
      "#55fcfc",
      "#4aa3fc",
      "#4242ff",
      "#a54dfd",
      "#ff4dff",
      "#ff4ba5",
    ];

    let color = prefered_colors[~~(Math.random() * prefered_colors.length)];

    for (let tagId in this.tags) {
      if (this.tags[tagId].color === color) {
        color = `#${(~~(Math.random() * 0xffffff)).toString(0x10)}`;
      }
    }

    return color;
  }

  public setPlayers(
    tag: TagPlayerType,
    players: { [playerId: string]: { name: string; score: number } },
  ) {
    if (tag.code && tag.pin) {
      if (!(tag.code in this.tags)) {
        this.addTag(tag);
      }

      if (this.tags[tag.code].pin === tag.pin) {
        this.tags[tag.code].players = players;
      }
    }
  }

  public addTag(tag: TagPlayerType, playerId?: string | null) {
    if (tag.code && !(tag.code in this.tags)) {
      this.tags[tag.code] = {
        pin: tag.pin || 0,
        players: playerId ? { [playerId]: { name: "", score: 0x0 } } : {},
        color: this.getRandomColor(),
      };
    }
  }

  public getTagColor(_tag: TagPlayerType) {
    let tag = _tag.code;

    if (!tag) {
      return "";
    }

    if (!(tag in this.tags)) {
      this.addTag(_tag);
    }

    return this.tags[tag].color;
  }
}

export const tags_handler = new TagsHandler();

(window as any).tags_handler = tags_handler;
