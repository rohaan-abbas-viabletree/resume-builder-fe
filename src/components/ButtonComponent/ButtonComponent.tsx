import { Button, ButtonProps } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";
import Image from "next/image";

const ButtonComponent = ({
  text = "button",
  type = "primary",
  htmlType = "button",
  btnCustomType = "",
  className = "",
  disabled = false,
  size = "middle",
  iconImage = "",
  ...rest
}: {
  disabled?: boolean;
  className?: string;
  btnCustomType?: "outline" | "inner-primary" | "blue-button" | "";
  text: string;
  type?: "default" | "link" | "primary" | "text";
  htmlType?: "button" | "submit" | "reset";
  size?: SizeType;
  iconImage?: any;
} & ButtonProps) => {
  return (
    <Button
      size={size}
      disabled={disabled}
      className={
        ` ${
          btnCustomType == "outline" && !disabled && rest.danger
            ? "border-danger_border border  bg-bg_danger "
            : btnCustomType == "outline" && !disabled
            ? "border-border_red_secondary text-color_red bg-color_lightred hover-red "
            : btnCustomType === "inner-primary"
            ? "border-0 text-color_primary bg-bg_inner_primary blue-hover"
            : ""
        }` +
        ` ${size === "large" ? "font-medium" : ""} ` +
        `${
          type == "primary" && btnCustomType == ""
            ? "bg-bg_red_linear_secondary light-red-hover"
            : ""
        }` +
        className
      }
      htmlType={htmlType}
      type={type}
      {...(iconImage
        ? {
            icon: (
              <Image
                alt=""
                className={
                  size === "large"
                    ? "max-w-[20px]"
                    : " max-w-[14px] md:max-w-[18px] "
                }
                src={iconImage}
              />
            ),
          }
        : {})}
      {...rest}>
      {text}
    </Button>
  );
};
export default ButtonComponent;
