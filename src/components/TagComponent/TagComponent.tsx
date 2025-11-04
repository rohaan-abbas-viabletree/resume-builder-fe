import { Tag } from "antd";

const tagColor = {
  success: "#3FC8AA",
  error: "#FF5656",
  info: "#F9C74F",
};

const tagBGColor = {
  success: `${tagColor.success}33`,
  error: "#FF56560D",
  info: `${tagColor.info}33`,
};

type TagType = "success" | "error" | "info";

export const TagComponent = ({
  type = "success",
  label = "",
  className = "",
  withDot = true, // dot only for success/info
  onClick,
}: {
  label: string;
  type?: TagType;
  className?: string;
  withDot?: boolean;
  onClick?: () => void;
}) => {
  const showDot = withDot && (type === "success" || type === "info");

  return (
    <Tag
      color={type === "error" ? "error" : tagBGColor[type]}
      bordered={false}
      className={
        "py-1 rounded-md flex items-center w-max " +
        `${
          type === "success"
            ? "text-tag_success"
            : type === "error"
            ? "text-tag_error"
            : "text-tag_info"
        } font-medium !` +
        className
      }>
      <span className="text-sm">{label}</span>
      {showDot && (
        <span
          className="ml-2 inline-block px-2 py-2 rounded-full"
          style={{ backgroundColor: tagColor[type] }}
        />
      )}
    </Tag>
  );
};

export const TagFullRoundedComponent = ({
  type = "success",
  label = "label",
  className = "",
  withDot = true, // dot only for success
}: {
  label: string;
  type?: "success" | "error";
  className?: string;
  withDot?: boolean;
}) => {
  const showDot = withDot && type === "success";

  return (
    <Tag
      color={type === "error" ? "error" : tagBGColor[type]}
      bordered={false}
      className={
        `${
          type === "success" ? "text-tag_success" : "text-tag_error"
        } font-medium flex items-center rounded-full px-3 ` + className
      }>
      <span className="leading-none p-1">{label}</span>
      {showDot && (
        <span
          className="ml-2 inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: tagColor[type] }}
        />
      )}
    </Tag>
  );
};

export default TagComponent;
