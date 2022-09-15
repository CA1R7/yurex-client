import yurexLogo from "../layout/img/yurex-logo.png";

export const setFavIcon = () => {
  const ling_element = document.createElement("link");
  ling_element.rel = "shortcut icon";
  ling_element.href = yurexLogo;
  ling_element.type = "image/png";
  document.head.appendChild(ling_element);
};
