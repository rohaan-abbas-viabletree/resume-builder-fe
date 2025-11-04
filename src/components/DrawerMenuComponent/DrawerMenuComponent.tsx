"use client";

import { IFunctionType } from "@/types/common";
import { Avatar, Drawer, Dropdown, Menu, MenuProps } from "antd";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import { SelectedArrowDown, AvatarRedIcon } from "@/Images";
import Image from "next/image";
import { HEADER_MENUS } from "@/static/constants";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const DrawerMenuComponent = ({
  open,
  handleClose = () => {},
}: {
  open: boolean;
  handleClose?: IFunctionType;
}) => {
  const [current, setCurrent] = useState("");
  const router = useRouter();
  const path = usePathname();

  const profile_dropdown_items = [
    {
      key: "logout",
      label: "Logout",
    },
  ];

  const items: MenuProps["items"] = useMemo(() => {
    return HEADER_MENUS.map((_) => ({
      key: _.key,
      label: _.label,
      className: `font-medium ${
        current === _.key ? "text-color_primary" : "text-color_purple"
      }`,
      onClick: () => {
        setCurrent(_.key);
        handleClose();
        if (!_.children) {
          router.push(_.url);
        }
      },
      ...(_?.children
        ? {
            children: _.children.map((child) => ({
              key: child.key,
              label: child.label,
              onClick: () => {
                router.push(child.url);
              },
            })),
          }
        : {}),
    }));
  }, [current, open]);

  useEffect(() => {
    let current = HEADER_MENUS.find((m) => m.url === path);

    // if no direct match, try to find which menu's children match
    if (!current) {
      current = HEADER_MENUS.find(
        (menu) =>
          menu.children &&
          menu.children.some((child) => path?.startsWith(child.url)),
      );
    }

    if (current?.children) {
      const child = current.children.find((child) =>
        path?.startsWith(child.url),
      );
      if (child) {
        setCurrent(child.key);
        return;
      }
    }

    if (current) {
      setCurrent(current.key);
    }
  }, [path]);

  return (
    <Drawer
      className="mobile-header-menu"
      placement="right"
      title={
        <div className="flex items-center md:justify-normal justify-end ">
          <Avatar
            icon={<Image alt="" fill src={AvatarRedIcon} />}
            className="me-2"
          />
          <h3 className="me-2 text-[#fff] font-semibold">Alishan </h3>
          <Dropdown
            menu={{
              items: profile_dropdown_items,
            }}>
            <ButtonComponent
              text=""
              type="default"
              iconImage={SelectedArrowDown}
              btnCustomType="outline"
            />
          </Dropdown>
        </div>
      }
      open={open}
      onClose={handleClose}>
      <Menu
        mode="inline"
        defaultSelectedKeys={["dashboard"]}
        selectedKeys={[current]}
        items={items}
        className="border-b-0 border-r-0"
        style={{ flex: 1, minWidth: 0 }}
      />
    </Drawer>
  );
};
export default DrawerMenuComponent;
