import { useRef, useEffect, useState } from "react";
import { Separator, Text, IconButton, Button, TextField } from "@radix-ui/themes";
import { ArrowLeftIcon, PlusIcon } from "@radix-ui/react-icons";
import { useWallets } from "@lib/hooks/useWallets";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { WalletRow } from "./WalletRow";
import { AddressFilterDropdown } from "./AddressFilterDropdown";
import { AddressRow } from "./AddressRow";
import { useElementDimensions } from "@lib/hooks/useElementDimensions";
import { useBtcPrice } from "@root/lib/hooks/useBtcPrice";
import { Popover } from "@root/components/popover/Popover";
import type { IAppAddressFilters, IExpandAddressKey } from "@root/types";
import { useAppSelector, useAppDispatch } from "@root/lib/hooks/store.hooks";
import { selectUI } from "@root/lib/slices/ui.slice";
import {
  addManualAddress,
  removeManualAddress,
} from "@root/lib/slices/wallets.slice";
import { isValidBitcoinAddress } from "@root/lib/utils";

export const WalletDetail = () => {
  const useWalletRet = useWallets();
  const { wallets, actions } = useWalletRet;
  const { walletId, address } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useElementDimensions(containerRef);
  const { circulatingSupply, btcPrice } = useBtcPrice();
  const { filterUtxoOnly = [], walletExpandedAddresses = [] } =
    useAppSelector(selectUI);
  const dispatch = useAppDispatch();

  // Manual address input state
  const [newAddress, setNewAddress] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const navigate = useNavigate();
  const wallet = wallets.find((wallet) => wallet.id === walletId);

  const handleBack = () => {
    navigate(`/`);
  };

  const isUtxoExpanded = (address: string) => {
    const key = `wallet-id:${walletId};utxo:${address}` as IExpandAddressKey;
    return walletExpandedAddresses.includes(key);
  };

  const handleToggleAddress = (address: string) => {
    return () => {
      if (walletId) {
        actions.toggleAddress(walletId, address);
      }
    };
  };

  const handleAddManualAddress = () => {
    if (!walletId || !newAddress.trim()) return;

    setIsAddingAddress(true);
    setAddressError(null);

    const trimmedAddress = newAddress.trim();

    // Check if address already exists in wallet
    if (wallet?.hasAddress(trimmedAddress)) {
      setAddressError("This address is already in the wallet");
      setIsAddingAddress(false);
      return;
    }

    // Basic sanity check - API will do authoritative validation
    if (!isValidBitcoinAddress(trimmedAddress)) {
      setAddressError("Invalid address format");
      setIsAddingAddress(false);
      return;
    }

    dispatch(addManualAddress({ walletId, address: trimmedAddress }));
    setNewAddress("");
    setIsAddingAddress(false);
  };

  const handleRemoveManualAddress = (addressId: string) => {
    if (!walletId) return;
    dispatch(removeManualAddress({ walletId, addressId }));
  };

  const changeAddresses =
    wallet?.getAddresses({
      onlyUtxos: filterUtxoOnly.includes(walletId!),
      change: true,
      receive: false,
      addresses: address ? [address] : undefined,
      sort: "asc",
    }) || [];

  const receiveAddresses =
    wallet?.getAddresses({
      onlyUtxos: filterUtxoOnly.includes(walletId!),
      change: false,
      receive: true,
      addresses: address ? [address] : undefined,
    }) || [];

  useEffect(() => {
    const to = setTimeout(() => {
      if (wallet && !wallet.archived) {
        actions.refreshWallet(wallet?.id);
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
    <div className="px-2 border rounded bg-white dark:bg-[#1a1a1a] dark:border-[#404040] drop-shadow-lg">
      <div className="sticky top-[140px] bg-white dark:bg-[#1a1a1a] z-50">
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
        <div className="grid grid-cols-9 gap-1 bg-orange-50 dark:bg-orange-950 py-4 px-2 border border-t-0 border-x-0 border-orange-300 dark:border-orange-700">
          <div className="flex items-center">
            <AddressFilterDropdown
              wallet={wallet}
              filters={{
                utxoOnly: filterUtxoOnly.includes(walletId!),
              }}
              onClickRefresh={() => {
                actions.refreshWallet(wallet.id, 0);
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
              onClickArchive={(archive: boolean) => {
                actions.archiveWallet({ walletId: wallet.id, archive });
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
        {/* Manual Wallet UI */}
        {wallet.isManualWallet && (
          <>
            <div className="p-3 bg-gray-50 dark:bg-[#2a2a2a] border-b dark:border-[#404040]">
              <Text weight="bold" size="1">
                Add Bitcoin Address
              </Text>
              <div className="flex gap-2 mt-2">
                <TextField.Root
                  className="flex-1"
                  placeholder="Enter a Bitcoin address (bc1..., 1..., 3...)"
                  value={newAddress}
                  onChange={(e) => {
                    setNewAddress(e.target.value);
                    setAddressError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddManualAddress();
                    }
                  }}
                />
                <Button
                  onClick={handleAddManualAddress}
                  disabled={isAddingAddress || !newAddress.trim()}
                >
                  <PlusIcon />
                  Add
                </Button>
              </div>
              {addressError && (
                <Text size="1" color="red" className="mt-1">
                  {addressError}
                </Text>
              )}
            </div>
            <div className="p-2 bg-gray-50 dark:bg-[#2a2a2a] border-b dark:border-[#404040]">
              <Text weight="bold" size="1">
                Addresses ({receiveAddresses.length})
              </Text>
            </div>
            {receiveAddresses.map((address, index) => {
              return (
                <AddressRow
                  key={index + address.address}
                  address={address}
                  isUtxoExpanded={isUtxoExpanded(address.address)}
                  onClickExpandUtxo={handleToggleAddress(address.address)}
                  separator={index < receiveAddresses.length - 1}
                  wallets={useWalletRet}
                  dimensions={dimensions}
                  onClickRefresh={({ address }) => {
                    actions.refreshAddresses({
                      walletId: wallet.id,
                      addresses: [address],
                    });
                  }}
                  currency={wallet.settings.cur}
                  onClickDelete={() =>
                    handleRemoveManualAddress(address.address)
                  }
                />
              );
            })}
            {receiveAddresses.length === 0 && (
              <div className="h-48 flex flex-col items-center justify-center">
                <Text color="gray">
                  No addresses added yet. Add a Bitcoin address above.
                </Text>
              </div>
            )}
          </>
        )}

        {/* Standard (xpub) Wallet UI */}
        {!wallet.isManualWallet && (
          <>
            <div className="p-2 bg-gray-50 dark:bg-[#2a2a2a] border-b dark:border-[#404040]">
              <Popover
                text={(classNames) => (
                  <Text weight="bold" size="1" className={classNames}>
                    Receive Addresses
                  </Text>
                )}
                title="Receive Addresses"
              >
                Wallets have two types of addresses - receive and change.
                Receive addresses are used to receive funds. You can have
                multiple receive addresses in a wallet. Each address is unique
                and should only be used once to protect your privacy. When you
                spend from an address, the remaining funds are sent to a change
                address.
              </Popover>
            </div>
            {receiveAddresses.map((address, index) => {
              return (
                <AddressRow
                  key={index + address.address}
                  address={address}
                  isUtxoExpanded={isUtxoExpanded(address.address)}
                  onClickExpandUtxo={handleToggleAddress(address.address)}
                  separator={index < receiveAddresses.length - 1}
                  wallets={useWalletRet}
                  dimensions={dimensions}
                  onClickRefresh={({ address }) => {
                    actions.refreshAddresses({
                      walletId: wallet.id,
                      addresses: [address],
                    });
                  }}
                  currency={wallet.settings.cur}
                />
              );
            })}

            {receiveAddresses.length === 0 && (
              <div className="h-48 flex flex-col items-center justify-center">
                {walletId && filterUtxoOnly.includes(walletId) && (
                  <Text>No receive UTXO's in wallet found</Text>
                )}
                {walletId &&
                  !filterUtxoOnly.includes(walletId) &&
                  !wallet.error && <Text>Loading receive addresses...</Text>}
                {wallet.error && (
                  <Text
                    color="red"
                    className="flex items-center flex-col gap-2"
                  >
                    {wallet.error}
                    <Button
                      onClick={() => {
                        actions.refreshWallet(wallet.id, 0, true);
                      }}
                      variant="soft"
                      size="1"
                      color="red"
                    >
                      Try again
                    </Button>
                  </Text>
                )}
              </div>
            )}
            <div className="p-2 bg-gray-50 dark:bg-[#2a2a2a] border-b border-t dark:border-[#404040]">
              <Popover
                text={(classNames) => (
                  <Text weight="bold" size="1" className={classNames}>
                    Change Addresses
                  </Text>
                )}
                title=" Change Addresses"
              >
                Wallets have two types of addresses - receive and change.
                Receive addresses are used to receive funds. You can have
                multiple receive addresses in a wallet. Each address is unique
                and should only be used once to protect your privacy. When you
                spend from an address, the remaining funds are sent to a change
                address.
              </Popover>
            </div>
            {changeAddresses.map((address, index) => {
              return (
                <AddressRow
                  key={index + address.address}
                  address={address}
                  isUtxoExpanded={isUtxoExpanded(address.address)}
                  onClickExpandUtxo={handleToggleAddress(address.address)}
                  separator={index < changeAddresses.length - 1}
                  wallets={useWalletRet}
                  dimensions={dimensions}
                  onClickRefresh={({ address }) => {
                    actions.refreshAddresses({
                      walletId: wallet.id,
                      addresses: [address],
                    });
                  }}
                  currency={wallet.settings.cur}
                />
              );
            })}
            {changeAddresses.length === 0 && (
              <div className="h-48 flex flex-col items-center justify-center">
                {walletId && filterUtxoOnly.includes(walletId) && (
                  <Text>No change UTXO's in wallet found</Text>
                )}
                {walletId &&
                  !filterUtxoOnly.includes(walletId) &&
                  !wallet.error && <Text>Loading change addresses...</Text>}
                {wallet.error && (
                  <Text
                    color="red"
                    className="flex items-center flex-col gap-2"
                  >
                    {wallet.error}
                    <Button
                      onClick={() => {
                        actions.refreshWallet(wallet.id, 0, true);
                      }}
                      variant="soft"
                      size="1"
                      color="red"
                    >
                      Try again
                    </Button>
                  </Text>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WalletDetail;
