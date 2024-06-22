import { useRef, useEffect } from "react";
import { Separator, Text, IconButton } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useWallets } from "@lib/hooks/useWallets";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { WalletRow } from "./WalletRow";
import { AddressFilterDropdown } from "./AddressFilterDropdown";
import { AddressRow } from "./AddressRow";
import { useElementDimensions } from "@lib/hooks/useElementDimensions";
import { useBtcPrice } from "@root/lib/hooks/useBtcPrice";
import { Popover } from "@root/components/popover/Popover";
import { type IAppAddressFilters } from "@machines/appMachine";
import { type IExpandAddressKey } from "@machines/walletListUIMachine";
export const WalletDetail = () => {
  const useWalletRet = useWallets();
  const { wallets, ui, actions } = useWalletRet;
  const { walletId, address } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useElementDimensions(containerRef);
  const { circulatingSupply, btcPrice } = useBtcPrice();

  const navigate = useNavigate();
  const wallet = wallets.find((wallet) => wallet.id === walletId);

  const handleBack = () => {
    navigate(`/`);
  };

  const isUtxoExpanded = (address: string) => {
    const key = `wallet-id:${walletId};utxo:${address}` as IExpandAddressKey;
    return ui.expandedTxs.has(key);
  };

  const handleToggleAddress = (address: string) => {
    return () => {
      if (walletId) {
        actions.toggleAddress(walletId, address);
      }
    };
  };

  const changeAddresses =
    wallet?.getAddresses({
      onlyUtxos: wallet.settings.addressFilters.utxoOnly,
      change: true,
      receive: false,
      addresses: address ? [address] : undefined,
      sort: "asc",
    }) || [];

  const receiveAddresses =
    wallet?.getAddresses({
      onlyUtxos: wallet.settings.addressFilters.utxoOnly,
      change: false,
      receive: true,
      addresses: address ? [address] : undefined,
    }) || [];

  const addresses = [...receiveAddresses, ...changeAddresses];

  useEffect(() => {
    const to = setTimeout(() => {
      if (wallet) {
        // @todo this needs to cancel outstanding requests for
        // the same addresses in queue
        actions.refreshWallet({
          walletId: wallet?.id,
          ttl: 1000 * 60 * 60 * 24, // 1 day ttl
          addresses: addresses.map((address) => address.address),
        });
      }
    }, 200);
    return () => {
      clearTimeout(to);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet?.id]);

  if (!wallet) {
    return <div>Wallet not found</div>;
  }

  return (
    <div className="mx-4 md:mx-0 px-2 border rounded bg-white drop-shadow-lg">
      <div className="sticky top-[140px] bg-white z-50">
        <div className="flex items-center">
          <div className="mr-4 h-full ml-2">
            <IconButton variant="ghost" onClick={handleBack}>
              <ArrowLeftIcon width="18" height="18" />
            </IconButton>
          </div>
          <div className="flex-1">
            <WalletRow
              wallet={wallet}
              disableOnClick
              className="p-2 py-4"
              circulatingSupply={circulatingSupply}
              btcPrice={btcPrice}
            />
          </div>
        </div>
        <Separator color="orange" size="4" />
        <div className="grid grid-cols-9 gap-1 bg-orange-50 py-4 px-2 border border-t-0 border-x-0 border-orange-300">
          <div className="flex items-center">
            <AddressFilterDropdown
              wallet={wallet}
              filters={wallet.settings.addressFilters}
              onClickRefresh={() => {
                actions.refreshWallet({
                  walletId: wallet.id,
                  addresses: addresses.map((address) => address.address),
                });
              }}
              onClickFilter={(filter: IAppAddressFilters) => {
                actions.changeAddressFilter(wallet.id, filter);
              }}
              onClickDelete={() => {
                actions.deleteWallet(wallet.id);
                navigate("/");
              }}
              onClickLoadNextAddresses={({ change, incrementOrDecrement }) => {
                actions.loadNextAddresses({
                  walletId: wallet.id,
                  change,
                  incrementOrDecrement,
                });
              }}
              onClickTrim={({ change }) => {
                actions.trimWalletAddresses({ walletId: wallet.id, change });
              }}
              onClickToggleInputAddresses={({ selected }) => {
                actions.selectWalletInputAddresses(wallet.id, selected);
              }}
            />
          </div>
          <div></div>
          <div className="col-span-3 md:col-span-5  text-right">
            <Popover
              text={(classNames) => (
                <Text weight="bold" className={classNames}>
                  ADDRESS
                </Text>
              )}
              title="Address"
            >
              The address, often refered to as UTXO (Unspent Transaction
              Output), is where you can receive funds. You can have multiple
              addresses in a wallet. Each address is unique and should only be
              used once to protect your privacy.
            </Popover>
          </div>

          <div className="col-span-2 md:col-span-1 text-right">
            <Text weight="bold">BTC</Text>
          </div>
          <div className="text-right col-span-2 md:col-span-1">
            <Text weight="bold">Value</Text>
          </div>
        </div>
      </div>

      <div ref={containerRef}>
        <div className="p-2 bg-gray-50 border-b">
          <Popover
            text={(classNames) => (
              <Text weight="bold" size="1" className={classNames}>
                Receive Addresses
              </Text>
            )}
            title="Receive Addresses"
          >
            Wallets have two types of addresses - receive and change. Receive
            addresses are used to receive funds. You can have multiple receive
            addresses in a wallet. Each address is unique and should only be
            used once to protect your privacy. When you spend from an address,
            the remaining funds are sent to a change address.
          </Popover>
        </div>
        {receiveAddresses.map((address, index) => {
          return (
            <AddressRow
              key={index + address.address}
              isLoading={ui.isLoadingAddress(address.address, wallet)}
              address={address}
              isUtxoExpanded={isUtxoExpanded(address.address)}
              onClickExpandUtxo={handleToggleAddress(address.address)}
              separator={index < receiveAddresses.length - 1}
              wallets={useWalletRet}
              dimensions={dimensions}
              onClickRefresh={({ address }) => {
                actions.refreshWallet({
                  walletId: wallet.id,
                  addresses: [address.address],
                });
              }}
              currency={wallet.settings.cur}
            />
          );
        })}
        {receiveAddresses.length === 0 && (
          <div className="h-48 flex items-center justify-center">
            <Text>Loading receive addresses...</Text>
          </div>
        )}
        <div className="p-2 bg-gray-50 border-b border-t">
          <Popover
            text={(classNames) => (
              <Text weight="bold" size="1" className={classNames}>
                Change Addresses
              </Text>
            )}
            title=" Change Addresses"
          >
            Wallets have two types of addresses - receive and change. Receive
            addresses are used to receive funds. You can have multiple receive
            addresses in a wallet. Each address is unique and should only be
            used once to protect your privacy. When you spend from an address,
            the remaining funds are sent to a change address.
          </Popover>
        </div>
        {changeAddresses.map((address, index) => {
          return (
            <AddressRow
              key={index + address.address}
              isLoading={ui.isLoadingAddress(address.address, wallet)}
              address={address}
              isUtxoExpanded={isUtxoExpanded(address.address)}
              onClickExpandUtxo={handleToggleAddress(address.address)}
              separator={index < changeAddresses.length - 1}
              wallets={useWalletRet}
              dimensions={dimensions}
              onClickRefresh={({ address }) => {
                actions.refreshWallet({
                  walletId: wallet.id,
                  addresses: [address.address],
                });
              }}
              currency={wallet.settings.cur}
            />
          );
        })}
        {changeAddresses.length === 0 && (
          <div className="h-48 flex items-center justify-center">
            <Text>Loading change addresses...</Text>
          </div>
        )}
      </div>
    </div>
  );
};
