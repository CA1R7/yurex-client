import React, { FC } from "react";
import { useSelector } from "react-redux";
import { StateInterface } from "../../redux";
import { GameReducer } from "../../redux/reducers/game.reducer";
import { formatNumber } from "../../utils/other/format_number";
import defaultBanner from "../../layout/img/default_banner.png";

import coinImage from "../../layout/img/coin.svg";
import logoutImage from "../../layout/img/logout.svg";
import { ENDPOINT } from "../..";

export const AccountOverview: FC = () => {
  const { account } = useSelector<StateInterface, GameReducer>(
    (state) => state.gameReducer,
  );

  const banner = account?.banner
    ? `https://cdn.discordapp.com/banners/${account.discord_id}/${account?.banner}.png`
    : defaultBanner;

  const avatar = account?.avatar
    ? `https://cdn.discordapp.com/avatars/${account.discord_id}/${account?.avatar}.png`
    : `https://eu.ui-avatars.com/api/?background=222233&color=6139e6&length=1&name=${account?.username}`;

  return account ? (
    <div id="account-overview">
      <div className="account-details wrap">
        <div
          className="logout"
          onClick={() => {
            localStorage.removeItem("token");
            location.reload();
          }}
        >
          <img src={logoutImage} alt="Logout" />
        </div>
        <div
          className="banner"
          style={{
            backgroundImage: `url(${banner})`,
          }}
        ></div>
        <div className="content">
          <div
            className="circle"
            style={{ backgroundImage: `url(${avatar})` }}
          ></div>
          <div className="text-section">
            <div className="identity">
              <div className="name">
                <span>{account?.username}</span>
                <span className="tag">#{account?.discriminator}</span>
              </div>
              <div className="id">{account?.discord_id}</div>
            </div>
            <div className="balance">
              {formatNumber(account?.balance ?? 0x0)}
              <img className="currency" src={coinImage} alt="yurex coin" />
            </div>
          </div>
        </div>
      </div>
      <div className="account-leveling wrap">
        <div className="text-section">
          <div className="level">
            {formatNumber(account?.level ?? 0x0)} LEVEL
          </div>
          <div className="content">
            <div className="xp blow">{formatNumber(account?.xp ?? 0x0)}XP</div>
            <div className="total-xp blow">
              {formatNumber(account?.totalXp ?? 0x0)}TXP
            </div>
          </div>
        </div>
        <div className="fill">
          <div
            style={{
              width: `${
                ((account?.xp ?? 0x0) * 1e2) / (account?.totalXp ?? 0x0)
              }%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  ) : (
    <div className="error-login">
      <div
        className="login-button"
        onClick={() => (window.location.href = `${ENDPOINT}/auth/login`)}
      >
        Login with discord
      </div>
    </div>
  );
};
