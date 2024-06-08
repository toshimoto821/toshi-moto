import { useState, useEffect } from "react";
import { Flex, TextField, Text, Button, Callout } from "@radix-ui/themes";
import { CheckIcon } from "@radix-ui/react-icons";
import { AppContext } from "@root/providers/AppProvider";
import { type IAppMetaConfig } from "@machines/appMachine";

// @todo user should be able to set cache time for pricing data (simple),
// historic should be immutable

type IMessage = {
  message: string;
  type: "warning" | "error" | "success";
};
export const SettingsForm = () => {
  const defaultConfig = AppContext.useSelector(
    (current) => current.context.meta.config
  );

  const [message, setMessage] = useState<IMessage | null>(null);

  const { send } = AppContext.useActorRef();

  const [formState, setFormState] = useState({
    bitcoinNodeUrl: defaultConfig.bitcoinNodeUrl,
    historicalPriceUrl: defaultConfig.historicalPriceUrl,
    priceUrl: defaultConfig.priceUrl,
    maxConcurrentRequests: `${defaultConfig.maxConcurrentRequests}`,
    restTimeBetweenRequests: `${defaultConfig.restTimeBetweenRequests}`,
  });

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const maxConcurrentRequests = parseInt(formState.maxConcurrentRequests, 10);
    const restTimeBetweenRequests = parseInt(
      formState.restTimeBetweenRequests,
      10
    );

    const data = {
      meta: {
        config: {
          ...formState,
          maxConcurrentRequests,
          restTimeBetweenRequests,
        },
      },
    };
    send({ type: "APP_MACHINE_UPDATE_META", data });
    setMessage({ message: "Settings Saved", type: "success" });
  };

  const setField = (name: keyof IAppMetaConfig) => {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value as string;
      setFormState((prev) => ({ ...prev, [name]: value }));
    };
  };

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
  }, [message]);

  return (
    <form className="p-4" onSubmit={handleSubmit}>
      <Flex direction="column" gap="3">
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Node URL
          </Text>
          <TextField.Root
            defaultValue={defaultConfig.bitcoinNodeUrl}
            onChange={setField("bitcoinNodeUrl")}
            placeholder="Enter a name for this wallet (can be anything)"
          />
        </label>
        <label className="ml-4">
          <Text as="div" size="2" mb="1" weight="bold">
            Max Concurrent Requests
          </Text>
          <TextField.Root
            onChange={setField("maxConcurrentRequests")}
            defaultValue={defaultConfig.maxConcurrentRequests}
          />
        </label>

        <label className="ml-4">
          <Text as="div" size="2" mb="1" weight="bold">
            Rest Time Between Requests (ms - 1000 = 1 second)
          </Text>

          <div className="mb-2">
            <TextField.Root
              onChange={setField("restTimeBetweenRequests")}
              defaultValue={defaultConfig.restTimeBetweenRequests}
            />
          </div>
        </label>
      </Flex>

      <Flex direction="column" gap="3" className="my-4">
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Historical Pricing Url
          </Text>
          <TextField.Root
            defaultValue={defaultConfig.historicalPriceUrl}
            onChange={setField("historicalPriceUrl")}
            placeholder="https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range"
          />
        </label>
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Price URL
          </Text>
          <TextField.Root
            onChange={setField("priceUrl")}
            defaultValue={defaultConfig.priceUrl}
            placeholder="https://api.coingecko.com/api/v3/simple/price"
          />
        </label>
      </Flex>
      <Flex direction="column" gap="3" className="mt-4">
        <Button className="btn btn-primary">Save</Button>
        {message && (
          <Callout.Root
            color={message.type === "success" ? "green" : "red"}
            className="mb-2"
          >
            <Callout.Icon>
              <CheckIcon />
            </Callout.Icon>
            <Callout.Text>{message?.message}</Callout.Text>
          </Callout.Root>
        )}
      </Flex>
    </form>
  );
};
