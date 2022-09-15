import React, { FC, useState } from "react";
import { formatNumber } from "../utils/other/format_number";

export const Range: FC<{
  id?: string;
  defaultSize: number;
  max: number;
  min: number;
  symbol?: string;
  onSelect: (int: number) => void;
  active?: boolean;
}> = ({ id, defaultSize, min, max, symbol, active, onSelect }) => {
  const [size, setSize] = useState<number>(defaultSize ?? 0x0);

  const precentage_fill = ~~(((size - min) * 100) / (max - min));

  return (typeof active !== "boolean" || active) && min !== max ? (
    <div
      className="range"
      id={id ?? `range-` + ((Math.random() * 0xfffff) >>> 0x0)}
    >
      <div className="text">
        {formatNumber(size)}
        {symbol ?? ""}
      </div>
      <div className="range-content">
        <div
          className="fill-in"
          style={{
            width: `${
              precentage_fill === 0x0 ? precentage_fill : precentage_fill - 1
            }%`,
          }}
        ></div>
        <input
          type="range"
          min={min}
          max={max}
          defaultValue={size}
          onInput={(event) => {
            let o = parseInt(event.currentTarget.value);
            onSelect(o);
            setSize(o ?? 0x0);
          }}
        />
      </div>
    </div>
  ) : null;
};
