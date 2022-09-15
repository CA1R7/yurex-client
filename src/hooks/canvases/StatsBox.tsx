import React, { FC } from "react";
import { useSelector } from "react-redux";
import { StateInterface } from "../../redux";
import { PlayersTeam, StatsReducer } from "../../redux/reducers/stats.reducer";
import { yurex_game } from "../../utils/game/core";
import { multibox_handler } from "../../utils/game/multiplayer_handler";
import { formatNumber } from "../../utils/other/format_number";

export const StatsBox: FC<{ enabled: boolean }> = ({ enabled }) => {
  if (!enabled) {
    return null;
  }

  const { fps, ping, players, score, team, account_latency } = useSelector<
    StateInterface,
    StatsReducer
  >((state) => state.statsReducer);

  let player_id =
    0x0 in yurex_game.cells.mine
      ? yurex_game.cells.byId[yurex_game.cells.mine[0x0]]?.player_id ?? null
      : null;

  let checkMine = () => {
    let pass = true;
    let players: PlayersTeam | undefined = team && team.players;

    if (
      players &&
      player_id &&
      player_id in players &&
      !multibox_handler.multibox
    ) {
      pass = false;
    }

    return pass;
  };

  return (
    <div id="stats-container">
      <div className="stats">
        {!isNaN(score) ? (
          <div className="score wrap">Score {formatNumber(score)}</div>
        ) : null}
        {!isNaN(ping) ? (
          <div className="ping wrap">PING {formatNumber(ping)}ms</div>
        ) : null}
        {!isNaN(account_latency) ? (
          <div className="ping wrap">
            ATC latency {formatNumber(account_latency)}ms
          </div>
        ) : null}
        <div className="fps wrap">FPS {formatNumber(fps)}</div>
        <div className="players wrap">Players {formatNumber(players)}</div>
      </div>
      <div className="team-tag">
        {team &&
          Object.keys(team.players).map(
            (player, i) =>
              team.players[player].name &&
              checkMine() && (
                <div className="user" key={i}>
                  <div
                    className="shape"
                    style={{ backgroundColor: team.color }}
                  ></div>
                  <div className="score">
                    {formatNumber(team.players[player].score)}
                  </div>
                  <div className="name">
                    {yurex_game.parseName(team.players[player].name).name}
                  </div>
                </div>
              ),
          )}
      </div>
    </div>
  );
};
