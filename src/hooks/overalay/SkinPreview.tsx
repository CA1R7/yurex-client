import React, { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { skins_preview } from "../../utils/other/skins_preview";

export const SkinPreview: FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    skins_preview.init();
  }, []);
  return (
    <canvas id="skin-preview" onClick={() => navigate("/profiles")}></canvas>
  );
};
