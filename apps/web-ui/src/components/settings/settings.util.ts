export function urlB64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function unsubscribeUserFromBrowserPush(): Promise<boolean> {
  const subscription = await getSubscription();
  if (subscription) {
    return subscription.unsubscribe();
  }
  return false;
}

export function subscribeUserToPush(
  registration: ServiceWorkerRegistration,
  publicKey: string
): Promise<PushSubscription | void> {
  const applicationServerKey = urlB64ToUint8Array(publicKey);
  return registration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    })
    .then((subscription: PushSubscription) => {
      console.log("User is subscribed:", subscription);
      // Send the subscription to your server
      return subscription;
    })
    .catch((error: any) => {
      if (Notification.permission === "denied") {
        console.warn("Permission for notifications was denied");
      } else {
        console.error("Failed to subscribe the user:", error);
      }
    });
}

export function getSubscription() {
  return navigator.serviceWorker.ready.then((registration) => {
    return registration.pushManager.getSubscription();
  });
}
