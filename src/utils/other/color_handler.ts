import { RGBColor } from "./color_picker";

export const rgbaToBytes = (color: string): number[] => {
  return color
    .substring(color.indexOf("("))
    .split(",")
    .map((b) => parseInt(b.trim().replace(/(\)|\()/, "")));
};

export const customColorBytes = (
  color: string,
  range: number,
  transparent: number = 100,
  old: boolean = false,
) => {
  let colorBytes = rgbaToBytes(color);

  if (old) {
    return `rgb(${colorBytes[0x0] * range}, ${colorBytes[0x1] * range}, ${
      colorBytes[0x2] * range
    })`;
  }

  let hexColor = "";

  for (let colorByte of colorBytes) {
    hexColor += ("00" + (~~colorByte).toString(16)).slice(-2);
  }

  if (hexColor.length === 8) {
    hexColor = hexColor.substring(0, 6);
  }

  if (hexColor.length === 6) {
    const decimalColor = parseInt(hexColor, 16);
    let r = (decimalColor >> 16) + range;
    r > 255 && (r = 255);
    r < 0 && (r = 0);
    let g = (decimalColor & 0x0000ff) + range;
    g > 255 && (g = 255);
    g < 0 && (g = 0);
    let b = ((decimalColor >> 8) & 0x00ff) + range;
    b > 255 && (b = 255);
    b < 0 && (b = 0);
    return `rgb(${r}, ${g}, ${b} ${transparent ? `, ${transparent}` : ""})`;
  } else {
    console.log(`Invalid hex color: ${hexColor}`);
  }
};

export const bytesToStringColor = (
  r: number,
  g: number,
  b: number,
  a?: number,
): string => {
  return `rgb${a ? "a" : ""}(${r}, ${g}, ${b} ${a ? `, ${a}` : ""})`;
};

export const bytesToHex = ({ r, g, b }: RGBColor) => {
  let colors: string[] = [];

  for (let color of [r, g, b]) {
    colors.push(("00" + (~~color).toString(16)).slice(-2));
  }

  return `#${colors.join("")}`;
};
