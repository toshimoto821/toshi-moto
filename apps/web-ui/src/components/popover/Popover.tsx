import { Popover as RadixPopover, Separator, Text } from "@radix-ui/themes";
import type { ReactNode } from "react";

type IRenderProp = (classNames: string) => ReactNode;

type IPopover = {
  title?: string;
  text: string | IRenderProp;
  children: ReactNode;
};
const classNames =
  "underline decoration-dashed underline-offset-2 decoration-slate-500 hover:cursor-pointer";
export const Popover = ({ title, text, children }: IPopover) => {
  const titleText =
    typeof text === "function" ? (
      text(classNames)
    ) : (
      <Text data-component="popover" className={classNames}>
        {text}
      </Text>
    );
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger>{titleText}</RadixPopover.Trigger>
      <RadixPopover.Content size="2">
        <div className="max-w-80">
          {title && (
            <div className="py-2">
              <Text size="4" weight="bold">
                {title}
              </Text>
              <Separator size="2" />
            </div>
          )}
          <div>{children}</div>
        </div>
      </RadixPopover.Content>
    </RadixPopover.Root>
  );
};
