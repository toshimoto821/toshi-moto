import { NetworkContext } from "@providers/AppProvider";
import type { IRequest } from "@machines/network.types";
type ILogDetailActions = {
  request: IRequest;
  onDelete: () => void;
};
export const LogDetailActions = ({ request, onDelete }: ILogDetailActions) => {
  const networkActorRef = NetworkContext.useActorRef();

  // const requests = NetworkContext.useSelector((current) => {
  //   return current.context.requests;
  // });

  const handleRetry = () => {
    const { id } = request;

    networkActorRef.send({ type: "DELETE", data: { id } });
    if (onDelete) {
      onDelete();
    }
  };
  return <button onClick={handleRetry}>delete</button>;
};
