import { useState, useEffect } from "react";
import { Text, Button, Tabs, Box, Separator } from "@radix-ui/themes";
import { CaretUpIcon, CaretDownIcon } from "@radix-ui/react-icons";
import { LogTable } from "./components/LogTable";
import { LogDetail } from "./components/LogDetail/LogDetail";
import { IconButton } from "@radix-ui/themes";
import { LogProgress } from "./components/LogProgress";
import { cn, deleteAllCookies } from "@lib/utils";
import { SettingsForm } from "../settings/SettingsForm";
import { Popover } from "../popover/Popover";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import {
  selectRequests,
  selectCountRequests,
  deleteAllRequests,
} from "@root/lib/slices/network.slice";
import { selectAppVersion } from "@root/lib/slices/config.slice";

type INetworkLog = {
  expanded?: boolean;
};

export const NetworkLog = (props: INetworkLog) => {
  const { expanded: defaultExpanded = false } = props;

  const storedVersion = useAppSelector(selectAppVersion);

  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

  const [activeRequestIndex, setActiveRequestIndex] = useState<number | null>(
    null
  );

  const [scrollYPos, setScrollYPos] = useState(0);

  useEffect(() => {
    const body = document.querySelector("body");
    if (body) {
      setScrollYPos(window.scrollY);
      body.style.overflow = expanded ? "hidden" : "auto";
      body.style.height = expanded ? "100vh" : "auto";
      if (!expanded) window.scrollTo(0, scrollYPos);
    }
    return () => {
      if (body) {
        body.style.overflow = "auto";
        body.style.height = "auto";
      }
    };
  }, [expanded]);

  const requests = useAppSelector(selectRequests);
  const dispatch = useAppDispatch();
  const counts = useAppSelector(selectCountRequests);

  const handleRowClick = ({ index }: { index: number }) => {
    setActiveRequestIndex(index);
  };
  const handleClose = () => {
    setActiveRequestIndex(null);
  };

  const handleDeleteAll = () => {
    dispatch(deleteAllRequests());
  };

  const handleReload = () => {
    try {
      // this breaks push notifications subscriptions
      // const registrations = navigator.serviceWorker
      //   .getRegistrations()
      //   .then(function (registrations) {
      //     for (const registration of registrations) {
      //       registration.unregister();
      //     }
      //   });
      // const names = caches.keys().then(function (names) {
      //   for (const name of names) {
      //     caches.delete(name);
      //   }
      // });
      // deleteAllCookies();
      // Promise.all([names]).then(() => window.location.reload());
      window.location.reload();
    } catch (ex) {
      // http can throw errors for serviceWorker
      console.log(ex);
      window.location.reload();
    }
  };

  const request =
    typeof activeRequestIndex === "number"
      ? requests[activeRequestIndex]
      : null;

  const isStandalone =
    "standalone" in window.navigator && window.navigator["standalone"];
  const className = expanded ? "fixed top-0 h-screen w-screen z-50" : "";

  return (
    <div className={className}>
      {expanded && (
        <div
          onClick={() => setExpanded(false)}
          className="bg-black bg-opacity-50 w-screen h-screen"
        ></div>
      )}
      <div
        className={cn("fixed bottom-0 left-0 w-screen bg-white z-50 ", {
          "pb-6": isStandalone,
        })}
      >
        <LogProgress
          value={counts.complete + 1}
          max={counts.queued + counts.pending + counts.complete + 1}
        />

        <Tabs.Root defaultValue="network" className="border-t">
          <Tabs.List>
            <Tabs.Trigger
              value="network"
              onClick={() => setExpanded(true)}
              className=""
            >
              Network
            </Tabs.Trigger>
            <Tabs.Trigger value="settings" onClick={() => setExpanded(true)}>
              Settings
            </Tabs.Trigger>
            <div className="flex-1 flex flex-col">
              <div className={cn("flex justify-between flex-grow")}>
                <div className="flex-grow p-2 flex items-center font-mono text-xs">
                  <Button
                    variant="ghost"
                    size="2"
                    onClick={() => handleReload()}
                  >
                    v{storedVersion}
                  </Button>
                </div>
                <div className="p-2 flex items-center">
                  <Popover
                    title="Network Requests: Queued"
                    text={(classNames) => (
                      <Text
                        size="1"
                        className={`${classNames} text-gray-500 pr-1 font-mono`}
                      >
                        <span>{counts.queued}</span>
                        <span className="hidden md:inline pl-1">
                          queued
                        </span>{" "}
                      </Text>
                    )}
                  >
                    There are {counts.queued} waiting to be sent. Not all
                    requests are fire at the same time to prevent server
                    overload and so that public apis such as Mempool.space dont
                    block the request.
                  </Popover>
                  <Separator orientation="vertical" />
                  <Popover
                    title="Network Requests: Loading"
                    text={(classNames) => (
                      <Text
                        size="1"
                        className={`${classNames} text-gray-500  pl-1 pr-1 font-mono`}
                      >
                        <span>{counts.pending}</span>
                        <span className="hidden md:inline pl-1">
                          loading
                        </span>{" "}
                      </Text>
                    )}
                  >
                    Ther are {counts.pending} currently in loading state,
                    waiting for the server to respond.
                  </Popover>

                  <Separator orientation="vertical" />
                  <Popover
                    title="Network Requests: Completed"
                    text={(classNames) => (
                      <Text
                        size="1"
                        className={`${classNames} text-gray-500 pl-1 font-mono`}
                      >
                        <span>{counts.complete}</span>
                        <span className="hidden md:inline pl-1">completed</span>
                      </Text>
                    )}
                  >
                    Ther are {counts.complete} currently in complete state.
                  </Popover>
                </div>
                <div className="p-2 flex items-center mr-2">
                  <IconButton
                    onClick={() => setExpanded(!expanded)}
                    variant="ghost"
                  >
                    {expanded ? <CaretDownIcon /> : <CaretUpIcon />}
                  </IconButton>
                </div>
              </div>
            </div>
          </Tabs.List>

          <Box className={cn({ "min-h-[550px]": expanded })}>
            <Tabs.Content value="network">
              {expanded && (
                <div>
                  <LogTable
                    activeRequestIndex={activeRequestIndex}
                    requests={requests}
                    onClickRow={handleRowClick}
                    onClickDeleteAll={handleDeleteAll}
                  >
                    {request && (
                      <LogDetail request={request} handleClose={handleClose} />
                    )}
                  </LogTable>
                </div>
              )}
            </Tabs.Content>

            <Tabs.Content value="settings">
              {expanded && <SettingsForm />}
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </div>
    </div>
  );
};
