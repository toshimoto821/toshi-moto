import ToshiSvg from "../../assets/toshi.svg?react";

export const Loading = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div>
        <ToshiSvg width="388" />
      </div>
    </div>
  );
};
