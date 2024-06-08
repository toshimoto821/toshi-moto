import { useState, useCallback } from "react";
import { DropdownMenu, IconButton } from "@radix-ui/themes";
import { GearIcon } from "@radix-ui/react-icons";
import { type IAppAddressFilters } from "@machines/appMachine";
import { AddWalletDialog } from "@root/components/wallet/WalletDialog/AddWalletDialog";
import { ExportWalletDialog } from "@root/components/wallet/WalletDialog/ExportWalletDialog";
import { Wallet } from "@models/Wallet";

type IAddressFilterDropdown = {
  onClickRefresh: () => void;
  onClickFilter: (filter: IAppAddressFilters) => void;
  onClickDelete: () => void;
  onClickLoadNextAddresses: ({
    change,
    incrementOrDecrement,
  }: {
    change: boolean;
    incrementOrDecrement?: number;
  }) => void;
  onClickTrim: ({ change }: { change: boolean }) => void;
  onClickToggleInputAddresses: ({
    selected,
    filter,
  }: {
    selected: boolean;
    filter: boolean;
  }) => void;
  filters: IAppAddressFilters;
  wallet: Wallet;
};
export const AddressFilterDropdown = (props: IAddressFilterDropdown) => {
  const {
    onClickRefresh,
    onClickFilter,
    onClickDelete,
    onClickLoadNextAddresses,
    onClickTrim,
    onClickToggleInputAddresses,
    filters,
    wallet,
  } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const handleOnClose = useCallback(() => {
    setExportDialogOpen(false);
  }, []);
  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost">
            <GearIcon width="16" height="16" />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={onClickRefresh}>
            Verify All
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => {
              setExportDialogOpen(true);
            }}
          >
            Export
          </DropdownMenu.Item>
          <DropdownMenu.Separator />

          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>View</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item
                onSelect={() => {
                  onClickToggleInputAddresses({
                    selected: true,
                    filter: false,
                  });
                }}
              >
                Input Addresses
              </DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Filter</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item
                shortcut={filters.utxoOnly ? "✓" : ""}
                onClick={() => {
                  onClickFilter({ ...filters, utxoOnly: !filters.utxoOnly });
                }}
              >
                UTXOs Only
              </DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Separator />
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Receive Addresses</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item
                onSelect={() => {
                  onClickLoadNextAddresses({ change: false });
                }}
              >
                Next 10 Addresses
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => {
                  onClickLoadNextAddresses({
                    change: false,
                    incrementOrDecrement: 1,
                  });
                }}
              >
                Next Address
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                onSelect={() => {
                  onClickTrim({ change: false });
                }}
              >
                Trim
              </DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Change Addresses</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item
                onSelect={() => {
                  onClickLoadNextAddresses({ change: true });
                }}
              >
                Load Next 10
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => {
                  onClickLoadNextAddresses({
                    change: true,
                    incrementOrDecrement: 1,
                  });
                }}
              >
                Next Address
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                onSelect={() => {
                  onClickTrim({ change: true });
                }}
              >
                Trim
              </DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>

          <DropdownMenu.Separator />

          <DropdownMenu.Item
            onSelect={() => {
              setDialogOpen(true);
            }}
          >
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item color="red" onSelect={onClickDelete}>
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <AddWalletDialog
        wallet={wallet}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
      <ExportWalletDialog
        wallet={wallet}
        open={exportDialogOpen}
        onClose={handleOnClose}
      />
    </>
  );
};
