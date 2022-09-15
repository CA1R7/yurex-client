import React, { FC } from "react";
import { audio_handler } from "../utils/other/audio_handler";

export const Button: FC<
  {
    sounded?: boolean;
  } & React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
> = ({ children, id, className, sounded, ...props }) => {
  const randomId: string = Date.now().toString(0x16) + ~~(Math.random() * 0x36);

  return (
    <div
      id={id ?? randomId}
      className={className ?? "button"}
      onMouseEnter={() => sounded && audio_handler.playSound("hoverSound")}
      {...props}
    >
      {children}
    </div>
  );
};
