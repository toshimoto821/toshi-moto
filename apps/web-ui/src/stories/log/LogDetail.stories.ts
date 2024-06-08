import type { Meta, StoryObj } from "@storybook/react";
import { request } from "./mocks/request";
import { LogDetail } from "@components/log/components/LogDetail/LogDetail";
import "../../index.css";
const VITE_BITCOIN_NODE_URL = import.meta.env.VITE_BITCOIN_NODE_URL;
console.log(VITE_BITCOIN_NODE_URL, "VITE_BITCOIN_NODE_URL");
const meta = {
  title: "Log/LogDetail",
  component: LogDetail,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: "fullscreen",
  },
} satisfies Meta<typeof LogDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  args: {
    request,
  },
};
