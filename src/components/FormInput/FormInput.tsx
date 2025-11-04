"use client";
import { DATE_Y_M_D, FIELD_TYPE } from "@/static/constants";
import FormItem from "antd/es/form/FormItem";
import { SizeType } from "antd/es/config-provider/SizeContext";
import InputText from "../InputText/InputText";
import SelectComponent from "../SelectComponent/SelectComponent";
import InputNumberComponent from "../InputNumber/InputNumber";
import RangePickerInput from "../RangePickerInput/RangePickerInput";
import { DatePickerProps } from "antd/es/date-picker";

import { DefaultOptionType } from "antd/es/select";
import {
  DatePicker,
  Space,
  CheckboxOptionType,
  FormItemProps,
  Form,
  Checkbox,
  Input,
  Divider,
} from "antd";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import { SearchIcon } from "@/Images";
import {
  IFunctionMultiParams,
  IFunctionParams,
  IFunctionType,
} from "@/types/common";
import RadioGroupButton from "../RadioGroupButton/RadioGroupButton";
import UploadDragger from "../UploadDragger/UploadDragger";
import { UploadListType } from "antd/es/upload/interface";
import React, { ReactNode } from "react";
import dayjs from "dayjs";
import PhoneInputComponent from "../PhoneNumberInput/PhoneNumberInput";
import { PlusOutlined } from "@ant-design/icons";

