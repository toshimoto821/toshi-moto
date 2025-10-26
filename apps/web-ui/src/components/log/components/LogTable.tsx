import { useRef, useEffect } from "react";
import { Flex, Box, IconButton, Text } from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";
import { clsx } from "clsx";

import { type APIRequestResponse } from "@root/lib/slices/network.slice.types";

interface ILogTable {
  requests: APIRequestResponse[];
  activeRequestIndex: number | null;
  children?: React.ReactNode;
  onClickDeleteAll?: () => void;
  onClickRow?: ({
    request,
    index,
  }: {
    request: APIRequestResponse;
    index: number;
  }) => void;
}

export const LogTable = ({
  children,
  requests = [],
  onClickRow,
  onClickDeleteAll,
  activeRequestIndex,
}: ILogTable) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [requests.length]);

  return (
    <div>
      <Flex className="p-2">
        <IconButton variant="ghost" size="1" onClick={onClickDeleteAll}>
          <TrashIcon />
        </IconButton>
      </Flex>
      <Flex className="p-2 bg-gray-200 dark:bg-[#2a2a2a] border border-r-0 border-l-0 border-gray-300 dark:border-[#404040]">
        <Box className="w-6/12 md:w-7/12 px-2 border border-l-0 border-t-0 border-b-0 border-gray-300 dark:border-[#404040]">
          <Text size="1" className="dark:text-gray-300">
            URL
          </Text>
        </Box>
        <Box className="hidden md:block w-2/12 px-2 border border-l-0 border-t-0 border-b-0 border-gray-300 dark:border-[#404040]">
          <Text size="1" className="dark:text-gray-300">
            Type
          </Text>
        </Box>
        <Box className="w-2/12 md:w-1/12 px-2 border border-l-0 border-t-0 border-b-0 border-gray-300 dark:border-[#404040]">
          <Text size="1" className="dark:text-gray-300">
            Status
          </Text>
        </Box>
        <Box className="w-2/12 px-2">
          <Text size="1" className="dark:text-gray-300">
            Time
          </Text>
        </Box>
      </Flex>
      <div className="h-[478px] overflow-y-auto" ref={ref}>
        {requests.map((request, index) => (
          <Flex
            className={clsx(
              "p-2 border border-t-0 border-l-0 border-r-0 border-gray-200 dark:border-[#404040] hover:cursor-pointer",
              {
                "bg-blue-100 dark:bg-blue-900": activeRequestIndex === index,
                "hover:bg-mauve2 dark:hover:bg-[#2a2a2a]":
                  activeRequestIndex !== index,
                "bg-red-100 dark:bg-red-900": request.status === "rejected",
                "hover:bg-red-200 dark:hover:bg-red-800":
                  request.status === "rejected",
              }
            )}
            key={index}
            onClick={() => onClickRow?.({ request, index })}
          >
            <Box className="w-6/12 md:w-7/12 border border-l-0 border-t-0 border-b-0 dark:border-[#404040] px-2 flex items-center overflow-scroll">
              <div className="flex flex-col justify-around">
                <div className=" text-gray-500 dark:text-gray-400 overflow-scroll leading-none">
                  <Text size="1">{request.url.pathname}</Text>
                </div>
                <div className="leading-none">
                  <Text size="1" className="dark:text-gray-300">
                    {request.url.origin}
                  </Text>
                </div>
              </div>
            </Box>
            <Box className="px-2 hidden md:flex w-2/12 border border-l-0 border-t-0 border-b-0 dark:border-[#404040] items-center text-sm">
              <Text size="1" className="dark:text-gray-300">
                {request.meta?.type}
              </Text>
            </Box>
            <Box className="px-2 flex w-2/12 md:w-1/12 border border-l-0 border-t-0 border-b-0 dark:border-[#404040] items-center text-sm">
              <Text size="1" className="dark:text-gray-300">
                {request.status ?? "loading..."}
              </Text>
            </Box>
            <Box className="px-2 w-2/12 flex items-center text-sm">
              <Text
                size="1"
                className="whitespace-nowrap hidden md:inline dark:text-gray-300"
              >
                {new Date(request.startedTimeStamp).toLocaleString()}
              </Text>
              <Text
                size="1"
                className="whitespace-nowrap inline md:hidden dark:text-gray-300"
              >
                {request.fulfilledTimeStamp &&
                  new Date(request.fulfilledTimeStamp).toLocaleTimeString()}
              </Text>
            </Box>
          </Flex>
        ))}
      </div>
      {children && (
        <div className="absolute top-0 right-0 bg-white dark:bg-[#1a1a1a] w-3/4 h-full border border-t-0 dark:border-[#404040]">
          {children}
        </div>
      )}
    </div>
  );
};
