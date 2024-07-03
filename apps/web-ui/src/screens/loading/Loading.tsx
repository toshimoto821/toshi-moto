import { useEffect, useState } from "react";
import ToshiSvg from "../../assets/toshi.svg?react";
import { cn } from "@root/lib/utils";
type ILoading = {
  isLoading: boolean;
  children: React.ReactNode;
};
type ILoadingState = "hidden" | "shown" | "animating-on" | "animating-off";

export const Loading = ({ isLoading, children }: ILoading) => {
  // hidden, shown, or animating-on, animating-off
  const [loadingState, setLoadingState] = useState<ILoadingState>(
    isLoading ? "shown" : "hidden"
  );

  useEffect(() => {
    if (!isLoading) {
      setLoadingState("animating-off");
      setTimeout(() => {
        setLoadingState("hidden");
      }, 1000);
    }
  }, [isLoading]);

  const shouldShow = (state: ILoadingState) => {
    return (
      state === "shown" || state === "animating-on" || state === "animating-off"
    );
  };
  return (
    <>
      {shouldShow(loadingState) && (
        <div
          className={cn(
            "fixed z-[100] flex justify-center items-center h-screen w-screen  bg-gray-100",
            {
              "animate-fadeOut  from-gray-200 to-transparent":
                loadingState === "animating-off",
            }
          )}
          style={{
            background: "radial-gradient(#ccc, #fefefe)",
          }}
        >
          <div>
            <ToshiSvg width="388" />
          </div>
        </div>
      )}

      {children}
    </>
  );
};
