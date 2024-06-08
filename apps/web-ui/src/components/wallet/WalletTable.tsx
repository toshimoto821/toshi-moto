import { Table } from "@radix-ui/themes";

type IWalletTable = {
  children: React.ReactNode;
};

export const WalletTable = ({ children }: IWalletTable) => {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell
            colSpan={1}
            className="w-8"
          ></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="w-8">Graph</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell colSpan={1}>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Balance</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Tx Count</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Allocation</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Updated At</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>{children}</Table.Body>
    </Table.Root>
  );
};
