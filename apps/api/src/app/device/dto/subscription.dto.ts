export class SubscriptionDto {
  readonly endpoint: string;
  readonly expirationTime: string | null;
  readonly keys: {
    p256dh: string;
    auth: string;
  };
}
