import { Input, InputProps } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";
import React from "react";

const InputText = React.memo(function InputText({
  className = "",
  disabled = false,
  placeholder = "",
  ref,
  ...rest
}: {
  disabled?: boolean;
  className?: string;
  btnCustomType?: "outline" | "";
  size?: SizeType;
  placeholder?: string;
  ref?: any;
} & InputProps) {
  return (
    <Input
      ref={ref}
      className={
        `${
          disabled
            ? "bg-bg_input_disable_color text-black border-border_input_disabled placeholder:text-black"
            : ""
        } ` + className
      }
      disabled={disabled}
      placeholder={placeholder}
      {...rest}
    />
  );
});
export default InputText;
