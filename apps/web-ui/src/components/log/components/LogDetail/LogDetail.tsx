import { useState } from "react";
import { Tabs, Text, IconButton } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
// import { WalletContext } from "@providers/AppProvider";
import { LogDetailActions } from "./LogDetailActions";
import { LogDetailTab } from "./LogDetailTab";
import { LogDescription } from "./LogDescription";
import type { APIRequestResponse } from "@lib/slices/network.slice.types";

type ILogDetail = {
  request: APIRequestResponse;
  handleClose?: () => void;
};
export const LogDetail = ({ request, handleClose }: ILogDetail) => {
  const [activeTab, setActiveTab] = useState("details");
  // console.log(request.response.data);
  // console.log(walletActorRef);

  const handleDelete = () => {
    if (handleClose) {
      setActiveTab("response");
      handleClose();
    }
  };
  return (
    <div className="h-full flex flex-col">
      <Tabs.Root
        value={activeTab}
        onValueChange={(value) => setActiveTab(value)}
        className="h-full flex flex-col border border-gray-300 border-b-0 border-l-0 border-r-0"
      >
        <Tabs.List className="flex-shrink-0 mt-[1px]  ">
          <div className="flex h-full items-center justify-center w-8">
            <IconButton
              variant="ghost"
              color="gray"
              onClick={handleClose}
              className=" p-2"
            >
              <Cross2Icon width="12" height="12" />
            </IconButton>
          </div>
          <Tabs.Trigger value="details">Details</Tabs.Trigger>
          <Tabs.Trigger value="description">Description</Tabs.Trigger>
          <Tabs.Trigger value="actions">Actions</Tabs.Trigger>
        </Tabs.List>
        <div className="flex-grow overflow-auto">
          <Tabs.Content value="details">
            <LogDetailTab request={request} />
          </Tabs.Content>

          <Tabs.Content value="description">
            <LogDescription request={request} />
          </Tabs.Content>

          <Tabs.Content value="actions">
            <Text size="2">
              <LogDetailActions request={request} onDelete={handleDelete} />
            </Text>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
};
