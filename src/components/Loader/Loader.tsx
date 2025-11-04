import { Spin } from "antd";

const Loader = () => {
  return (
    <div className="flex w-full justify-center min-h-[calc(100vh-120px)] items-center">
      <Spin />
    </div>
  );
};
export default Loader;
