import { forwardRef, ReactNode } from "react";
import JsonView from "@uiw/react-json-view";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { type IRequest } from "@machines/network.types";
import { cn as classNames } from "@lib/utils";
import "./log-detail-tab.css";

type ILogDetailTab = {
  request: IRequest;
};
export const LogDetailTab = (props: ILogDetailTab) => {
  const { request } = props;

  return (
    <Accordion.Root type="multiple" defaultValue={["item-1"]}>
      <AccordionItem value="item-1">
        <AccordionTrigger>General</AccordionTrigger>
        <AccordionContent className="text-xs">
          <div className="flex">
            <div className="w-36">Request URL</div>
            <div className="flex-1">{request.url}</div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Response</AccordionTrigger>
        <AccordionContent className="text-xs">
          <JsonView value={request?.response?.data} />

          {false &&
            request?.response?.headers["content-type"] !==
              "application/json" && <pre>{request?.response?.data}</pre>}
        </AccordionContent>
      </AccordionItem>
    </Accordion.Root>
  );
};

interface AccordionItemProps {
  children: ReactNode;
  className?: string;
  value: string;
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Item
      className={classNames(
        "border-b border-gray-200",
        "focus-within:shadow-mauve12 mt-px overflow-hidden first:mt-0  focus-within:relative focus-within:z-10",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </Accordion.Item>
  )
);

interface AccordionTriggerProps {
  children: ReactNode;
  className?: string;
}

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Header className="flex">
      <Accordion.Trigger
        className={classNames(
          "text-violet11 shadow-mauve6 hover:bg-mauve2 group flex h-[40px] flex-1 cursor-default items-center justify-between bg-white px-2  text-[15px] leading-none shadow-[0_1px_0] outline-none text-xs",
          className
        )}
        {...props}
        ref={forwardedRef}
      >
        <div className="flex">
          <ChevronDownIcon
            className="text-violet10 ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180 mr-2"
            aria-hidden
          />
          {children}
        </div>
      </Accordion.Trigger>
    </Accordion.Header>
  )
);

interface AccordionContentProps {
  children: ReactNode;
  className?: string;
}

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={classNames(
        "text-mauve11 bg-mauve2 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-scroll text-[15px]",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <div className="py-[15px] px-5">{children}</div>
    </Accordion.Content>
  )
);
