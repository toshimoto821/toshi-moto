export const Loading = ({ message }: { message?: string }) => {
  return (
    <div className="flex h-screen justify-center items-center flex-col bg-gradient-to-br from-violet1 to-violet3 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet6 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-mauve6 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with subtle animation */}
        <div className="mb-8 transform transition-all duration-1000 hover:scale-105">
          <div className="relative">
            <img
              width="388"
              height="388"
              src="/toshi.svg"
              alt="Toshi Moto"
              className="drop-shadow-2xl animate-pulse"
            />
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet6 to-mauve6 rounded-full blur-xl opacity-20 animate-pulse"></div>
          </div>
        </div>

        {/* Loading spinner */}
        <div className="mb-6">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-violet9 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-violet9 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-violet9 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center max-w-md px-4">
          <p className="text-lg font-medium text-mauve12 mb-2">
            {message || "Loading..."}
          </p>
        </div>
      </div>
    </div>
  );
};
