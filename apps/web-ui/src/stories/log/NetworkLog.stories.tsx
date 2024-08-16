import type { Meta, StoryObj } from "@storybook/react";

// import { LogDetail } from "@components/log/components/LogDetail/LogDetail";
import { LogTable } from "@components/log/components/LogTable";
// import { request } from "./mocks/request";

import "../../index.css";

const Log = () => (
  <LogTable requests={[]} activeRequestIndex={0}>
    {/* <LogDetail request={request} /> */}
  </LogTable>
);

const meta = {
  title: "Log/NetworkLog",
  component: Log,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: "fullscreen",
  },
} satisfies Meta<typeof Log>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Network: Story = {
  args: {},
};
