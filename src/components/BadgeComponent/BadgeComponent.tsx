import { Popover } from "antd";
import React from "react";

const BadgeComponent = ({ list = [""] }: { list: [string] }) => {
  return (
    <div className="flex">
      {list?.length && list[0]}
      {list?.length > 1 && (
        <Popover
          className="rounded-full bg-bg_inner_primary px-2 ml-1 cursor-pointer text-color_primary font-medium"
          placement="right"
          content={list.slice(1).map((item) => (
            <>
              {item}
              <br />
            </>
          ))}>
          +{list.slice(1).length}
        </Popover>
      )}
    </div>
  );
};

export default BadgeComponent;
