import { Card, Box, Text, Button } from "@radix-ui/themes";
import { NetworkContext } from "@providers/AppProvider";
import { type Request } from "@lib/slices/network.slice";

type ILogDetailActions = {
  request: Request;
  onDelete: () => void;
};
export const LogDetailActions = ({ request, onDelete }: ILogDetailActions) => {
  const networkActorRef = NetworkContext.useActorRef();

  // const requests = NetworkContext.useSelector((current) => {
  //   return current.context.requests;
  // });

  const handleDelete = () => {
    const { id } = request;

    networkActorRef.send({ type: "DELETE", data: { id } });
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
