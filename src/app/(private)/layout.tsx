"use client";
import { ConfigProvider, Layout } from "antd";
import { Poppins } from "next/font/google";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const { Content } = Layout;

const poppins_init = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["400", "500", "600"],
});

const PrivateLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigProvider
      // getPopupContainer={(trigger) => trigger?.parentElement || document.body}
      theme={{
        token: {
          colorPrimary: "#677DEC",
          colorLink: "#fff",
          colorLinkHover: "#fff",
          colorBgLayout: "#fff",
          fontFamily: poppins_init.style.fontFamily,
        },
        components: {
          Layout: {
            headerBg: "#fff",
          },
          Input: {
            colorBorder: "#C7C9CA",
            colorBgContainer: "transparent",
            activeBorderColor: "#C7C9CA",
            hoverBorderColor: "#C7C9CA",
          },
          InputNumber: {
            colorBorder: "#C7C9CA",
            colorBgContainer: "transparent",
            activeBorderColor: "#C7C9CA",
            hoverBorderColor: "#C7C9CA",
          },
          DatePicker: {
            colorBorder: "#C7C9CA",
            activeBorderColor: "#C7C9CA",
            colorBgContainer: "transparent",
            hoverBorderColor: "#C7C9CA",
            colorPrimary: "#D03135",
            colorPrimaryHover: "#D031351A ",
            controlItemBgActive: "#D031351A",
            controlItemBgHover: "#D031351A",
          },
          Radio: {
            buttonBg: "#F4F9FD",
            colorText: "#677DEC",
            colorBorder: "#677DEC",
          },
          Select: {
            colorBorder: "#C7C9CA",
            activeBorderColor: "#C7C9CA",
            colorBgContainer: "transparent",
            hoverBorderColor: "#C7C9CA",
            colorPrimaryHover: "#000", // 👈 hover color for option
            colorPrimaryActive: "#000", //
          },

          Button: { defaultBorderColor: "#C7C9CA" },
          Menu: {
            activeBarHeight: 4,
            colorText: "#707EAE",
          },
          Table: {
            rowHoverBg: "#D031351A", // prominent hover globally
          },
        },
      }}>
      <Layout className="">
        <Content className="">
          <div className="p-6 min-h-10 rounded-lg">{children}</div>
        </Content>{" "}
      </Layout>
    </ConfigProvider>
  );
};
export default PrivateLayout;
