import { CheckboxOptionType, Radio, RadioGroupProps } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";

const RadioGroupButton = ({
  className = "",
  disabled = false,
  size = "middle",
  ref,
  options = [],
  ...rest
}: {
  disabled?: boolean;
  className?: string;
  size?: SizeType;
  ref?: any;
  options?: CheckboxOptionType[];
} & RadioGroupProps) => {
  return (
    <Radio.Group
      size={size}
      disabled={disabled}
      ref={ref}
      className={className}
      options={options}
      {...rest}
    />
  );
};
export default RadioGroupButton;
