import { DatePicker } from "antd";
import { RangePickerProps } from "antd/es/date-picker";

const RangePickerInput = ({
  className = "",
  ...rest
}: {
  className?: string;
  btnCustomType?: "outline" | "";
} & RangePickerProps) => {
  return (
    <DatePicker.RangePicker
      format={{
        format: "MMM D,YYYY",
        type: "mask",
      }}
      className={"w-full " + className}
      {...rest}
    />
  );
};
export default RangePickerInput;
