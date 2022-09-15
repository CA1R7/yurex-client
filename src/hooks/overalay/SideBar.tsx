import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";

import settingsImage from "../../layout/img/settings.svg";
import inventoryImage from "../../layout/img/inventory.svg";
import shopeImage from "../../layout/img/shope.svg";

import toast from "react-hot-toast";

export const OveralaySidebar: FC = () => {
  const navigate = useNavigate();

  return (
    <div id="overalay-sidebar">
      <div className="overalay-sidebar-buttons">
        <Button
          className="overalay-sidebar-buttons-button settings"
          onClick={() => navigate("/settings")}
          sounded={true}
        >
          <img src={settingsImage} />
        </Button>
        <Button
          className="overalay-sidebar-buttons-button"
          onClick={() => navigate("/inventory")}
          sounded={true}
        >
          <img src={inventoryImage} />
        </Button>
        <Button
          className="overalay-sidebar-buttons-button"
          onClick={() => toast.error("Coming soon")}
          sounded={true}
        >
          <img src={shopeImage} />
        </Button>
      </div>
    </div>
  );
};
