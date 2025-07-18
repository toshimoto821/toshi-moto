import { useState, useEffect } from "react";
import {
  Flex,
  TextField,
  Text,
  Button,
  Callout,
  Checkbox,
} from "@radix-ui/themes";
import { CheckIcon } from "@radix-ui/react-icons";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import {
  selectApiConfig,
  selectNetworkConfig,
  setConfig,
  type ConfigState,
  selectPushNotificationsConfig,
} from "@root/lib/slices/config.slice";
import { subscribeUserToPush, getSubscription } from "./settings.util";
import {
  useGetConfigQuery,
  useSavePushSubscriptionMutation,
  useLazyTestMempoolConnectionQuery,
  useUnsubscribePushSubscriptionMutation,
} from "@root/lib/slices/api.slice";
import type { PushSubscription } from "@root/lib/slices/api.slice.types";
import {
  selectDebugMode,
  setDebugMode,
  showToast,
} from "@root/lib/slices/ui.slice";

const VITE_PUSH_NOTIFICATIONS_DISABLED = import.meta.env
  .VITE_PUSH_NOTIFICATIONS_DISABLED;

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
  const pushNotificationConfig = useAppSelector(selectPushNotificationsConfig);

  const debugMode = useAppSelector(selectDebugMode);
  const [testMempoolConnection, { error, status: mempoolTestStatus }] =
    useLazyTestMempoolConnectionQuery();

  const [pushSubscription, setPushSubscription] =
    useState<PushSubscription | null>(null);
  const [savePushNotification] = useSavePushSubscriptionMutation();
  const [unsubscribeFromPush] = useUnsubscribePushSubscriptionMutation();
  const [message, setMessage] = useState<IMessage | null>(null);
  useGetConfigQuery();

  const dispatch = useAppDispatch();

  const [formState, setFormState] = useState({
    api: {
      nodeUrl: apiConfig.nodeUrl,
      url: apiConfig.url,
    },
    network: {
      conconcurrentRequests: networkConfig.conconcurrentRequests,
      timeBetweenRequests: networkConfig.timeBetweenRequests,
    },
    pushNotifications: {
      enabled: pushNotificationConfig?.enabled || false,
    },
  });

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    // @todo error handline
    dispatch(
      setConfig({
        network: formState.network,
        api: formState.api,
      })
    );
    setTimeout(() => {
      testMempoolConnection();
    }, 100);

    setMessage({ message: "Settings Saved", type: "success" });
    if (pushSubscription && formState.pushNotifications.enabled) {
      await savePushNotification(pushSubscription);
    } else if (!formState.pushNotifications.enabled) {
      const subscription = await getSubscription();

      if (subscription) {
        const asJson = subscription.toJSON() as PushSubscription;
        subscription.unsubscribe();
        setPushSubscription(null);
        await unsubscribeFromPush(asJson);
      }

      // @todo remove push subscription
    }
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

  const subscribeToPushNotifications = () => {
    if (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      pushNotificationConfig.publicKey
    ) {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then(async (registration) => {
          try {
            const subscription = await subscribeUserToPush(
              registration,
              pushNotificationConfig.publicKey
            );

            if (subscription) {
              const asJSON = subscription.toJSON() as PushSubscription;
              if (asJSON.endpoint) {
                setPushSubscription(asJSON);
              }
            }
          } catch (ex) {
            console.error(ex);
          }
        });
      }
    }
  };

  const pushDisabled = !!VITE_PUSH_NOTIFICATIONS_DISABLED;

  useEffect(() => {
    getSubscription()
      .then((subscription) => {
        if (subscription) {
          const asJson = subscription.toJSON() as PushSubscription;
          setPushSubscription(asJson);
          setFormState((existing) => ({
            ...existing,
            pushNotifications: {
              ...existing.pushNotifications,
              enabled: true,
            },
          }));
        }
      })
      .catch((ex) => {
        console.log(ex);
        dispatch(
          showToast({
            line1: "Error: push sub.",
            line2: ex.toString(),
          })
        );
      });
  }, [dispatch]);

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
            Mempool Host (for transactions / address data)
          </Text>
          <TextField.Root
            value={formState.api.nodeUrl}
            onChange={setApiField("nodeUrl")}
            placeholder="http://umbrel.local:3006"
            color={error ? "ruby" : undefined}
            variant={error ? "soft" : undefined}
          />
          {mempoolTestStatus === "pending" && (
            <Text as="div" size="1" mt="1">
              Testing connection to mempool host...
            </Text>
          )}
          {error && mempoolTestStatus === "rejected" && (
            <Text as="div" size="1" color="red" mt="1">
              Failed to connect to mempool host
            </Text>
          )}
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
            Push Notifications
          </Text>
          <Text as="label">
            <Flex as="span" gap="2" className="items-center">
              <Checkbox
                disabled={pushDisabled}
                checked={formState.pushNotifications.enabled}
                onCheckedChange={() => {
                  const enabled = !formState.pushNotifications.enabled;
                  setFormState((existing) => ({
                    ...existing,
                    pushNotifications: {
                      ...existing.pushNotifications,
                      enabled,
                    },
                  }));
                  if (enabled) {
                    subscribeToPushNotifications();
                  }
                }}
              />{" "}
              Subscribe To Push Notifications
            </Flex>
          </Text>
        </label>
      </Flex>

      <Flex direction="column" gap="3" className="my-4">
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Debug Mode
          </Text>
          <Text as="label">
            <Flex as="span" gap="2" className="items-center">
              <Checkbox
                disabled={pushDisabled}
                checked={debugMode}
                onCheckedChange={() => {
                  dispatch(setDebugMode(!debugMode));
                }}
              />{" "}
              Developer mode for testing
            </Flex>
          </Text>
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
