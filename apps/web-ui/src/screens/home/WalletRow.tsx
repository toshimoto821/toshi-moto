import { Text, Separator } from "@radix-ui/themes";
import { Wallet } from "@models/Wallet";
import { padBtcZeros, formatPrice } from "@lib/utils";
import { useNavigate } from "react-router-dom";
import { cn } from "@lib/utils";
import * as d3 from "d3";
import { Popover } from "@root/components/popover/Popover";
import { useNumberObfuscation } from "@root/lib/hooks/useNumberObfuscation";

const formatSupply = d3.format("~s");

type IWalletRow = {
  wallet: Wallet;
  circulatingSupply?: number;
  btcPrice?: number;
  className?: string;
  disableOnClick?: boolean;
};
export const WalletRow = ({
  wallet,
  circulatingSupply,
  btcPrice,
  disableOnClick,
  className,
}: IWalletRow) => {
  const navigate = useNavigate();
  const privateNumber = useNumberObfuscation();

  const handleClick = (evt: React.MouseEvent<EventTarget>) => {
    const el = evt.target as HTMLElement;
    if (disableOnClick) return;
    if (el?.dataset?.component === "popover") {
      return;
    }
    navigate(`/${wallet.id}`);
  };
  return (
    <div
      className={cn(className, {
        "hover:cursor-pointer": !disableOnClick,
      })}
      onClick={handleClick}
    >
      <div className="grid grid-cols-5 gap-2">
        <div className="flex flex-col col-span-3">
          <div>
            <Text className="font-bold">{wallet.name}</Text>
          </div>
          <div>
            <Text
              className="font-mono text-gray-400"
              color="orange"
              style={{ color: wallet.color }}
            >
              {privateNumber(padBtcZeros(wallet.balance))}
            </Text>{" "}
            {!!circulatingSupply && (
              <Text size="1" className="opacity-50 text-gray-500">
                /{" "}
                <Popover
                  title="Circulating Supply"
                  text={formatSupply(circulatingSupply)}
                >
                  <div className="mb-2">
                    <Text>
                      {formatSupply(circulatingSupply)} is the current total
                      supply of Bitcoin. The maximum supply of bitcoin is capped
                      at 21,000,000.
                    </Text>
                  </div>
                  <div>
                    <Text>
                      Every block (roughly 10 minutes) a miner is rewarded with
                      3.125 btc. Every 4 years the reward for mining a block
                      gets cut in half. This is the monetary policy of bitcoin
                      and controls its inflation rate.
                    </Text>
                  </div>
                </Popover>
              </Text>
            )}
          </div>
        </div>
        <div className="col-span-2 font-mono text-right flex flex-col justify-between">
          <div>
            <Text>
              {wallet.currencySymbol}
              {privateNumber(formatPrice(wallet.value))}
            </Text>
          </div>
          <div className="flex justify-end">
            <Separator size="3" />
          </div>
          {!!btcPrice && !!circulatingSupply && (
            <div>
              <Text size="1" className="opacity-50 text-gray-500">
                {wallet.currencySymbol}
                <Popover
                  title="Market Capitalization"
                  text={formatSupply(btcPrice * circulatingSupply)}
                >
                  <div className="mb-2">
                    <Text>
                      {formatSupply(btcPrice * circulatingSupply)} is the total
                      market capitalization of Bitcoin.
                    </Text>
                  </div>
                  <div>
                    <Text>
                      It is calculted by multiplying the current market price x
                      the current total supply of bitcoin (
                      {btcPrice.toLocaleString()} x{" "}
                      {circulatingSupply.toLocaleString()} ={" "}
                      {(btcPrice * circulatingSupply).toLocaleString()})
                    </Text>
                  </div>
                </Popover>
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
