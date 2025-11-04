import LabelComponent from "../LabelComponent/LabelComponent";
import { Spin } from "antd";

export const SelectNotFoundContent = ({ loading }: { loading: boolean }) => {
  return (
    <div className="min-h-[100px] flex flex-col justify-center items-center">
      {loading ? (
        <div className="flex w-full justify-center h-full items-center">
          <Spin />
        </div>
      ) : (
        <LabelComponent text="No data found" />
      )}
    </div>
  );
};
