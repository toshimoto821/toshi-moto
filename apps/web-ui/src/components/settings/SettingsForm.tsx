import { useState, useEffect } from "react";
import { Flex, TextField, Text, Button, Callout } from "@radix-ui/themes";
import { CheckIcon } from "@radix-ui/react-icons";

import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import {
  selectApiConfig,
  selectNetworkConfig,
  setConfig,
  type ConfigState,
} from "@root/lib/slices/config.slice";

export type IAppMetaConfig = {
  bitcoinNodeUrl: string;
  historicalPriceUrl: string;
  priceUrl: string;
  restTimeBetweenRequests: number;
  maxConcurrentRequests: number;
};

type IMessage = {
  message: string;
  type: "warning" | "error" | "success";
};
export const SettingsForm = () => {
  const apiConfig = useAppSelector(selectApiConfig);
  const networkConfig = useAppSelector(selectNetworkConfig);

  const [message, setMessage] = useState<IMessage | null>(null);

  const dispatch = useAppDispatch();

  const [formState, setFormState] = useState({
    api: {
      priceUrl: apiConfig.priceUrl,
      nodeUrl: apiConfig.nodeUrl,
      historicPriceUrl: apiConfig.historicPriceUrl,
      url: apiConfig.url,
    },
    network: {
      conconcurrentRequests: networkConfig.conconcurrentRequests,
      timeBetweenRequests: networkConfig.timeBetweenRequests,
    },
  });

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    // @todo error handline
    dispatch(
      setConfig({
        network: formState.network,
        api: formState.api,
      })
    );
    setMessage({ message: "Settings Saved", type: "success" });
  };

  const setApiField = (name: keyof ConfigState["api"]) => {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value as string;

      setFormState((existing) => ({
        ...existing,
        api: {
          ...existing.api,
          [name]: value,
        },
      }));
    };
  };

  const setNetworkField = (name: keyof ConfigState["network"]) => {
    return (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(evt.target.value, 10);

      setFormState((existing) => ({
        ...existing,
        network: {
          ...existing.network,
          [name]: isNaN(value) ? "" : value,
        },
      }));
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
            value={formState.api.nodeUrl}
            onChange={setApiField("nodeUrl")}
            placeholder="Enter a name for this wallet (can be anything)"
          />
        </label>
        <label className="ml-4">
          <Text as="div" size="2" mb="1" weight="bold">
            Max Concurrent Requests
          </Text>
          <TextField.Root
            onChange={setNetworkField("conconcurrentRequests")}
            value={formState.network.conconcurrentRequests}
          />
        </label>

        <label className="ml-4">
          <Text as="div" size="2" mb="1" weight="bold">
            Rest Time Between Requests (ms - 1000 = 1 second)
          </Text>

          <div className="mb-2">
            <TextField.Root
              onChange={setNetworkField("timeBetweenRequests")}
              value={formState.network.timeBetweenRequests}
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
            value={formState.api.historicPriceUrl}
            onChange={setApiField("historicPriceUrl")}
            placeholder="https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range"
          />
        </label>
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Price URL
          </Text>
          <TextField.Root
            onChange={setApiField("priceUrl")}
            value={formState.api.priceUrl}
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
