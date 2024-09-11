// import { useState } from "react";
import { DropdownMenu, IconButton, Text } from "@radix-ui/themes";
import { CommitIcon } from "@radix-ui/react-icons";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import { selectUI, setUI } from "@lib/slices/ui.slice";
import { useBtcHistoricPrices } from "@root/lib/hooks/useBtcHistoricPrices";
import type { IForcastModelType } from "@lib/slices/price.slice";
import { generateRandomPriceSeries } from "../graphs/graph-utils";
import { setForecast } from "@lib/slices/price.slice";

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

  const forcastModel = useAppSelector((state) => state.price.forecastModel);
  const btcPrices = useBtcHistoricPrices();
  const prices = btcPrices.prices ? btcPrices.prices.slice() : [];
  const { btcPrice } = useAppSelector((state) => state.price);

  const handleForcast = (forecastModel: IForcastModelType) => {
    // this doesnt work great because async issues
    // for now just leaving the forcast to be based
    // off the current time range.
    // handleUpdateTimeframe("5Y")();
    const firstDate = new Date(prices[0].closeTime).getTime();

    const lastDate = new Date(prices[prices.length - 1].closeTime).getTime();

    const startDate = lastDate;
    const endDate = lastDate + (lastDate - firstDate);

    let bullishFactor = 0.08;
    let bearishFactor = 0.001;
    switch (forecastModel) {
      case "SAYLOR":
        bullishFactor = 0.08;
        bearishFactor = 0.001;

        break;
      case "BULL":
        bullishFactor = 0.04;
        bearishFactor = 0.001;

        break;
      case "CRAB":
        bullishFactor = 0.12;
        bearishFactor = 0.1;

        break;
      case "BEAR":
        bullishFactor = 0.01;
        bearishFactor = 0.04;
        break;
    }

    const forecastPrices = generateRandomPriceSeries({
      initialPrice: btcPrice!,
      gap: "1W",
      startDate,
      endDate,
      bullishFactor,
      bearishFactor,
    });
    dispatch(
      setForecast({
        forecastModel,
        forecastPrices,
      })
    );
  };
  const {
    privatePrice,
    graphPlotDots,
    graphBtcAllocation,
    graphSelectedTransactions,
  } = useAppSelector(selectUI);
  const { onClickToggleInputAddresses } = props;

  return (
    <>
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
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Forcast</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item
                shortcut={forcastModel === "SAYLOR" ? "✓" : ""}
                onSelect={() => {
                  handleForcast("SAYLOR");
                }}
              >
                Saylor
              </DropdownMenu.Item>
              <DropdownMenu.Item
                shortcut={forcastModel === "BULL" ? "✓" : ""}
                onSelect={() => {
                  handleForcast("BULL");
                }}
              >
                Bull
              </DropdownMenu.Item>
              <DropdownMenu.Item
                shortcut={forcastModel === "CRAB" ? "✓" : ""}
                onSelect={() => {
                  handleForcast("CRAB");
                }}
              >
                Crab
              </DropdownMenu.Item>
              <DropdownMenu.Item
                shortcut={forcastModel === "BEAR" ? "✓" : ""}
                onSelect={() => {
                  handleForcast("BEAR");
                }}
              >
                Bear
              </DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
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
    </>
  );
};
