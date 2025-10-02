import { useGetDataImportedQuery } from "@lib/slices/api.slice";
import { useEffect, useState } from "react";

const MAX_TRY_COUNT = 20;
const WAIT_TIME = 2000;

export const WaitForData = ({
  loading,
  children,
}: {
  loading: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [tryCount, setTryCount] = useState(0);
  const { data } = useGetDataImportedQuery({ tryCount });

  useEffect(() => {
    if (!data?.status && tryCount < MAX_TRY_COUNT) {
      setTimeout(() => {
        setTryCount(tryCount + 1);
      }, WAIT_TIME);
    }
  }, [tryCount, data?.status]);

  if (!data?.status && tryCount < MAX_TRY_COUNT) {
    return loading;
  }
  return children;
};
