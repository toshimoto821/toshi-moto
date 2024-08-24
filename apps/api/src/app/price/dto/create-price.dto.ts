export class CreatePriceDto {
  readonly price: number;
  readonly currency: string;
  readonly timestamp: Date;
  readonly volume: number;
}

export class RangeQueryDto {
  readonly vs_currency: string;
  readonly from: number;
  readonly to: number;
  readonly group_by: "5M" | "1H" | "1D" | "1W";
  readonly range: string;
}

export class SimplePriceDto {
  readonly ids: string;
  readonly vs_currencies: string;
}
