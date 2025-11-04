import { ColProps, DatePickerProps, Form, GetRef, TableProps } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";
import { DefaultOptionType } from "antd/es/select";
import { ReactNode } from "react";
import {
  ComponentCommonComponentMultiValueField,
  Invoice,
} from "@/app/client-types";
import { IOrderType, TransportFields } from "./order";

export type IFieldType = {
  select: string;
  selectSearch: string;
  date: string;
  text: string;
  number: string;
  check: string;
  dateRange: string;
  phone: string;
  switch: string;
  upload: string;
  uploadragger: string;
  radioButton: string;
  radioButtonGroup: string;
  checkGroup: string;
  textArea: string;
  password: string;
  textSearch: string;
  selectCreatable: string;
};

export type IFunctionType = () => void;
export type IFunctionParams = (value: any) => void;
export type ISelectOptionType = {
  label: string;
  value: string | boolean | number;
};

export type ITableSearchInputType = {
  type: string;
  fieldName: string;
  placeholder?: any;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  selectOptions?: DefaultOptionType[] | [];
  selectLoading?: boolean;
  allowClear?: boolean;
  disabledDate?: DatePickerProps["disabledDate"];
  colProp?: ColProps;
  showSelectSearch?: boolean;
  showSuffixIcon?: boolean;
  selectMode?: "multiple" | "tags";
  onSelectSearch?: IFunctionParams;
  onSearch?: IFunctionParams;
  onClickSelectSearch?: IFunctionType;
  optionRender?: ((item: any) => ReactNode) | undefined;
  notFoundContent?: ReactNode;
  onChange?: IFunctionParams;
  filterOption?: boolean;
  onClick?: IFunctionParams;
  size?: SizeType;
  formItemClassName?: string;
};

export type IActionButtonsListType = {
  text: string;
  icon?: React.ReactNode;
  iconImage?: any;
  danger?: boolean;
  htmlType?: "button" | "submit" | "reset";
  type?: "default" | "link" | "primary" | "text";
  size?: SizeType;
  block?: boolean;
  colProp?: ColProps;
  buttonType?: "outline" | "";
  onClick?: IFunctionType;
  isToggle?: boolean;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
};

export type IFilterListType = {
  label: string;
  name: string;
  value?: string;
  onClick?: IFunctionParams;
};

export interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  inputProps?: {
    selectOptions?: DefaultOptionType[];
    placeholder?: any;
    fieldName: string;
    type: string;
    size?: SizeType;
    showSearch?: boolean;
  };
  dataIndex: keyof IOrderType;
  record: IOrderType;
  handleSave: (record: IOrderType) => void;
}

export interface EditableCellContainerProps {
  title: React.ReactNode;
  editable: boolean;
  inputProps?: {
    selectDropDownEndButtonOption?: boolean;
    handleDropdownEndButtonPress?: () => void;
    selectOptions?: DefaultOptionType[];
    placeholder?: any;
    fieldName: string;
    type: string;
    size?: SizeType;
    showSearch?: boolean;
    selectLoading?: any;
    handleAdd?: (val: string) => void;
  };
  dataIndex: keyof TransportFields;
  record: TransportFields;
  handleSave: (record: TransportFields) => void;
  selectCreatable?: boolean;
}
export type ColumnTypes = Exclude<TableProps<any>["columns"], undefined>;

export interface EditableRowProps {
  index: number;
}

export type FormInstanceType<T> = GetRef<typeof Form<T>>;

export type IFunctionMultiParams = (...rest: any) => void;

export type ExtendedInvoice = Invoice & {
  bl_no: string;
  bl_document_id?: string;
  reference_no: string | null | undefined;
  ed_no: ComponentCommonComponentMultiValueField[];
  doc_type?: string;
};

export type IDefaultCardFileType = {
  name: string;
  status: string;
  uid: string | number;
  url: string;
  type: string;
};

export interface ISaveType {
  SAVE: "SAVE";
  SAVE_CLOSE: "SAVE_CLOSE";
  SAVE_ADD_NEW: "SAVE_ADD_NEW";
  CLOSE: "CLOSE";
}
export type VesselTabKey = "upcoming" | "departed";
