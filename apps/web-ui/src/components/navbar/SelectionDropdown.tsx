// import { useState } from "react";
import { DropdownMenu, IconButton, Text } from "@radix-ui/themes";
import { CommitIcon } from "@radix-ui/react-icons";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import {
  selectUI,
  setUI,
  selectForecastEnabled,
  setForecastEnabled,
  setGraphByRange,
} from "@lib/slices/ui.slice";

type ISelectionDropdown = {
  onClickToggleInputAddresses: ({
    selected,
    filter,
  }: {
    selected: boolean;
    filter: boolean;
  }) => void;
};
export const SelectionDropdown = (props: ISelectionDropdown) => {
  const dispatch = useAppDispatch();

  const {
    privatePrice,
    graphPlotDots,
    graphBtcAllocation,
    graphSelectedTransactions,
    graphTimeFrameRange,
  } = useAppSelector(selectUI);

  const forecastEnabled = useAppSelector(selectForecastEnabled);
  const { onClickToggleInputAddresses } = props;

  const handleToggleForecast = () => {
    if (!forecastEnabled) {
      // Enable forecast and switch to 5Y timeframe
      dispatch(setForecastEnabled(true));
      dispatch(setGraphByRange("5Y"));
    } else {
      // Disable forecast
      dispatch(setForecastEnabled(false));
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton variant="ghost" className="flex items-center">
          <Text size="1">{graphSelectedTransactions.length}</Text>
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
              shortcut={graphBtcAllocation ? "✓" : ""}
              onSelect={() => {
                dispatch(setUI({ graphBtcAllocation: !graphBtcAllocation }));
              }}
            >
              BTC Allocation
            </DropdownMenu.Item>
            <DropdownMenu.Item
              shortcut={graphPlotDots ? "✓" : ""}
              onSelect={() => {
                dispatch(setUI({ graphPlotDots: !graphPlotDots }));
              }}
            >
              Transactions
            </DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Separator />

        {/* Forecast toggle - always show */}
        <DropdownMenu.Item
          shortcut={forecastEnabled ? "✓" : ""}
          onSelect={handleToggleForecast}
        >
          {forecastEnabled ? "Forecast ON" : "Forecast"}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />

        <DropdownMenu.Item
          shortcut={privatePrice ? "✓" : ""}
          onSelect={() => {
            dispatch(setUI({ privatePrice: !privatePrice }));
          }}
        >
          Hide Price
        </DropdownMenu.Item>
        <DropdownMenu.Separator />

        <DropdownMenu.Item
          disabled={graphSelectedTransactions.length === 0}
          color="red"
          onSelect={() => {
            dispatch(
              setUI({
                graphSelectedTransactions: [],
              })
            );
          }}
        >
          Clear
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
