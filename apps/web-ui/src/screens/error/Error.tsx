import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export const Error = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      {isRouteErrorResponse(error) && (
        <p>
          <i>{error.statusText}</i>
        </p>
      )}
    </div>
  );
};
