import { useEffect } from "react";

type IUseAppReload = {
  storedVersion: string;
};
export const useAppReload = (props: IUseAppReload) => {
  const { storedVersion } = props;
  const currentVersion = "__VERSION__";
  useEffect(() => {}, [currentVersion, storedVersion]);
};
