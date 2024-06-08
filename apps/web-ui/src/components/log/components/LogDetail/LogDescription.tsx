import { Separator, Text, Callout } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { type IRequest } from "@machines/network.types";

type ILogDescription = {
  request: IRequest;
};
export const LogDescription = (props: ILogDescription) => {
  const type = props.request.meta?.type;

  if (type === "btc-historic-price") {
    return (
      <div className="p-4">
        <Text size="3" weight="bold">
          BTC Historic Price Request
        </Text>
        <Separator className="mb-4" />
        <div className="mb-4">
          <Text>
            This request fetches historic pricing data. The backend API fetches
            pricing data from CoinGecko every 5 minutes and stores it in a
            database. The frontend fetches this data and displays it in a chart.
          </Text>
        </div>
        <div>
          <Callout.Root variant="outline">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              Note: When self-hosting Toshi Moto, not all pricing data is
              available after install. Initial install will only have daily
              data. After install the backend will fetch 5 minute data and you
              will have 5 minute data going forward.
            </Callout.Text>
          </Callout.Root>
        </div>
      </div>
    );
  }

  if (type === "btc-price") {
    return (
      <div className="p-4">
        <Text size="3" weight="bold">
          BTC Current Price Request
        </Text>
        <Separator className="mb-4" />
        <div className="mb-4">
          <Text>
            This request is fetching the current price of Bitcoin. The backend
            API fetches pricing data from CoinGecko every 5 minutes and stores
            it in a database.
          </Text>
        </div>
        <div>
          <Callout.Root variant="outline">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              Note: To prevent abuse, the backend API is rate limited to 1
              request per 5 minutes. Additionally the source data from CoinGecko
              is only updated every 5-10 minutes so making requests more
              frequently than that will not return new data.
            </Callout.Text>
          </Callout.Root>
        </div>
      </div>
    );
  }

  if (type === "txs") {
    return (
      <div className="p-4">
        <Text size="3" weight="bold">
          List Transactions for Address Request
        </Text>
        <Separator className="mb-4" />
        <div className="mb-4">
          <Text>
            Returns a list of transactions for a given address. Although it is
            best practice to not re-use an address, a bitcoin address can have
            multiple transactions. This requests returns a list of transactions
            for a give request.
          </Text>
        </div>
        <div>
          <Callout.Root variant="outline">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              Note: This data is sourced from mempool.space and is not stored in
              the database. When self-hosted it requires a local installation of
              mempool.space.
            </Callout.Text>
          </Callout.Root>
        </div>
      </div>
    );
  }

  if (type === "utxo") {
    return (
      <div className="p-4">
        <Text size="3" weight="bold">
          UTXO Details Price Request
        </Text>
        <Separator className="mb-4" />
        <div className="mb-4">
          <Text>
            Returns the on-chain stats and mempool stats for a given address.
            Details include high information about how many transactions are in
            the mempool, the total number of spent transactions, the total value
            of the UTXOs, and the total number of UTXOs.
          </Text>
        </div>
      </div>
    );
  }
  return null;
};
