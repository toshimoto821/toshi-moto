import { useGetDataImportedQuery } from "@lib/slices/api.slice";
import { useEffect, useState } from "react";
import { Loading } from "./Loading";

const MAX_TRY_COUNT = 60;
const WAIT_TIME = 3000;

export const WaitForData = ({ children }: { children: React.ReactNode }) => {
  const [tryCount, setTryCount] = useState(0);
  const { data, error } = useGetDataImportedQuery({ tryCount });

  useEffect(() => {
    if (!data?.status && tryCount < MAX_TRY_COUNT) {
      setTimeout(() => {
        setTryCount(tryCount + 1);
      }, WAIT_TIME);
    }
  }, [tryCount, data?.status]);

  if (!data?.status && tryCount < MAX_TRY_COUNT) {
    // dont want to flicker between loading and setting up...
    // so if more than 2 tries, just assume it's setting up
    if (error || tryCount > 2) {
      return (
        <Loading message="Setting up Toshi Moto, this may take a few minutes..." />
      );
    }
    return <Loading message="Loading..." />;
  }
  return children;
};
