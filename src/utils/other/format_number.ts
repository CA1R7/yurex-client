export const formatNumber = (__num: number | string): string => {
  let num = __num.toString().replace(/[^0-9.]/g, "");

  let _num: number = typeof __num === "string" ? parseFloat(__num) : __num;

  if (_num < 1000) {
    return num;
  }

  let si = [
    { v: 1e3, s: "k" },
    { v: 1e6, s: "m" },
    { v: 1e9, s: "b" },
  ];

  let index;
  for (index = si.length - 1; index > 0; index--) {
    if (_num >= si[index].v) {
      break;
    }
  }
  const amount =
    (_num / si[index].v).toFixed(2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") +
    si[index].s;

  return amount.length === 0x1 ? `${amount}.00` : amount;
};
