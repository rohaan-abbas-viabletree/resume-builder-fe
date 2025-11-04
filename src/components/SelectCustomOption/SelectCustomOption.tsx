import { Avatar } from "antd";
import LabelComponent from "../LabelComponent/LabelComponent";
import { UserOutlined } from "@ant-design/icons";

const SelectCustomOption = ({
  icon,
  label,
  value,
  idLabel = "Card ID",
}: {
  label: string;
  value: string;
  icon?: string;
  idLabel?: string;
}) => {
  return (
    <div>
      <div className="flex">
        {icon && <Avatar src={icon} icon={<UserOutlined />} size={"large"} />}

        <div className={icon ? "ml-2" : ""}>
          <h5>{label}</h5>
          <LabelComponent text={`${idLabel}: ` + `${value ?? "-"}`} />
        </div>
      </div>
    </div>
  );
};

export default SelectCustomOption;
