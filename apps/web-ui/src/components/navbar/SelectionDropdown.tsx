// import { useState } from "react";
import { DropdownMenu, IconButton, Text } from "@radix-ui/themes";
import { CommitIcon } from "@radix-ui/react-icons";
import { AppContext } from "@root/providers/AppProvider";
import { type AppMachineMeta } from "@root/machines/appMachine";
type ISelectionDropdown = {
  onClickUpdateMeta: (meta: Partial<AppMachineMeta>) => void;
  onClearSelection: () => void;
  onClickToggleInputAddresses: ({
    selected,
    filter,
  }: {
    selected: boolean;
    filter: boolean;
  }) => void;
};
export const SelectionDropdown = (props: ISelectionDropdown) => {
  const { onClearSelection, onClickToggleInputAddresses, onClickUpdateMeta } =
    props;

  const selectedTxs =
    AppContext.useSelector((current) => {
      return new Set(current.context.selectedTxs);
    }) || new Set();

  const showPlotDots = AppContext.useSelector((current) => {
    return current.context.meta.showPlotDots;
  });

  const showBtcAllocation = AppContext.useSelector((current) => {
    return current.context.meta.showBtcAllocation;
  });

  const privatePrice = AppContext.useSelector((current) => {
    return current.context.meta.privatePrice;
  });

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" className="flex items-center">
            <Text size="1">{selectedTxs.size}</Text>
            <CommitIcon width="16" height="16" className="ml-2" />{" "}
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            onSelect={() => {
              onClickToggleInputAddresses({
                selected: true,
                filter: false,
              });
            }}
          >
            Input Addresses
          </DropdownMenu.Item>

          <DropdownMenu.Separator />
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>View</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item
                shortcut={showBtcAllocation ? "✓" : ""}
                onSelect={() => {
                  onClickUpdateMeta({
                    showBtcAllocation: !showBtcAllocation,
                    showPlotDots,
                    privatePrice,
                  });
                }}
              >
                BTC Allocation
              </DropdownMenu.Item>
              <DropdownMenu.Item
                shortcut={showPlotDots ? "✓" : ""}
                onSelect={() => {
                  onClickUpdateMeta({
                    showPlotDots: !showPlotDots,
                    showBtcAllocation,
                    privatePrice,
                  });
                }}
              >
                Transactions
              </DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            shortcut={privatePrice ? "✓" : ""}
            onSelect={() => {
              onClickUpdateMeta({
                showPlotDots,
                showBtcAllocation,
                privatePrice: !privatePrice,
              });
            }}
          >
            Hide Price
          </DropdownMenu.Item>
          <DropdownMenu.Separator />

          <DropdownMenu.Item
            disabled={selectedTxs.size === 0}
            color="red"
            onSelect={onClearSelection}
          >
            Clear
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </>
  );
};
