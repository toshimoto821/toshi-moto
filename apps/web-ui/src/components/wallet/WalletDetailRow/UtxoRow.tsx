import { Fragment } from "react";
import { Table, IconButton } from "@radix-ui/themes";
import {
  ExternalLinkIcon,
  UpdateIcon,
  TriangleDownIcon,
  TriangleRightIcon,
  PinTopIcon,
  PinBottomIcon,
} from "@radix-ui/react-icons";
import { AppContext } from "@providers/AppProvider";
import { Wallet } from "@models/Wallet";
import { Utxo } from "@models/Utxo";
import { Transaction } from "@models/Transaction";
import { cn, formatPrice, padBtcZeros, trimAddress } from "@lib/utils";
import { UtxoSankey } from "@components/graphs/UtxoSankey";
import { TxTableHeader } from "./UtxoRow/TxTableHeader";
const VITE_BITCOIN_NODE_URL = import.meta.env.VITE_BITCOIN_NODE_URL;

type IUtxoRow = {
  utxo: Utxo;
  isLoading: boolean;
  onRefresh: () => void;
  onExpandToggle: () => void;
  className?: string;
  walletBalance: number;
  expandTxs: boolean;
  width: number;
  wallets: Wallet[];
};

export const UtxoRow = ({
  utxo,
  isLoading,
  onRefresh,
  onExpandToggle,
  className,
  walletBalance,
  expandTxs,
  width,
  wallets,
}: IUtxoRow) => {
  const { send } = AppContext.useActorRef();

  const selectedTxs =
    AppContext.useSelector((current) => {
      return new Set(current.context.selectedTxs);
    }) || new Set();

  const toggleSelectedTx = (tx: Transaction) => {
    return () => {
      const txid = tx.txid;
      send({ type: "APP_MACHINE_TOGGLE_SELECTED_TX", data: { txid } });
    };
  };

  return (
    <Fragment>
      <Table.Row
        id={utxo.address}
        className={cn("text-gray-500 text-xs", className, {
          "text-gray-400": utxo.utxoSum === 0,
        })}
      >
        <Table.Cell className={cn("w-8 align-middle")}>
          <div className="flex items-center ">
            <IconButton
              variant="ghost"
              color="gray"
              disabled={isLoading}
              onClick={onRefresh}
              className={cn("p2", {
                "animate-spin": isLoading,
                "bg-white": isLoading,
                "hover:bg-white": isLoading,
              })}
            >
              <UpdateIcon width="14" height="14" />
            </IconButton>
          </div>
        </Table.Cell>
        <Table.Cell className="w-8">
          {utxo.transactionCount > 0 && (
            <div className="flex items-center ">
              <IconButton
                variant="ghost"
                color="indigo"
                onClick={onExpandToggle}
                className="p2"
              >
                {!expandTxs && <TriangleRightIcon width="14" height="14" />}
                {expandTxs && <TriangleDownIcon width="14" height="14" />}
              </IconButton>
            </div>
          )}
        </Table.Cell>
        <Table.Cell>{utxo.index! + 1}</Table.Cell>
        <Table.Cell>
          <a
            className={cn(
              "text-blue-500 hover:underline hover:cursor-pointer flex items-center font-mono text-xs",
              {
                "text-gray-400": utxo.utxoSum === 0,
              }
            )}
            title={utxo.address}
            href={utxo.blockExplorerLink()}
            target="_blank"
            rel="noreferrer"
          >
            {trimAddress(utxo.address)}{" "}
            <ExternalLinkIcon width="16" height="16" className="ml-2" />
          </a>
        </Table.Cell>

        <Table.Cell className="text-right">
          {padBtcZeros(utxo.utxoSum)}
        </Table.Cell>
        <Table.Cell className="text-right">
          {formatPrice(utxo.value)}
        </Table.Cell>
        <Table.Cell className="text-right">{utxo.transactionCount}</Table.Cell>
        <Table.Cell className="text-right">
          {utxo.allocation(walletBalance)}
        </Table.Cell>
        <Table.Cell className="text-right">
          <span className="hidden md:inline">{utxo.updatedAt}</span>
          <span className="inline md:hidden">{utxo.updatedAtShort}</span>
        </Table.Cell>
      </Table.Row>
      {expandTxs && (
        <Fragment>
          <Table.Row className="">
            <Table.Cell colSpan={9} style={{ boxShadow: "none" }}>
              <Table.Root>
                <TxTableHeader />
                <Table.Body>
                  {utxo.listTransactions.map((transaction, index) => {
                    const vin = transaction.findVin(utxo.address);
                    const vout = transaction.findVout(utxo.address);
                    return (
                      <Fragment key={index}>
                        <Table.Row align="center" className="bg-gray-50">
                          <Table.Cell className="w-20">
                            <IconButton
                              variant="surface"
                              color={
                                selectedTxs.has(transaction.txid)
                                  ? "orange"
                                  : "sky"
                              }
                              radius="full"
                              size="1"
                              onClick={toggleSelectedTx(transaction)}
                              className="flex items-center justify-center"
                            >
                              <div className="flex font-bold  text-xs text-center ">
                                {index + 1}
                              </div>
                            </IconButton>
                          </Table.Cell>
                          <Table.Cell className="min-w-[120px]">
                            {transaction.shortDate}
                          </Table.Cell>
                          <Table.Cell>
                            <a
                              className={cn(
                                "text-blue-500 hover:underline hover:cursor-pointer flex items-center font-mono text-xs"
                              )}
                              title={transaction.txid}
                              href={transaction.blockExplorerLink()}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {trimAddress(transaction.txid)}{" "}
                              <ExternalLinkIcon
                                width="16"
                                height="16"
                                className="ml-2"
                              />
                            </a>
                          </Table.Cell>
                          <Table.Cell align="right">
                            {vout && <PinBottomIcon />}
                          </Table.Cell>
                          <Table.Cell
                            align="center"
                            className={cn({
                              "text-gray-400":
                                vout?.scriptpubkey_address !== utxo.address,
                            })}
                          >
                            {trimAddress(vout?.scriptpubkey_address)}
                          </Table.Cell>
                          <Table.Cell
                            align="center"
                            className={cn({
                              "text-gray-400":
                                vin?.prevout.scriptpubkey_address !==
                                utxo.address,
                            })}
                          >
                            {trimAddress(vin?.prevout.scriptpubkey_address)}
                          </Table.Cell>
                          <Table.Cell>{vin && <PinTopIcon />}</Table.Cell>
                          <Table.Cell className="min-w-[160px]">
                            {padBtcZeros(
                              (vin?.prevout.value || vout?.value || 0) /
                                100000000
                            )}{" "}
                            BTC
                          </Table.Cell>
                        </Table.Row>
                      </Fragment>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </Table.Cell>
          </Table.Row>
          <Table.Row className="border-y-0 ">
            <Table.Cell colSpan={9} style={{ boxShadow: "none" }}>
              <UtxoSankey
                wallets={wallets}
                utxo={utxo}
                width={width}
                height={500}
                selectedTxs={selectedTxs}
                toggleTx={() => {}}
                index={0}
              />
            </Table.Cell>
          </Table.Row>
          {expandTxs &&
            utxo.listTransactions.some((tx) => selectedTxs.has(tx.txid)) && (
              <Table.Row>
                <Table.Cell colSpan={9}>
                  <Table.Root>
                    <TxTableHeader />
                    <Table.Body>
                      {utxo.listTransactions.map((transaction, index) => (
                        <Fragment key={index}>
                          {selectedTxs.has(transaction.txid) &&
                            transaction.vout.map((vout, i) => (
                              <Table.Row align="center" key={i}>
                                <Table.Cell className="w-20">
                                  {index + 1}
                                </Table.Cell>
                                <Table.Cell>{transaction.shortDate}</Table.Cell>
                                <Table.Cell>
                                  <a
                                    className={cn(
                                      "text-blue-500 hover:underline hover:cursor-pointer flex items-center font-mono text-xs"
                                    )}
                                    title={transaction.txid}
                                    href={transaction.blockExplorerLink()}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {trimAddress(transaction.txid)}{" "}
                                    <ExternalLinkIcon
                                      width="16"
                                      height="16"
                                      className="ml-2"
                                    />
                                  </a>
                                </Table.Cell>

                                <Table.Cell align="right">
                                  {vout?.scriptpubkey_address ===
                                    utxo.address && <PinBottomIcon />}
                                </Table.Cell>
                                <Table.Cell align="left">
                                  <a
                                    href={`${VITE_BITCOIN_NODE_URL}/address/${utxo.address}`}
                                    target="_blank"
                                    className={cn(
                                      "text-blue-500 hover:underline hover:cursor-pointer flex items-center font-mono text-xs",
                                      {
                                        "opacity-40":
                                          vout?.scriptpubkey_address !==
                                          utxo.address,
                                      }
                                    )}
                                  >
                                    {trimAddress(vout?.scriptpubkey_address)}
                                    <ExternalLinkIcon
                                      width="16"
                                      height="16"
                                      className="ml-2"
                                    />
                                  </a>
                                </Table.Cell>
                                <Table.Cell></Table.Cell>
                                <Table.Cell></Table.Cell>
                                <Table.Cell>
                                  {padBtcZeros((vout?.value || 0) / 100000000)}{" "}
                                  BTC
                                </Table.Cell>
                              </Table.Row>
                            ))}
                          {selectedTxs.has(transaction.txid) &&
                            transaction.vin.map((vin, i) => (
                              <Table.Row align="center" key={i}>
                                <Table.Cell>{index + 1}</Table.Cell>
                                <Table.Cell>{transaction.shortDate}</Table.Cell>
                                <Table.Cell>
                                  <a
                                    className={cn(
                                      "text-blue-500 hover:underline hover:cursor-pointer flex items-center font-mono text-xs"
                                    )}
                                    title={transaction.txid}
                                    href={transaction.blockExplorerLink()}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {trimAddress(transaction.txid)}{" "}
                                    <ExternalLinkIcon
                                      width="16"
                                      height="16"
                                      className="ml-2"
                                    />
                                  </a>
                                </Table.Cell>

                                <Table.Cell></Table.Cell>
                                <Table.Cell></Table.Cell>
                                <Table.Cell
                                  align="center"
                                  className={cn({
                                    "text-gray-400":
                                      vin?.prevout.scriptpubkey_address !==
                                      utxo.address,
                                  })}
                                >
                                  {trimAddress(
                                    vin?.prevout.scriptpubkey_address
                                  )}
                                </Table.Cell>
                                <Table.Cell align="center">
                                  {vin?.prevout.scriptpubkey_address ===
                                    utxo.address && <PinTopIcon />}
                                </Table.Cell>
                                <Table.Cell>
                                  {padBtcZeros(
                                    (vin?.prevout.value || 0) / 100000000
                                  )}{" "}
                                  BTC
                                </Table.Cell>
                              </Table.Row>
                            ))}
                        </Fragment>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Table.Cell>
              </Table.Row>
            )}

          <Table.Row>
            <Table.Cell colSpan={9}></Table.Cell>
          </Table.Row>
        </Fragment>
      )}
    </Fragment>
  );
};
