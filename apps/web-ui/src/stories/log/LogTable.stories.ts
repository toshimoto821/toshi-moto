import type { Meta, StoryObj } from "@storybook/react";
import { request } from "./mocks/request";
import { LogTable } from "@components/log/components/LogTable";
import "../../index.css";
const meta = {
  title: "Log/LogTable",
  component: LogTable,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: "fullscreen",
  },
} satisfies Meta<typeof LogTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  args: {
    requests: [request, request, request, request, request],
    activeRequestIndex: 0,
  },
};
