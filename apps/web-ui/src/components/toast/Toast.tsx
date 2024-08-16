import { Button, Text } from "@radix-ui/themes";
import * as ToastUi from "@radix-ui/react-toast";
import { useAppDispatch, useAppSelector } from "@root/lib/hooks/store.hooks";
import { selectUI, setUI } from "@root/lib/slices/ui.slice";

export const Toast = () => {
  const { toastOpen: open, toastMessage: message } = useAppSelector(selectUI);
  const dispatch = useAppDispatch();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dispatch(
        setUI({
          toastMessage: null,
          toastOpen: false,
        })
      );
    }
  };

  const clearToast = () => {
    handleOpenChange(false);
  };

  const actionHandler = clearToast;

  return (
    <div>
      <ToastUi.Provider swipeDirection="right" duration={15000}>
        <ToastUi.Root
          className="bg-white flex rounded-md shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] p-[15px] grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-[15px] items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
          open={open}
          onOpenChange={handleOpenChange}
        >
          <ToastUi.Title className="[grid-area:_title] mb-[5px] font-medium text-slate12 text-[15px]">
            <Text size="3" weight="bold">
              {message?.line1}
            </Text>
            {message?.line2 && (
              <ToastUi.Description>
                <Text color="gray">{message?.line2}</Text>
              </ToastUi.Description>
            )}
          </ToastUi.Title>

          {message && (
            <ToastUi.Action
              className="[grid-area:_action]"
              asChild
              altText="OK"
            >
              <Button onClick={actionHandler}>OK</Button>
            </ToastUi.Action>
          )}
        </ToastUi.Root>
        <ToastUi.Viewport className="[--viewport-padding:_25px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[390px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
      </ToastUi.Provider>
    </div>
  );
};
