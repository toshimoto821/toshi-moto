import {
  Blockquote,
  Heading,
  Separator,
  Text,
  Button,
  TextField,
} from "@radix-ui/themes";
import { useWallet } from "@lib/hooks/useWallet";
import { useNavigate } from "react-router-dom";
import { useReward } from "react-rewards";

const VITE_TOSHI_MOTO_XPUB = import.meta.env.VITE_TOSHI_MOTO_XPUB;

export const Onboarding = () => {
  const xpubs = VITE_TOSHI_MOTO_XPUB.split(",");
  const { actions } = useWallet(xpubs);
  const navigate = useNavigate();
  const { reward, isAnimating } = useReward("rewardId", "confetti");

  const handleClickImport = () => {
    reward();
    actions.createWallet("Toshi Moto", "toshi-moto");

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 md:px-0 mb-4">
        <div className="py-2 px-4 border rounded bg-white drop-shadow-lg">
          <div className="py-4">
            <Heading size="6">Toshi Moto</Heading>
          </div>
          <Separator size="3" />
          <div className="py-4 flex flex-col">
            <div className="px-2">
              <Blockquote>
                I created this app to help manage my wallets and keep track of
                my Bitcoin stack. I have wallets for my kids, wallets for this
                app, wallets for long term HODL'ing, actually I might have a
                problem creating too many Bitcoin wallets. Anyways, I found it
                hard and not fun to keep track of them all. This app was a way
                for me to tie them all together. If you have any feedback or
                suggestions, I would love to hear from you. A few promises:
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>
                    <Text>
                      <b>Privacy first</b> - This app does not use any analytics
                      or tracking software other than static network requests as
                      reported by its host. Additionally, URL routing is done
                      with hash based routing (such as url paths like{" "}
                      <span className="font-mono text-xs">/#/onboarding</span>)
                      to avoid leaking any information to the server. The
                      browser does not send any part of the request after the
                      hash to the server.
                    </Text>
                  </li>
                  <li>
                    <Text>
                      <b>Transparency</b> - All source code to [the Github
                      repo](https://github.com/toshimoto821/toshi-moto) for
                      review. However, this software published under the
                      PolyForm Noncommercial 1.0.0 license, meaning you're free
                      to use, fork, modify, and redistribute it for personal and
                      nonprofit use under the same license.
                    </Text>
                  </li>
                  <li>
                    <Text>
                      <b>Education</b> - My primary goal is to provide a tool to
                      help people learn about Bitcoin and understand it.
                    </Text>
                  </li>
                </ul>
              </Blockquote>
            </div>
          </div>
        </div>
        <div className="py-2 px-4 border rounded bg-white drop-shadow-lg">
          <div className="py-4">
            <Heading size="6">Getting Started</Heading>
          </div>
          <Separator size="3" />
          <div className="py-4 flex flex-col">
            <div className="mb-2">
              <Text className="">
                To get started import the Toshi Moto wallet below. This will
                give you a demo wallet to play with. I've made the Xpub public
                (something you should never do) so that you can explore the
                different addresses.
              </Text>
            </div>
            <div className="mb-2">
              <TextField.Root disabled defaultValue={VITE_TOSHI_MOTO_XPUB} />
            </div>
            <div className="mb-2">
              <Text>
                You can view the wallet, you can even send Bitcoin to the wallet
                (<b>which i will view as a donation</b>
                ), but you cannot spend from it. Click the button below to
                import the Toshi Moto wallet. I plan on using this wallet to
                showcase different types of transactions and help educate my
                friends and family on how to understand and use Bitcoin.
              </Text>
            </div>
            <div className="my-8">
              <Separator size="4" />
            </div>
            <Button disabled={isAnimating} onClick={handleClickImport}>
              <span id="rewardId" />
              Import Toshi Moto Wallet
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1gap-4 px-2 md:px-0 mb-4">
        <div className="py-2 px-4 border rounded bg-white drop-shadow-lg">
          <div className="py-4">
            <Heading>Credits / About</Heading>
            <Text>
              This app was made with ❤️ with following open source libraries:
            </Text>
            <ul className="list-disc list-inside mt-2 ml-4 mb-4">
              <li>
                <Text>
                  <b>
                    <a
                      href="https://react.dev/"
                      className="text-blue-500 underline"
                      target="_blank"
                    >
                      React
                    </a>
                  </b>{" "}
                  - The frontend is built with React and uses react-router for
                  routing.
                </Text>
              </li>
              <li>
                <Text>
                  <b>
                    <a
                      href="https://xstate.js.org/"
                      className="text-blue-500 underline"
                      target="_blank"
                    >
                      X State
                    </a>
                  </b>{" "}
                  - The state management is done with X State.
                </Text>
              </li>
              <li>
                <Text>
                  <b>
                    <a
                      href="https://d3js.org/"
                      className="text-blue-500 underline"
                      target="_blank"
                    >
                      D3.js
                    </a>
                  </b>{" "}
                  - The app uses D3.js for charting.
                </Text>
              </li>
              <li>
                <Text>
                  <b>
                    <a
                      href="https://www.radix-ui.com/"
                      className="text-blue-500 underline"
                      target="_blank"
                    >
                      Radix UI
                    </a>
                  </b>{" "}
                  - The UI is built with Radix UI components.
                </Text>
              </li>
              <li>
                <Text>
                  <b>
                    <a
                      href="https://github.com/bitcoinjs/bitcoinjs-lib"
                      className="text-blue-500 underline"
                      target="_blank"
                    >
                      BitcoinJS
                    </a>
                  </b>{" "}
                  - The BitcoinJS library is used for generating addresses from
                  the xpub.
                </Text>
              </li>
              <li>
                <Text>
                  <b>
                    <a
                      href="https://github.com/localForage/localForage"
                      className="text-blue-500 underline"
                      target="_blank"
                    >
                      Local Forage
                    </a>
                  </b>{" "}
                  - The app uses local forage for persistence.
                </Text>
              </li>
              <li>
                <Text>
                  <b>
                    <a
                      href="https://tailwindcss.com/"
                      className="text-blue-500 underline"
                      target="_blank"
                    >
                      Tailwind
                    </a>
                  </b>{" "}
                  - The app uses tailwind for styling.
                </Text>
              </li>
              <li>
                <Text>
                  <b>
                    <a
                      href="https://vitejs.dev/"
                      className="text-blue-500 underline"
                      target="_blank"
                    >
                      Vite
                    </a>
                  </b>{" "}
                  - The app is built with Vite.
                </Text>
              </li>
              <li>
                <Text>
                  <b>
                    <a
                      href="https://vite-pwa-org.netlify.app/"
                      className="text-blue-500 underline"
                      target="_blank"
                    >
                      Vite PWA
                    </a>
                  </b>{" "}
                  - The app is a PWA built with Vite PWA.
                </Text>
              </li>
              <li>
                <Text>
                  <b>
                    <a
                      href="https://www.typescriptlang.org/"
                      className="text-blue-500 underline"
                      target="_blank"
                    >
                      Typescript
                    </a>
                  </b>{" "}
                  - The app is built with Typescript.
                </Text>
              </li>
              <li>
                <Text>
                  <b>
                    <a
                      href="https://storybook.js.org/"
                      className="text-blue-500 underline"
                      target="_blank"
                    >
                      Storybook
                    </a>
                  </b>{" "}
                  - The app uses storybook for component development.
                </Text>
              </li>
            </ul>
            <Text>The following API's are used for sourcing data:</Text>
            <ul className="list-disc list-inside mt-2 ml-4 mb-4">
              <li>
                <Text>
                  <b>
                    <a
                      href="https://mempool.space/docs/api/rest"
                      className="text-blue-500 underline"
                      target="_blank"
                    >
                      https://mempool.space/
                    </a>
                  </b>{" "}
                  - Use to read blockchain data.
                </Text>
              </li>
              <li>
                <Text>
                  <b>
                    <a
                      href="https://www.coingecko.com/api/documentation"
                      className="text-blue-500 underline"
                      target="_blank"
                    >
                      https://www.coingecko.com
                    </a>
                  </b>{" "}
                  - Use to get current and historical pricing data.
                </Text>
              </li>
              <li>
                <Text>
                  <b>
                    <a
                      href="https://blockchain.info/q/totalbc"
                      className="text-blue-500 underline"
                      target="_blank"
                    >
                      https://blockchain.info
                    </a>
                  </b>{" "}
                  - Use to get get total bitcoin supply.
                </Text>
              </li>
            </ul>
            <div className="py-4">
              <Text>
                I believe bitcoin's creation by Satoshi Nakamoto is the single
                greatest discovery in human history. It is a technology that
                will change the world. I hope this app can help people
                understand it better. Lastly, we need to follow in Satoshi's
                footsteps and add value to the network by creating. This network
                is not controlled by a centralized government or corporation, it
                is built and maintained by the people. It will not be easy or
                grow without our help. We need to build on top of it and add
                value to it. If you have any ideas or want to contribute to this
                app please do so.
              </Text>
            </div>
            <div>
              <Text>
                - <b>Toshi Moto</b>
              </Text>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
