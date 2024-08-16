import { Card, Box, Text, Button } from "@radix-ui/themes";
import type { APIRequestResponse } from "@lib/slices/network.slice.types";
import { deleteRequest } from "@root/lib/slices/network.slice";
import { useAppDispatch } from "@root/lib/hooks/store.hooks";

type ILogDetailActions = {
  request: APIRequestResponse;
  onDelete: () => void;
};
export const LogDetailActions = ({ request, onDelete }: ILogDetailActions) => {
  const dispatch = useAppDispatch();
  const handleDelete = () => {
    const { id } = request;

    dispatch(deleteRequest(id));

    if (onDelete) {
      onDelete();
    }
  };

  const handleRetry = () => {
    // if (request.retry) {
    //   request.retry();
    // }
    console.log("implement retry");
  };
  return (
    <div className="p-4">
      <Card className="mb-2">
        <div className="flex justify-between items-end">
          <Box>
            <Text as="div" size="2" weight="bold">
              Delete
            </Text>
            <Text as="div" size="2" color="gray">
              Delete this request from the network log
            </Text>
          </Box>
          <Box>
            <Button variant="soft" onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </div>
      </Card>
      {false && (
        <Card>
          <div className="flex justify-between items-end">
            <Box>
              <Text as="div" size="2" weight="bold">
                Retry
              </Text>
              <Text as="div" size="2" color="gray">
                Retry this request. This will send the request again to the
                server
              </Text>
            </Box>
            <Box>
              <Button variant="soft" onClick={handleRetry}>
                Retry
              </Button>
            </Box>
          </div>
        </Card>
      )}
    </div>
  );
};
