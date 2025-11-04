import { InputNumber, InputNumberProps } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";
import React from "react";

const InputNumberComponent = React.memo(function InputNumberComponent({
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
} & InputNumberProps) {
  return (
    <InputNumber
      ref={ref}
      className={
        `${
          disabled
            ? "bg-bg_input_disable_color  text-black border-border_input_disabled placeholder:text-black inputPlaceholder"
            : ""
        } w-full ` + className
      }
      changeOnWheel={false}
      // type="number"
      disabled={disabled}
      size={size}
      placeholder={placeholder}
      controls={false}
      formatter={(val) => {
        if (!val) return "";
        const [intPart, decimalPart] = val.toString().split(".");
        const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return decimalPart ? `${withCommas}.${decimalPart}` : withCommas;
      }}
      parser={(val) => (val ? val.replace(/,/g, "") : "")}
      {...rest}
    />
  );
});
export default InputNumberComponent;
