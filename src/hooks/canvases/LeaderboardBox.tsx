import React, { FC } from "react";
import { useSelector } from "react-redux";
import { StateInterface } from "../../redux";
import { LeadersReducer } from "../../redux/reducers/leader.reducer";
import { formatNumber } from "../../utils/other/format_number";
import { tags_handler } from "../../utils/other/tags_handler";

export const LeaderboardBox: FC<{ enabled: boolean }> = ({ enabled }) => {
  if (!enabled) {
    return null;
  }

  const { leaders } = useSelector<StateInterface, LeadersReducer>(
    (state) => state.leaderReducer,
  );

  return (
    <div id="leaderboard">
      {leaders.map((leader, i) => (
        <div className="leader" key={i}>
          <div className={"name" + (leader.isMine ? " mine" : "")}>
            {leader.name}
          </div>
          <div className="score">{formatNumber(leader.score)}</div>
          <div
            className="line-tag"
            style={{
              backgroundColor: tags_handler.getTagColor(leader.tag),
            }}
          ></div>
        </div>
      ))}
    </div>
  );
};
