import { Tag } from "antd";
const tagBGColor = {
  success: "#3FC8AA33",
  error: "#FF56560D",
};

const ToggleComponent = ({ type = true }: { type: boolean }) => {
  return (
    <Tag
      color={type ? tagBGColor["success"] : tagBGColor["error"]}
      bordered={false}
      className={
        "py-1 rounded-md " +
        `${type ? `text-tag_success` : "text-tag_error"} font-medium`
      }>
      <div className="flex items-center">
        {!type && (
          <span className="border rounded-full bg-tag_error px-2 py-2 mr-1"></span>
        )}
        {type ? "Active" : "Inactive"}
        {type && (
          <span className="border rounded-full bg-tag_success px-2 py-2 ml-1"></span>
        )}{" "}
      </div>
    </Tag>
  );
};
export default ToggleComponent;
