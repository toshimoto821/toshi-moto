import { DropdownMenu, IconButton, Text } from "@radix-ui/themes";
import { AppContext } from "@root/providers/AppProvider";
// import { type AppMachineMeta } from "@root/machines/appMachine";
import { useBtcPrice } from "@root/lib/hooks/useBtcPrice";
import { currencyList, currencySymbols } from "@root/lib/currencies";
import { ICurrency } from "@root/types";

export const CurrencyDropdown = () => {
  const { send } = AppContext.useActorRef();
  const { refresh } = useBtcPrice();
  const currency = AppContext.useSelector((current) => {
    return current.context.meta.currency;
  });

  const currentCurrency = AppContext.useSelector((current) => {
    return current.context.meta.currency;
  });

  const handleSelectCurrency = (evt: Event, currency: ICurrency) => {
    send({
      type: "APP_MACHINE_UPDATE_META",
      data: {
        meta: {
          currency,
        },
      },
    });
    refresh(evt, currency);
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" className="flex items-center">
            <Text size="1">
              {currencySymbols[currency]} {currency.toUpperCase()}
            </Text>
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Currencies</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              {currencyList.map((currency) => (
                <DropdownMenu.Item
                  shortcut={currency.value === currentCurrency ? "✓" : ""}
                  key={currency.value}
                  onSelect={(evt: Event) =>
                    handleSelectCurrency(evt, currency.value)
                  }
                >
                  {currency.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Separator />
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </>
  );
};
