import { lazy, Suspense } from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { Root } from "@screens/Root.tsx";
import { Error } from "@screens/error/Error.tsx";
import { Home } from "@screens/home/Home.tsx";
import { WalletRows } from "@screens/home/WalletRows";
import { Onboarding } from "@screens/onboarding/Onboarding";

const WalletDetail = lazy(
  () => import(/* webpackPrefetch: true */ "@root/screens/home/WalletDetail")
);

export const App = () => {
  const router = createHashRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <Error />,
      children: [
        {
          path: "",
          element: <Home />,
          children: [
            {
              path: ":walletId/:address?",
              element: (
                <Suspense fallback={<div>Loading...</div>}>
                  <WalletDetail />
                </Suspense>
              ),
            },
            {
              path: "",
              element: <WalletRows />,
            },
            {
              path: "/onboarding",
              element: <Onboarding />,
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};
