import React, { FC, useState } from "react";
import { Button } from "./Button";

export const Switcher: FC<{
  onSelect?: (index: number) => void;
  defaultActive?: number;
  params: string[];
  id?: string;
  active?: boolean;
}> = ({ onSelect, params, defaultActive, id, active }) => {
  const [active_button, setActiveButton] = useState(defaultActive ?? 0x0);
  const elementId = (Math.random() * 0xfffff) >>> 0x0;
  return (typeof active !== "boolean" || active) && params.length ? (
    <div className="switcher" id={id ?? `switcher-${elementId.toString()}`}>
      {params.map((param, index) => (
        <Button
          sounded={true}
          tabIndex={0}
      onKeyDown={(e) => console.log(e.keyCode)}
          className={
            "switcher-button" + (active_button === index ? " active" : "")
          }
          onClick={() => {
            if (active_button !== index) {
              onSelect && onSelect(index);
              setActiveButton(index);
            }
          }}
          key={index}
        >
          {param}
        </Button>
      ))}
    </div>
  ) : null;
};
