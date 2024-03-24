import { Text, Separator } from "@radix-ui/themes";
import { Wallet } from "@models/Wallet";
import { padBtcZeros, formatPrice } from "@lib/utils";
import { useNavigate } from "react-router-dom";
import { cn } from "@lib/utils";
import * as d3 from "d3";
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

  const handleClick = () => {
    if (disableOnClick) return;
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
                / {formatSupply(circulatingSupply)}
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
                {formatSupply(btcPrice * circulatingSupply)}
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
