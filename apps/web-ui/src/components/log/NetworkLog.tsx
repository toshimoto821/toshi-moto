import { useState, useEffect } from "react";
import { Text, Button, Tabs, Box, Separator } from "@radix-ui/themes";
import { CaretUpIcon, CaretDownIcon } from "@radix-ui/react-icons";
import { LogTable } from "./components/LogTable";
import { LogDetail } from "./components/LogDetail/LogDetail";
import { NetworkContext, AppContext } from "@providers/AppProvider";
import { IconButton } from "@radix-ui/themes";
import { LogProgress } from "./components/LogProgress";
import { cn } from "@lib/utils";
import { SettingsForm } from "../settings/SettingsForm";

type INetworkLog = {
  expanded?: boolean;
};

export const NetworkLog = (props: INetworkLog) => {
  const { expanded: defaultExpanded = false } = props;
  const storedVersion = AppContext.useSelector(
    (current) => current.context.meta.appVersion
  );
  const { send: networkActorSend } = NetworkContext.useActorRef();
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

  const requests = NetworkContext.useSelector((current) => {
    return current.context.requests.sort((a, b) => {
      return a.createdAt - b.createdAt;
    });
  });

  const queuedRequests = NetworkContext.useSelector((current) => {
    return current.context.queuedRequests;
  });

  const loadingOrQueuedRequest = NetworkContext.useSelector((current) => {
    return current.context.loadingOrQueued;
  });

  const loadingRequests = NetworkContext.useSelector((current) => {
    return current.context.loadingRequests;
  });

  const completedRequests = NetworkContext.useSelector((current) => {
    return current.context.completedRequests;
  });

  const handleRowClick = ({ index }: { index: number }) => {
    setActiveRequestIndex(index);
  };
  const handleClose = () => {
    setActiveRequestIndex(null);
  };

  const handleDeleteAll = () => {
    networkActorSend({ type: "DELETE_ALL" });
  };

  const handleReload = () => {
    const registrations = navigator.serviceWorker
      .getRegistrations()
      .then(function (registrations) {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    const names = caches.keys().then(function (names) {
      for (let name of names) {
        caches.delete(name);
      }
    });
    Promise.all([registrations, names]).then(() => window.location.reload());
  };

  const request =
    typeof activeRequestIndex === "number"
      ? requests[activeRequestIndex]
      : null;

  const isStandalone =
    "standalone" in window.navigator && window.navigator["standalone"];
  return (
    <div
      className={cn("fixed bottom-0 left-0 w-screen bg-white z-50 ", {
        "pb-6": isStandalone,
      })}
    >
      <LogProgress
        value={completedRequests.size}
        max={loadingOrQueuedRequest.size}
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
                <Button variant="ghost" size="2" onClick={() => handleReload()}>
                  v{storedVersion}
                </Button>
              </div>
              <div className="p-2 flex items-center">
                <Text size="1" className="text-gray-500 pr-1 ">
                  <span>{queuedRequests.size}</span>
                  <span className="hidden md:inline pl-1">queued</span>{" "}
                </Text>
                <Separator orientation="vertical" />
                <Text size="1" className="text-gray-500 pl-1 pr-1">
                  <span>{loadingRequests.size}</span>
                  <span className="hidden md:inline pl-1">loading</span>{" "}
                </Text>
                <Separator orientation="vertical" />
                <Text size="1" className="text-gray-500 pl-1">
                  <span>{completedRequests.size}</span>
                  <span className="hidden md:inline pl-1">completed</span>
                </Text>
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
  );
};
