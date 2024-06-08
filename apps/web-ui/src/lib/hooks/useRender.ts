import { useState } from "react";
export const useRender = () => {
  const [, setTs] = useState(new Date().getTime());

  const render = () => {
    setTs(new Date().getTime());
  };

  return render;
};
