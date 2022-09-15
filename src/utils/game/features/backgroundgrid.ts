import { qualities, settings } from "../../other/settings_handler";
import { YurexGame, yurex_game, yurex_game_multi } from "../core";

export const setGameBackground = (url: string) => {
  return new Promise((resolve) => {
    const image = new Image();

    if (!url) {
      return resolve(false);
    }

    image.onload = () => {
      settings.options.theme.background.options.backgroundImage.target = url;

      yurex_game.background = image;
      yurex_game_multi.background = image;

      return resolve(true);
    };

    image.src = url;
  });
};

export const drawBackgroundGrid = (game: YurexGame) => {
  if (
    game.border.centerX !== 0 ||
    game.border.centerY !== 0 ||
    !game.main_ctx ||
    !game.main_canvas
  ) {
    return;
  }

  if (
    settings.options.general.main.options.showShadows.target &&
    qualities[
      settings.options.graphics.main.options.quality.target as number
    ] !== "low"
  ) {
    game.main_ctx.shadowBlur = settings.options.theme.border.options
      .borderShadow.target as number;
    game.main_ctx.shadowColor = settings.options.theme.border.options
      .borderShadowColor.target as string;
  }
  // Draw borders
  game.main_ctx.strokeStyle = settings.options.theme.border.options
    .borderStrokeColor.target as string;

  game.main_ctx.lineWidth = 0x14;
  game.main_ctx.lineCap = "round";
  game.main_ctx.lineJoin = "round";

  game.main_ctx.beginPath();

  game.main_ctx.moveTo(game.border.left, game.border.top);
  game.main_ctx.lineTo(game.border.right, game.border.top);
  game.main_ctx.lineTo(game.border.right, game.border.bottom);

  game.main_ctx.lineTo(game.border.left, game.border.bottom);
  game.main_ctx.closePath();
  game.main_ctx.stroke();

  // Draw Background

  game.main_ctx.shadowBlur = 0;

  if (
    settings.options.general.main.options.showBackground.target &&
    game.background
  ) {
    game.main_ctx.globalAlpha = 0.3;
    game.main_ctx.drawImage(
      game.background,
      game.border.left,
      game.border.top,
      game.border.width,
      game.border.height,
    );
    game.main_ctx.globalAlpha = 1;
  }

  // Draw grid
  let targetSize = game.border.right - game.border.left;

  let beginX = game.border.left;
  let beginY = game.border.top;

  let sectorCount = 3;
  let sectorNames = ["ABCD", "1234"];
  let sectorWidth = targetSize / sectorCount;
  let sectorNameSize = sectorWidth / 3;

  let squareFocused = 0x0;
  for (let i = 0; i < sectorCount; i++) {
    let x = sectorWidth + i * sectorWidth - sectorWidth;
    for (let j = 0; j < sectorCount; j++) {
      squareFocused += 0x1;
      let y = sectorWidth + j * sectorWidth - sectorWidth;
      game.main_ctx.fillStyle = `rgba(255, 255, 255, 0.0${
        squareFocused % 0x2 === 0x0 ? 0x5 : 0x3
      })`;

      game.main_ctx.fillRect(beginX + x, beginY + y, sectorWidth, sectorWidth);

      game.main_ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      game.main_ctx.textBaseline = "middle";
      game.main_ctx.textAlign = "center";
      game.main_ctx.font = `${sectorNameSize}px 'Karla'`;
      game.main_ctx.fillText(
        `${sectorNames[0][i]}${sectorNames[1][j]}`,
        beginX + x + sectorWidth / 2,
        beginY + y + sectorWidth / 2,
      );
    }
  }

  game.main_ctx.textAlign = "left";
};
