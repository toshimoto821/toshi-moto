import { Table } from "@radix-ui/themes";
export const TxTableHeader = () => {
  return (
    <Table.Header>
      <Table.Row>
        <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Transaction ID</Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell align="center">
          Output Address
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell align="center">
          Input Address
        </Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
        <Table.ColumnHeaderCell>Amount</Table.ColumnHeaderCell>
      </Table.Row>
    </Table.Header>
  );
};
