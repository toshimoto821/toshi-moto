import { useEffect } from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import type { Meta, StoryObj, Decorator } from "@storybook/react";
import { UtxoSankey } from "@components/graphs/UtxoSankey";
import "../../index.css";
import { useWallet } from "@root/lib/hooks/useWallet";

const reactRouterDecorator: Decorator = (Story) => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/*" element={<Story />} />
      </Routes>
    </MemoryRouter>
  );
};

const UtxoSankeyWrapper = () => {
  const { actions, wallet, wallets } = useWallet([
    "tpubDFZ2SQB6yrL4kTs3AMRGsddnJ7VFu4388HU6SDYNVizHp3bRTQxWyDhKqdpagfBvMU9cZ8U6K458xKXdXbYztFYksqD2rXrrTN5LqXL2Wkf",
  ]);

  useEffect(() => {
    actions.createWallet();
  }, [actions]);

  const address = wallet?.getAddress(
    "bc1q0zca2ylgutn9jxhkcflhry7kmrr86tf8wh5tat"
  );
  if (!address) return null;
  return (
    <div>
      <UtxoSankey
        selectedTxs={[]}
        utxo={address}
        width={900}
        height={300}
        wallets={wallets}
        toggleTx={() => {}}
        index={0}
      />
    </div>
  );
};

const meta = {
  title: "Graphs/UTXO",
  component: UtxoSankeyWrapper,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  decorators: [reactRouterDecorator],
} satisfies Meta<typeof UtxoSankey>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {},
};
