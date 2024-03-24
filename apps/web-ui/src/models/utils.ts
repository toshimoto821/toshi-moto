import { type IUtxoRequest } from "@machines/appMachine";

export function isCacheExpired(utxo: IUtxoRequest) {
  if (utxo?.response?.details?.endTime && utxo?.ttl) {
    const endTime = utxo?.response?.details?.endTime;
    const ttl = utxo.ttl;
    return endTime + ttl < new Date().getTime();
  }
  return true;
}