const FormInput = React.memo(function FormInput({
  fieldName,
  type = FIELD_TYPE.text,
  rules = [],
  children,
  size = "middle",
  placeholder,
  selectOptions = [],
  showSelectSearch = false,
  showSuffixIcon = true,
  mode,
  hideDropdownSelect = false,
  onPressEnter = () => {},
  onBlur = () => {},
  onSelectSearch = () => {},
  ref,
  disabled = false,
  radioOptions = [],
  uploadListType,
  showUploadList,
  className = "",
  textAreaRows = 4,
  handleSelectSearch = () => {},
  filterOption = true,
  selectLoading = false,
  notFoundContent,
  addonBefore,
  addonAfter,
  optionRender,
  onClickSelectSearch = () => {},
  onChange = () => {},
  allowClear = false,
  disabledDate = (current) => {
    return dayjs(current).isBefore(dayjs().format(DATE_Y_M_D));
  },
  searchValue,
  showTime = false,
  handleAdd,
  selectDropDownEndButtonOption = false,
  handleDropdownEndButtonPress = () => {},
  selectDropDownEndButtonText = "Add new",
}: {
  showTime?: boolean;
  allowClear?: boolean;
  fieldName: FormItemProps["name"];
  rules?: any[];
  type: string;
  children?: React.ReactNode;
  size?: SizeType;
  placeholder?: any;
  selectOptions?: DefaultOptionType[];
  radioOptions?: CheckboxOptionType[];
  showSelectSearch?: boolean;
  showSuffixIcon?: boolean;
  hideDropdownSelect?: boolean;
  mode?: "multiple" | "tags";
  onPressEnter?: IFunctionType;
  onBlur?: IFunctionMultiParams;
  ref?: any;
  disabled?: boolean;
  uploadListType?: UploadListType;
  showUploadList?: boolean;
  className?: string;
  textAreaRows?: number;
  onSelectSearch?: IFunctionParams;
  handleSelectSearch?: IFunctionMultiParams;
  onChange?: IFunctionMultiParams;
  filterOption?: boolean;
  selectLoading?: boolean;
  notFoundContent?: React.ReactNode;
  addonBefore?: React.ReactNode | string;
  addonAfter?: React.ReactNode | string;
  optionRender?: ((item: any) => ReactNode) | undefined;
  onClickSelectSearch?: IFunctionType;
  disabledDate?: DatePickerProps["disabledDate"];
  searchValue?: string;
  handleAdd?: (val: string) => void;

  selectDropDownEndButtonOption?: boolean;
  selectDropDownEndButtonText?: string;
  handleDropdownEndButtonPress?: () => void;
}) {
  const [newValue, setNewValue] = React.useState<string>("");
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }

    return e.fileList;
  };

  return (
    <>
      {FIELD_TYPE.upload === type && children ? (
        <FormItem
          className={className}
          name={fieldName}
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={rules}>
          {children}
        </FormItem>
      ) : children ? (
        <FormItem className={className} name={fieldName} rules={rules}>
          {children}
        </FormItem>
      ) : FIELD_TYPE.textArea == type ? (
        <FormItem className={className} name={fieldName} rules={rules}>
          <Input.TextArea
            placeholder={placeholder}
            disabled={disabled}
            rows={textAreaRows}
            className="resize-none"
          />
        </FormItem>
      ) : FIELD_TYPE.select == type ? (
        <FormItem className={className} name={fieldName} rules={rules}>
          <SelectComponent
            allowClear={allowClear}
            onChange={onChange}
            notFoundContent={notFoundContent}
            loading={selectLoading}
            onSearch={handleSelectSearch}
            searchValue={searchValue}
            disabled={disabled}
            ref={ref}
            onBlur={onBlur}
            onSelect={(value) => {
              onPressEnter();
              onSelectSearch(value);
            }}
            dropdownStyle={hideDropdownSelect ? { display: "none" } : {}}
            maxTagCount="responsive"
            {...(mode ? { mode: mode } : {})}
            options={selectOptions}
            size={size}
            {...(!showSuffixIcon ? { suffixIcon: showSuffixIcon } : {})}
            showSearch={showSelectSearch}
            placeholder={placeholder}
            filterOption={
              filterOption
                ? (input, option: any) =>
                    (option?.label?.toLowerCase() ?? "").includes(
                      input?.toLowerCase(),
                    )
                : false
            }
            dropdownRender={(menu) => (
              <>
                {menu}
                {selectDropDownEndButtonOption && (
                  <div>
                    <ButtonComponent
                      text={selectDropDownEndButtonText}
                      block
                      onClick={() => {
                        handleDropdownEndButtonPress();
                      }}
                    />
                  </div>
                )}
              </>
            )}
            {...(optionRender && { optionRender: optionRender })}
          />
        </FormItem>
      ) : FIELD_TYPE.textSearch == type ? (
        <FormItem className={className} name={fieldName} rules={rules}>
          <Space.Compact className="w-full">
            <InputText
              onChange={onChange}
              disabled={disabled}
              size={size}
              placeholder={placeholder}
            />
            <ButtonComponent
              text=""
              type="default"
              size={size}
              iconImage={SearchIcon}
              htmlType="submit"
            />
          </Space.Compact>
        </FormItem>
      ) : FIELD_TYPE.selectSearch == type ? (
        <FormItem className={className} name={fieldName} rules={rules}>
          <Space.Compact className="w-full">
            <SelectComponent
              allowClear={allowClear}
              notFoundContent={notFoundContent}
              loading={selectLoading}
              onSearch={handleSelectSearch}
              disabled={disabled}
              ref={ref}
              onBlur={onBlur}
              onSelect={(value) => {
                onPressEnter();
                onSelectSearch(value);
              }}
              dropdownStyle={hideDropdownSelect ? { display: "none" } : {}}
              maxTagCount="responsive"
              {...(mode ? { mode: mode } : {})}
              options={selectOptions}
              size={size}
              {...(!showSuffixIcon ? { suffixIcon: showSuffixIcon } : {})}
              showSearch={showSelectSearch}
              placeholder={placeholder}
              filterOption={
                filterOption
                  ? (input, option: any) =>
                      (option?.label?.toLowerCase() ?? "").includes(
                        input?.toLowerCase(),
                      )
                  : false
              }
              {...(optionRender && { optionRender: optionRender })}
            />
            <ButtonComponent
              text=""
              onClick={onClickSelectSearch}
              type="default"
              size={size}
              iconImage={SearchIcon}
              htmlType="submit"
            />
          </Space.Compact>
        </FormItem>
      ) : FIELD_TYPE.text == type ? (
        <FormItem className={className} name={fieldName} rules={rules}>
          <InputText
            disabled={disabled}
            ref={ref}
            onChange={onChange}
            onPressEnter={onPressEnter}
            onBlur={onBlur}
            size={size}
            placeholder={placeholder}
            addonAfter={addonAfter}
          />
        </FormItem>
      ) : FIELD_TYPE.number == type ? (
        <FormItem className={className} name={fieldName} rules={rules}>
          <InputNumberComponent
            onChange={onChange}
            disabled={disabled}
            ref={ref}
            onPressEnter={onPressEnter}
            onBlur={onBlur}
            size={size}
            placeholder={placeholder}
            addonBefore={addonBefore}
            className={className}
            addonAfter={addonAfter}
          />
        </FormItem>
      ) : FIELD_TYPE.dateRange == type ? (
        <FormItem className={className} name={fieldName} rules={rules}>
          <RangePickerInput
            // disabledDate={disabledDate}
            disabled={disabled}
            format="DD-MM-YYYY"
            placeholder={placeholder}
            size={size}
          />
        </FormItem>
      ) : FIELD_TYPE.date == type ? (
        <FormItem className={className} name={fieldName} rules={rules}>
          <DatePicker
            showTime={showTime}
            onChange={() => {
              onPressEnter();
            }}
            // disabledDate={disabledDate}
            disabled={disabled}
            className={
              "w-full " +
              `${
                disabled
                  ? "bg-bg_input_disable_color text-black border-border_input_disabled placeholder:text-black datePickerPlaceholder"
                  : ""
              }`
            }
            format={showTime ? "DD-MM-YYYY hh:mm a" : "DD-MM-YYYY"}
            placeholder={placeholder}
            size={size}
          />
        </FormItem>
      ) : FIELD_TYPE.radioButtonGroup == type ? (
        <FormItem className={className} name={fieldName} rules={rules}>
          <RadioGroupButton
            disabled={disabled}
            size={size}
            options={radioOptions}
          />
        </FormItem>
      ) : FIELD_TYPE.upload == type ? (
        <FormItem
          className={className}
          name={fieldName}
          rules={rules}
          valuePropName="fileList"
          getValueFromEvent={normFile}>
          <UploadDragger
            showUploadList={showUploadList}
            listType={uploadListType}
            placeholder={placeholder}
          />
        </FormItem>
      ) : FIELD_TYPE.check == type ? (
        <Form.Item
          valuePropName="checked"
          className={className}
          name={fieldName}
          rules={rules}>
          <Checkbox onChange={onChange} disabled={disabled}>
            {placeholder}
          </Checkbox>
        </Form.Item>
      ) : FIELD_TYPE.phone == type ? (
        <FormItem className={className} name={fieldName} rules={rules}>
          <PhoneInputComponent />
        </FormItem>
      ) : FIELD_TYPE.selectCreatable == type ? (
        <FormItem className={className} name={fieldName} rules={rules}>
          <SelectComponent
            // value={fieldName}
            optionFilterProp="label"
            onSelect={(value) => {
              onPressEnter();
              onSelectSearch(value);
            }}
            onBlur={onBlur}
            allowClear={allowClear}
            onChange={onChange}
            notFoundContent={notFoundContent}
            loading={selectLoading}
            options={selectOptions}
            size={size}
            showSearch
            placeholder={placeholder}
            filterOption={(input, option: any) =>
              (option?.label?.toLowerCase() ?? "").includes(
                input?.toLowerCase(),
              )
            }
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: "8px 0" }} />
                <Space style={{ padding: "0 8px 4px" }}>
                  <Input
                    placeholder="Add new"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onPressEnter={() => {
                      handleAdd?.(newValue);
                      setNewValue("");
                    }}
                  />
                  <a
                    onClick={() => {
                      handleAdd?.(newValue);
                      setNewValue("");
                    }}>
                    <PlusOutlined />
                  </a>
                </Space>
              </>
            )}
          />
        </FormItem>
      ) : (
        <FormItem className={className} name={fieldName} rules={rules}>
          {children}
        </FormItem>
      )}
    </>
  );
});

export default FormInput;
