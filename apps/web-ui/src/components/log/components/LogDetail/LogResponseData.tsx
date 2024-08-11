import { Table, Text } from "@radix-ui/themes";
import { getQueryParams } from "@root/lib/utils";
import { toTabularData } from "./table-data-helper";
import { cn } from "@lib/utils";
import { type APIRequestResponse } from "@lib/slices/network.slice.types";

type ILogResponseData = {
  request: APIRequestResponse;
};

export const LogResponseData = (props: ILogResponseData) => {
  const { request } = props;
  const params = getQueryParams(request.url.search);
  const requestData = Object.keys(params)
    .map((param) => {
      return [param, params[param]];
    })
    .filter((pair) => pair[0]);

  const responseTableData = toTabularData(request);

  return (
    <div className="mb-2">
      {!!requestData.length && (
        <div>
          <Text size="3" weight="bold">
            Request
          </Text>
        </div>
      )}
      {!!requestData.length && (
        <div className="mb-4">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell className="w-48">
                  Key
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {requestData.map((row, index) => (
                <Table.Row key={index}>
                  <Table.RowHeaderCell>{row[0]}</Table.RowHeaderCell>
                  <Table.Cell>{row[1]}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </div>
      )}
      <div>
        <Text size="3" weight="bold">
          Response
        </Text>
      </div>
      <div>
        {!!responseTableData.headers.length && (
          <Table.Root>
            <Table.Header>
              <Table.Row>
                {responseTableData.headers.map((header, index) => (
                  <Table.ColumnHeaderCell
                    key={index}
                    className={cn({
                      "w-48": index === 0,
                    })}
                  >
                    {header}
                  </Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {responseTableData.rows.map((row, rowIndex) => {
                return (
                  <Table.Row key={rowIndex}>
                    {row.map((cell, cIndex) => {
                      return (
                        <Table.RowHeaderCell key={rowIndex + cIndex}>
                          {cell}
                        </Table.RowHeaderCell>
                      );
                    })}
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        )}
      </div>
    </div>
  );
};
