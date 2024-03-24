import { useRef } from "react";
import { Flex, Box, IconButton, Text } from "@radix-ui/themes";
import { TrashIcon } from "@radix-ui/react-icons";
import { clsx } from "clsx";
import type { IRequest } from "@machines/network.types";
import { useEffect } from "react";

const getUrl = (url: string, type: keyof URL) => {
  let u: URL;
  if (/^\//.test(url)) {
    u = new URL(window.location.origin + url);
  } else {
    u = new URL(url);
  }

  return u[type] as string;
};

interface ILogTable {
  requests: IRequest[];
  activeRequestIndex: number | null;
  children?: React.ReactNode;
  onClickDeleteAll?: () => void;
  onClickRow?: ({
    request,
    index,
  }: {
    request: IRequest;
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
        <Box className="px-2 flex items-center">
          <IconButton variant="ghost" onClick={onClickDeleteAll}>
            <TrashIcon />
          </IconButton>
        </Box>
      </Flex>
      <Flex className="p-2 bg-gray-200 border border-r-0 border-l-0 border-gray-300">
        <Box className="w-8/12 md:w-7/12 px-2 border border-l-0 border-t-0 border-b-0 border-gray-300">
          URL
        </Box>
        <Box className="hidden md:block w-2/12 px-2 border border-l-0 border-t-0 border-b-0 border-gray-300">
          Type
        </Box>
        <Box className="hidden md:block w-1/12 px-2 border border-l-0 border-t-0 border-b-0 border-gray-300">
          Status
        </Box>
        <Box className="w-4/12 md:w-3/12 px-2">Timestamp</Box>
      </Flex>
      <div className="h-[478px] overflow-y-auto" ref={ref}>
        {requests.map((request, index) => (
          <Flex
            className={clsx(
              "p-2 border border-t-0 border-l-0 border-r-0 border-gray-200 hover:bg-mauve2 hover:cursor-pointer",
              {
                "bg-mauve2": activeRequestIndex === index,
              }
            )}
            key={index}
            onClick={() => onClickRow?.({ request, index })}
          >
            <Box className="w-8/12 md:w-7/12 border border-l-0 border-t-0 border-b-0 px-2 flex items-center overflow-scroll">
              <div className="flex flex-col justify-around">
                <div className=" text-gray-500 overflow-scroll leading-none">
                  <Text size="1">{getUrl(request.url, "pathname")}</Text>
                </div>
                <div className="leading-none">
                  <Text size="1">{getUrl(request.url, "host")}</Text>
                </div>
              </div>
            </Box>
            <Box className="px-2 hidden md:flex w-2/12 border border-l-0 border-t-0 border-b-0 items-center text-sm">
              {request.meta?.type}
            </Box>
            <Box className="px-2 hidden md:flex w-1/12 border border-l-0 border-t-0 border-b-0 items-center text-sm">
              {request.status ?? "loading..."}
            </Box>
            <Box className="px-2 w-3/12 flex items-center text-sm">
              <Text size="1" className="whitespace-nowrap">
                {new Date(request.createdAt).toLocaleString()}
              </Text>
            </Box>
          </Flex>
        ))}
      </div>
      {children && (
        <div className="absolute top-0 right-0 bg-white w-3/4 h-full border border-t-0">
          {children}
        </div>
      )}
    </div>
  );
};
