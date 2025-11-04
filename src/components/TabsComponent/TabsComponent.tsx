import { Tabs, TabsProps } from "antd";
import React from "react";

const TabsComponent = ({
  items = [],
  ...rest
}: {
  items?: TabsProps["items"];
} & TabsProps) => {
  return <Tabs className="p-0 " items={items} {...rest} />;
};
export default TabsComponent;
