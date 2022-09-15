import toast from "react-hot-toast";
import { getValueOfQuery } from "./queries_parser";

export const check_params = () => {
  const queriesRemoved = document.URL.replace(/\?.*/, "");
  const message = getValueOfQuery("msg", document.URL);
  const messageType = getValueOfQuery("type", document.URL);
  const data = getValueOfQuery("data", document.URL);
  const code = getValueOfQuery("code", document.URL);

  if (message) {
    if (messageType === "error") {
      toast.error(message);
    } else {
      toast.success(message);
    }
  }

  if (data && code) {
    if (code === "1") {
      localStorage.setItem("token", data);
    }
  }


  if (location.href !== queriesRemoved) {
    location.href = queriesRemoved;
  }
};
