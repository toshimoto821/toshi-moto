import {
  Heading,
  Separator,
  Text,
  Button,
  TextField,
  Card,
} from "@radix-ui/themes";
import { useWallet } from "@lib/hooks/useWallet";
import { useNavigate } from "react-router-dom";
import { useReward } from "react-rewards";

const VITE_TOSHI_MOTO_XPUB = import.meta.env.VITE_TOSHI_MOTO_XPUB || "";

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
    <div className="container mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <Heading size="8" className="text-4xl font-bold text-gray-900">
          Welcome to Toshi Moto
        </Heading>
        <Text size="5" className="text-gray-600 max-w-2xl mx-auto">
          A privacy-focused Bitcoin wallet manager designed to help you
          understand and track your Bitcoin holdings with transparency and
          educational tools.
        </Text>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1  gap-8">
        {/* Getting Started Section */}
        <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
          <Heading size="6" className="mb-2 text-gray-900">
            Get Started
          </Heading>
          <Separator size="4" className="mb-2" />
          <div className="space-y-4">
            <Text className="text-gray-700">
              Import the demo wallet below to explore Toshi Moto's features.
              This public xpub allows you to view transactions and understand
              how the app works.
            </Text>

            <div className="bg-gray-100 p-2 rounded-lg border border-gray-200">
              <Text size="2" className="text-gray-500 mb-2">
                <strong>Demo Wallet Xpub</strong>
              </Text>
              <TextField.Root
                disabled
                defaultValue={VITE_TOSHI_MOTO_XPUB}
                className="font-mono text-xs"
              />

              <Text className="text-gray-700 text-xs ml-1 italic">
                This is a demo wallet for educational purposes. You can view
                transactions and send Bitcoin to it, but cannot spend from it.
              </Text>
            </div>

            <div>
              <span id="rewardId" />
              <Button
                data-testid="import-toshi-moto-wallet"
                disabled={isAnimating}
                onClick={handleClickImport}
                size="3"
                className="w-full text-white flex justify-center"
              >
                Import Demo Wallet
              </Button>
            </div>
          </div>
        </Card>

        {/* About Section */}
        <Card className="p-8 bg-gradient-to-br  border-0 shadow-lg">
          <Heading size="6" className="mb-2 text-gray-900">
            About Toshi Moto Wallet
          </Heading>
          <Separator size="4" className="mb-2" />
          <div className="space-y-6">
            <Text className="text-gray-700 leading-relaxed">
              Toshi Moto is an open-source Bitcoin wallet manager that provides
              a comprehensive view of your Bitcoin holdings across multiple
              wallets. Built with privacy and education in mind, it helps users
              understand Bitcoin transactions, track their portfolio, and learn
              about cryptocurrency fundamentals.
            </Text>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <Text className="text-gray-700">
                  <strong>Privacy First:</strong> No analytics or tracking
                  software. Uses hash-based routing to prevent data leakage to
                  servers.
                </Text>
              </div>
              <div className="flex items-start space-x-4">
                <Text className="text-gray-700">
                  <strong>Transparency:</strong> Open-source code available for
                  review under PolyForm Noncommercial 1.0.0 license.
                </Text>
              </div>
              <div className="flex items-start space-x-4">
                <Text className="text-gray-700">
                  <strong>Educational:</strong> Designed to help users learn
                  about Bitcoin and understand blockchain transactions.
                </Text>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Features Section */}
      <Card className="p-8 bg-gradient-to-br border-0 shadow-lg">
        <Heading size="6" className="mb-2 text-gray-900">
          Key Features
        </Heading>
        <Separator size="4" className="mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <Heading size="4">Privacy Focused</Heading>
            <Text className="text-gray-600 text-sm">
              No tracking, no analytics, hash-based routing for complete privacy
            </Text>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <Heading size="4">Portfolio Tracking</Heading>
            <Text className="text-gray-600 text-sm">
              Monitor multiple wallets and track your Bitcoin holdings
            </Text>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <Heading size="4">Educational</Heading>
            <Text className="text-gray-600 text-sm">
              Learn about Bitcoin transactions and blockchain technology
            </Text>
          </div>
        </div>
      </Card>

      {/* Technology Stack */}
      <Card className="p-8 bg-gradient-to-br  shadow-lg">
        <Heading size="6" className="mb-2 text-gray-900">
          Built With
        </Heading>
        <Separator size="4" className="mb-2" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              name: "React",
              url: "https://react.dev/",
              image: "/assets/tech/react.svg",
            },
            {
              name: "TypeScript",
              url: "https://www.typescriptlang.org/",
              image: "/assets/tech/ts-logo-round-128.svg",
            },
            {
              name: "Redux Toolkit",
              url: "https://redux-toolkit.js.org/",
              image: "/assets/tech/redux.svg",
            },
            {
              name: "Radix UI",
              url: "https://www.radix-ui.com/",
              image: "/assets/tech/radix.png",
            },
            {
              name: "Tailwind CSS",
              url: "https://tailwindcss.com/",
              image: "/assets/tech/tailwind.svg",
            },
            {
              name: "D3.js",
              url: "https://d3js.org/",
              image: "/assets/tech/d3.svg",
            },
            {
              name: "BitcoinJS",
              url: "https://github.com/bitcoinjs/bitcoinjs-lib",
              image: "/assets/tech/bitcoin-logo.svg",
            },
            { name: "Vite", url: "https://vitejs.dev/", image: "vite.svg" },
          ].map((tech) => (
            <a
              key={tech.name}
              href={tech.url}
              target="_blank"
              rel="noreferrer"
              className="block p-4 bg-white rounded-lg text-center hover:shadow-md transition-shadow flex items-center justify-center gap-2"
            >
              <img src={tech.image} alt={tech.name} width={24} height={24} />
              <Text className="font-medium text-gray-700">{tech.name}</Text>
            </a>
          ))}
        </div>
      </Card>

      {/* Data Sources */}
      <Card className="p-8 bg-gradient-to-br shadow-lg">
        <Heading size="6" className="mb-2 text-gray-900">
          Data Sources
        </Heading>
        <Separator size="4" className="mb-2" />
        <div className="space-y-4">
          {[
            {
              name: "Mempool.space",
              description: "Blockchain data and transaction information",
              url: "https://mempool.space/docs/api/rest",
            },
            {
              name: "Binance API",
              description: "Current and historical Bitcoin pricing data",
              url: "https://dev.binance.vision/c/api-en/7",
            },
            {
              name: "Blockchain.info",
              description: "Total Bitcoin supply information",
              url: "https://blockchain.info/q/totalbc",
            },
          ].map((source) => (
            <div
              key={source.name}
              className="flex items-center justify-between p-4 bg-white rounded-lg"
            >
              <div>
                <Text className="font-medium text-gray-900">{source.name}</Text>
                <Text className="text-sm text-gray-600">
                  {source.description}
                </Text>
              </div>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                API Docs →
              </a>
            </div>
          ))}
        </div>
      </Card>
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <img
              src="/assets/tech/webshotarchive.svg"
              alt="Webshot Archive"
              className="w-20 h-20"
            />
          </div>
          <div className="flex flex-col">
            <Text className="font-semibold text-blue-900 text-lg">
              Sponsored by Webshot Archive
            </Text>
            <Text className="text-blue-700 text-sm">
              Toshi Moto was built and is sponsored by the creator of{" "}
              <a
                href="https://www.webshotarchive.com?utm_source=toshi-moto&utm_medium=open-source"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Webshot Archive
              </a>
              . Webshot Archive is a frontend developer tool that allows you to
              visually compare screenshots on GitHub PRs and across time in the
              Webshot Archive dashboard. Toshi Moto uses it in its GitHub repo
              and you can see an example comment and screenshot{" "}
              <a
                href="https://github.com/webshotarchive/webshotarchive/pull/100"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                here
              </a>
              .
            </Text>
          </div>
        </div>
        <Text className="text-blue-800 leading-relaxed"></Text>
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <Text className="text-gray-500">
          Open source project •{" "}
          <a
            href="https://github.com/toshimoto821/toshi-moto"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            View on GitHub
          </a>
        </Text>
      </div>
    </div>
  );
};
