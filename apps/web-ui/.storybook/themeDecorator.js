import React from "react";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

const ThemeDecorator = (storyFn) => <Theme>{storyFn()}</Theme>;

export default ThemeDecorator;
