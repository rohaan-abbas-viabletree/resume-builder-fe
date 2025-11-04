import { ButtonProps, Dropdown, FormInstance, MenuProps } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import { SAVE_TYPES } from "@/lib/utils/utils";
import { ISaveType } from "@/types/common";

const SaveCloseBtn = ({
  antdForm,
  callback,
  closeRoutePath = "",
  onCloseCallBack = () => {},
  text = "button",
  type = "primary",
  btnCustomType = "",
  className = "",
  disabled = false,
  size = "middle",
  iconImage = "",
  isComponent = false,
  handleAfterClose = () => {},
  ...rest
}: {
  antdForm: FormInstance<any>;
  callback: (
    val:
      | ISaveType["SAVE"]
      | ISaveType["SAVE_ADD_NEW"]
      | ISaveType["SAVE_CLOSE"],
  ) => void;
  closeRoutePath?: string;
  onCloseCallBack?: () => void;
  disabled?: boolean;
  className?: string;
  btnCustomType?: "outline" | "inner-primary" | "";
  text: string;
  type?: "default" | "link" | "primary" | "text";
  size?: SizeType;
  isComponent?: boolean;
  iconImage?: any;
  handleAfterClose?: (val?: any) => void;
} & ButtonProps) => {
  const router = useRouter();

  const SAVE_CLOSE_BTN = [
    { key: "1", label: "Save and Close" },
    { key: "2", label: "Save and Add New" },
  ];

  const onClose = () => {
    if (closeRoutePath) {
      if (!isComponent) {
        router.push(closeRoutePath);
        return;
      }
      handleAfterClose(SAVE_TYPES.CLOSE);
    } else {
      onCloseCallBack();
    }
  };

  const saveClose = () => {
    callback(SAVE_TYPES.SAVE_CLOSE);
    antdForm.submit();
  };

  const saveNew = () => {
    callback(SAVE_TYPES.SAVE_ADD_NEW);
    antdForm.submit();
  };

  const onMenuClick: MenuProps["onClick"] = (e) => {
    if (e?.key === "1") saveClose();
    if (e?.key === "2") saveNew();
  };

  const onSave = () => {
    callback(SAVE_TYPES.SAVE);
  };

  return (
    <div className="saveCloseBtn flex flex-col md:flex-row items-center justify-end gap-2 w-full">
      <ButtonComponent
        type="default"
        btnCustomType="outline"
        text="Close"
        onClick={onClose}
        className="px-12 w-full md:w-max"
      />

      <div className="w-full md:w-max flex justify-end">
        <Dropdown.Button
          size={size}
          disabled={disabled}
          menu={{ items: SAVE_CLOSE_BTN, onClick: onMenuClick }}
          className={`w-full md:w-auto justify-end ${
            btnCustomType === "outline" && !disabled && rest.danger
              ? "border-danger_border border bg-bg_danger"
              : btnCustomType === "outline" && !disabled
              ? "border-border_primary text-color_primary bg-bg_blue_linear"
              : btnCustomType === "inner-primary"
              ? "border-0 text-color_primary bg-bg_inner_primary"
              : ""
          } ${size === "large" ? "font-medium" : ""} ${className}`}
          type={type}
          {...(iconImage
            ? {
                icon: (
                  <Image
                    alt=""
                    className={
                      size === "large" ? "max-w-[20px]" : "max-w-[18px]"
                    }
                    src={iconImage}
                  />
                ),
              }
            : {})}
          onClick={onSave}
          {...rest}>
          {text}
        </Dropdown.Button>
      </div>
    </div>
  );
};

export default SaveCloseBtn;
