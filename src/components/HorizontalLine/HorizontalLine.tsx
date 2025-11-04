import React from "react";

const HorizontalLine = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={
        "border-b border-border_input_disabled border-dashed w-full " +
        className
      }
    />
  );
};

export default HorizontalLine;
