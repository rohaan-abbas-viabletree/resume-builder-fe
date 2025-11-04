import { SelectArrowDown } from "@/Images";
import { Select, SelectProps } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";
import Image from "next/image";
import React from "react";

const SelectComponent = React.memo(function SelectComponent({
  className = "",
  disabled = false,
  placeholder = "",
  size = "middle",
  ref,
  ...rest
}: {
  disabled?: boolean;
  className?: string;
  btnCustomType?: "outline" | "";
  size?: SizeType;
  placeholder?: string;
  ref?: any;
} & SelectProps) {
  return (
    <Select
      ref={ref}
      suffixIcon={
        <Image
          alt=""
          width={size == "middle" || size == "small" ? 12 : 16}
          src={SelectArrowDown}
          className={size === "middle" || size == "small" ? "" : ""}
          height={size === "middle" || size == "small" ? 6 : 9}
        />
      }
      disabled={disabled}
      className={className + " w-full " + `${disabled ? " disableSelect" : ""}`}
      size={size}
      placeholder={placeholder}
      {...rest}
    />
  );
});
export default SelectComponent;
