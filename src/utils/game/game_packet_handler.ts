import { store } from "../../redux";
import { LeaderType } from "../../redux/reducers/leader.reducer";
import { BinaryReader } from "../other/binary_packet";
import { bytesToStringColor } from "../other/color_handler";
import { stats_handler } from "../other/stats_canvas";
import { tags_handler } from "../other/tags_handler";
import { Cell } from "./cell";
import { YurexGame, yurex_game, yurex_game_multi } from "./core";
import { multibox_handler } from "./multiplayer_handler";

export const gamePacketHandler = (
  event: MessageEvent<ArrayBuffer>,
  game: YurexGame,
) => {
  game.syncUpdStamp = Date.now();
  let reader = new BinaryReader(new DataView(event.data), 0x0, true);
  let packetId = reader.getUint8();

  switch (packetId) {
    case 0x10: // update nodes
      let killer, killed, id, node, x, y, s, flags;
      let cell: Cell | undefined;
      let updColor,
        updName,
        updId_connection,
        updShield,
        count,
        color,
        name,
        shield,
        id_connection,
        tagcode,
        tagpin;

      count = reader.getUint16();

      for (let i = 0; i < count; i++) {
        killer = reader.getUint32();
        killed = reader.getUint32();
        if (
          !game.cells.byId.hasOwnProperty(killer) ||
          !game.cells.byId.hasOwnProperty(killed)
        )
          continue;
        game.cells.byId[killed].destroy(killer);
      }

      // update records
      while (true) {
        id = reader.getUint32();

        if (id === 0) break;

        x = reader.getInt32();
        y = reader.getInt32();
        s = reader.getUint16();

        flags = reader.getUint8();
        updColor = !!(flags & 0x02);
        updName = !!(flags & 0x08);
        updShield = !!(flags & 0x04);
        updId_connection = !!(flags & 0x40);

        color = updColor
          ? bytesToStringColor(
              reader.getUint8(),
              reader.getUint8(),
              reader.getUint8(),
            )
          : null;
        shield = updShield ? reader.getStringUTF8() : null;
        name = updName ? reader.getStringUTF8() : null;
        id_connection = updId_connection ? reader.getStringUTF8() : null;

        if (game.cells.byId.hasOwnProperty(id)) {
          cell = game.cells.byId[id];
          cell.update(game.syncUpdStamp);
          cell.updated = game.syncUpdStamp;
          cell.ox = cell.x;
          cell.oy = cell.y;
          cell.os = cell.s;
          cell.nx = x;
          cell.ny = y;
          cell.ns = s;
          if (color) cell.setColor(color);
          if (shield) cell.setShield(shield);
          if (id_connection) cell.setPlayerId(id_connection);
          if (name) cell.setName(name);
        } else {
          cell = new Cell(
            game,
            id,
            x,
            y,
            s,
            name ?? "",
            color ?? "#fff",
            shield,
            flags,
            id_connection,
          );
          game.cells.byId[id] = cell;
          game.cells.list.push(cell);
        }
      }

      count = reader.getUint16();
      for (let i = 0; i < count; i++) {
        killed = reader.getUint32();
        if (
          game.cells.byId.hasOwnProperty(killed) &&
          !game.cells.byId[killed].destroyed
        )
          game.cells.byId[killed].destroy(null);
      }
      break;
    case 0x11: // update pos
      game.targetX = reader.getFloat32();
      game.targetY = reader.getFloat32();
      game.targetZ = reader.getFloat32();
      break;
    case 0x12:
      for (var i in game.cells.byId) {
        game.cells.byId[i].destroy(null);
      }
      break;
    case 0x14: // clear my cells
      game.cells.mine = [];
      break;
    case 0x15: // draw line
      console.log("Unsupported Line packet: 0x15");
      break;
    case 0x20: // new cell
      game.cells.mine.push(reader.getUint32());
      break;
    case 0x30: // text list
      break;
    case 0x31:
      if (game.enabled) {
        count = reader.getUint32();
        let leaders: LeaderType[] = [];

        for (let i = 0; i < count; ++i) {
          if (i >= 10) break;
          let score = reader.getUint32();
          let isMine = !!reader.getUint32();
          let player_id = reader.getStringUTF8();
          let { name, tag } = game.parseName(
            reader.getStringUTF8() || "An unnamed cell",
          );

          if (player_id.length > 0) {
            leaders.push({ isMine, name, tag, score, playerId: player_id });
          }
        }

        if (leaders.length > 0) {
          store.dispatch({
            type: "UPDATE_LEADERBOARD_STATE",
            payload: { leaders },
          });
        }
      }
      break;
    case 0x40: // set border
      game.border.left = reader.getFloat64();
      game.border.top = reader.getFloat64();
      game.border.right = reader.getFloat64();
      game.border.bottom = reader.getFloat64();
      game.border.width = game.border.right - game.border.left;
      game.border.height = game.border.bottom - game.border.top;
      game.border.centerX = (game.border.left + game.border.right) / 2;
      game.border.centerY = (game.border.top + game.border.bottom) / 2;
      if (event.data.byteLength === 33) break;

      if (!game.mapCenterSet) {
        game.mapCenterSet = true;
        game.cameraX = game.targetX = game.border.centerX;
        game.cameraY = game.targetY = game.border.centerY;
        game.cameraZ = game.targetZ = 1;
      }

      reader.getUint32(); // skip unknown

      if (
        !/MultiOgar|OgarII/.test(reader.getStringUTF8()) ||
        stats_handler.pingLoopId
      ) {
        break;
      }

      if (game.enabled) {
        stats_handler.pingLoopId = setInterval(() => {
          game.wshandler.sendpacket(game.wshandler.cache.SEND_254);
          stats_handler.pingLoopStamp = Date.now();
        }, 2e3);
      }
      break;
    case 0x4b:
      count = reader.getInt32();
      tagcode = reader.getStringUTF8();
      tagpin = parseInt(reader.getStringUTF8());

      if (
        window.state.gameReducer.profile.tag?.code &&
        tagcode === window.state.gameReducer.profile.tag?.code &&
        tagpin === window.state.gameReducer.profile.tag?.pin
      ) {
        let team_players: {
          [playerId: string]: { name: string; score: number };
        } = {};

        for (let i = 0; i < count; ++i) {
          let flags = reader.getUint8();

          let player_id = "",
            player_name = "",
            score = 0x0;

          if (flags & 0x01) {
            player_id = reader.getStringUTF8();
          }

          if (flags & 0x10) {
            player_name = reader.getStringUTF8();
          }

          if (flags & 0x20) {
            score = reader.getInt32();
          }

          let { name } = game.parseName(player_name);
          let _game = multibox_handler.multibox ? yurex_game_multi : yurex_game;

          score > 0x0 &&
            player_id !== _game.cells.byId[_game.cells.mine[0x0]]?.player_id &&
            (team_players[player_id] = {
              name: name,
              score,
            });
        }

        if (Object.keys(team_players).length > 0) {
          tags_handler.setPlayers(
            {
              code: tagcode,
              pin: tagpin,
            },
            team_players,
          );
        }
      }
      break;
    case 0x4c:
      tagcode = reader.getStringUTF8();
      tagpin = parseInt(reader.getStringUTF8());
      let player_id = reader.getStringUTF8();

      if (
        tagcode &&
        tagpin &&
        player_id &&
        tagcode === window.state.gameReducer.profile.tag?.code &&
        tagpin === window.state.gameReducer.profile.tag?.pin &&
        tagcode in tags_handler.tags &&
        player_id.length > 0 &&
        player_id in tags_handler.tags[tagcode].players
      ) {
        console.log(`[GAME_PACKET]: Player removed from team: ${player_id}`);
        delete tags_handler.tags[tagcode].players[player_id];
      }
      break;
    case 0x63: //chat message
      if (game.enabled) {
        let flags = reader.getUint8();

        reader.getUint8();
        reader.getUint8();
        reader.getUint8(); // Ignore 3 bytes r,g,b

        let { name, tag } = game.parseName(reader.getStringUTF8() || "Unknown");

        let message = reader.getStringUTF8();

        let server = !!(flags & 0x80);
        let admin = !!(flags & 0x40);

        if (server) {
          name = "System";
        } else if (name === "Spectator") {
          name = "Unknown";
        }

        store.dispatch({
          type: "UPDATE_CHAT_STATE",
          payload: {
            messages: window.state.chatReducer.messages.concat([
              {
                username: name,
                tag: tag,
                verified: admin || server,
                isAdmin: admin,
                id: Date.now().toString(0x16) + ~~(Math.random() * 0x36),
                timestamp: Date.now(),
                message,
              },
            ]),
          },
        });
      }
      break;
    case 0xfe: // server stat
      if (game.enabled) {
        stats_handler.info = JSON.parse(reader.getStringUTF8());
        stats_handler.latency =
          game.syncUpdStamp - (stats_handler.pingLoopStamp ?? 0x0);
      }
      break;
    default:
      console.log(`Unsupported packet: ${packetId}`);
      game.wshandler.cleanup();
      break;
  }
};
