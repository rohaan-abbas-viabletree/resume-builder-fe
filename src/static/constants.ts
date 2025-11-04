import { SelectedArrowDown } from "@/Images";
import { IFieldType } from "@/types/common";

export const USER_KEY = "RPL_USER" as const;
export const HEADER_MENUS = [
  {
    label: "Dashboard",
    key: "dashboard",
    url: "/",
  },
  {
    label: "Order",
    key: "order",
    url: "/order",
  },
  {
    label: "Transportation",
    key: "transportation",
    url: "/transport",
  },
  {
    label: "Documentation",
    key: "documentation",
    url: "/document",
  },
  {
    label: "Setups",
    key: "SubMenu",
    icon: SelectedArrowDown,
    url: "",
    children: [
      { label: "Product", key: "setting:1", url: "/product" },
      { label: "Container", key: "setting:2", url: "/container" },
      { label: "Supplier", key: "setting:3", url: "/supplier" },
      { label: "Shipping", key: "setting:4", url: "/shipping" },
      { label: "Port", key: "setting:5", url: "/port" },
      { label: "Customer", key: "setting:6", url: "/customer" },
      { label: "Driver", key: "setting:7", url: "/driver" },
      { label: "Vehicle", key: "setting:8", url: "/vehicle" },
      { label: "Trailer", key: "setting:9", url: "/trailer" },
      { label: "Package Type", key: "setting:10", url: "/package-type" },
      { label: "Currency", key: "setting:11", url: "/currency" },
      { label: "Vessel", key: "setting:12", url: "/vessel" },
    ],
  },
  {
    label: "Reports",
    key: "reports",
    icon: SelectedArrowDown,
    url: "",
    children: [
      {
        label: "Order Reports",
        key: "setting:13",
        url: "/reports/order",
      },
      {
        label: "Transportation Reports",
        key: "setting:14",
        url: "/reports/transportation",
      },
      {
        label: "Documentaion Reports",
        key: "setting:15",
        url: "/reports/documentations",
      },
    ],
  },
];
export const IMAGE_FORMATS = ["image/png", "image/jpeg", "png", "jpeg", "jpg"];
export const PDF_FORMATS = ["application/pdf", "pdf"];
export const BL_FORMATS = ["png", "jpeg", "pdf"];

export const REQUIRED_MSG = "Field is required";
export const REQUIRED_MSG_NUMBER_FIELD = "Number field is required";

export const MAXVAL = 1.7976931348623157e308;

export const MonthTHFormat = "Do MMMM";
export const DATE_Y_M_D = "YYYY-MM-DD";
export const DATE_TIME_Y_M_D_HH_MM = "YYYY-MM-DD HH:mm";

export const FIELD_TYPE: IFieldType = {
  select: "select",
  selectSearch: "selectSearch",
  date: "date",
  dateRange: "dateRange",
  text: "text",
  number: "number",
  check: "check",
  radioButton: "radioButton",
  checkGroup: "checkGroup",
  upload: "upload",
  textArea: "textArea",
  phone: "phone",
  switch: "switch",
  password: "password",
  radioButtonGroup: "radioButtonGroup",
  uploadragger: "uploadragger",
  textSearch: "textSearch",
  selectCreatable: "selectCreatable",
};
