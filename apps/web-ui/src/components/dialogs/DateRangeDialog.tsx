import { Dialog, Button, Flex, Tabs, Box, Text } from "@radix-ui/themes";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import * as d3 from "d3";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import { selectUI, setUI } from "@root/lib/slices/ui.slice";

type IDateRangeDialog = {
  open: boolean;
  onClose: () => void;
  defaultTab: "start" | "end";
};
const oneYearAgo = d3.timeDay(
  new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 365)
);

export const DateRangeDialog = (props: IDateRangeDialog) => {
  const { open, onClose, defaultTab = "start" } = props;
  const dispatch = useAppDispatch();

  const { graphStartDate, graphEndDate } = useAppSelector(selectUI);

  const [startDate, setStartDate] = useState<Date>(
    graphStartDate ? new Date(graphStartDate) : oneYearAgo
  );

  const [endDate, setEndDate] = useState<Date>(
    graphStartDate ? new Date(graphStartDate) : d3.timeDay(new Date())
  );

  useEffect(() => {
    setStartDate(new Date(graphStartDate));
    setEndDate(new Date(graphEndDate));
  }, [graphEndDate, graphStartDate]);

  const handleStartDate = (date: Date) => {
    if (date) {
      setStartDate(date);
    }
  };

  const handleEndDate = (date: Date) => {
    if (date) {
      setEndDate(date);
    }
  };

  const handleSave = (sd = startDate, ed = endDate) => {
    dispatch(
      setUI({
        graphStartDate: sd.getTime(),
        graphEndDate: ed.getTime(),
        graphTimeFrameRange: null,
      })
    );

    onClose();
  };

  return (
    <Dialog.Root open={open}>
      <Dialog.Content className="min-h-[505px] flex flex-col">
        <Dialog.Title>Select Date Range</Dialog.Title>

        <div className="flex flex-col justify-between flex-1">
          <div className="flex-1">
            <Tabs.Root defaultValue={defaultTab}>
              <Tabs.List>
                <Tabs.Trigger value="start">Start Date</Tabs.Trigger>
                <Tabs.Trigger value="end">End Date</Tabs.Trigger>
              </Tabs.List>

              <Box px="4" pt="3" pb="2">
                <Tabs.Content value="start" className="flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={startDate}
                    defaultMonth={startDate}
                    disabled={[
                      {
                        after: new Date(),
                      },
                      {
                        after: endDate,
                      },
                    ]}
                    onSelect={handleStartDate}
                  />
                </Tabs.Content>

                <Tabs.Content value="end" className="flex justify-center">
                  <DayPicker
                    mode="single"
                    disabled={[
                      {
                        after: new Date(),
                      },
                      {
                        before: startDate,
                      },
                    ]}
                    selected={endDate}
                    defaultMonth={endDate}
                    onSelect={handleEndDate}
                  />
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </div>
          <div className="flex items-center">
            <div className="flex items-center justify-around flex-1 mx-4">
              <div>
                {startDate && <Text size="1">{format(startDate, "PP")}</Text>}
              </div>
              <div>
                <ArrowRightIcon width="16" height="16" />
              </div>
              <div>
                {endDate && <Text size="1">{format(endDate, "PP")}</Text>}
              </div>
            </div>
            <Flex gap="3">
              <Button variant="soft" color="gray" onClick={onClose}>
                Cancel
              </Button>

              <Dialog.Close>
                <Button onClick={() => handleSave()}>Save</Button>
              </Dialog.Close>
            </Flex>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};
