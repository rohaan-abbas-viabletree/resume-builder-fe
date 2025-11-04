"use client";
import { Col, Form, FormInstance, PaginationProps, Row, Table } from "antd";
import React, { useState } from "react";
import FormInput from "../FormInput/FormInput";
import InputText from "../InputText/InputText";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import { CrossIcon } from "@/Images";
import {
  IActionButtonsListType,
  IFilterListType,
  IFunctionMultiParams,
  IFunctionParams,
  ITableSearchInputType,
} from "@/types/common";
import SubHeadingComponent from "../SubHeadingComponent/SubHeadingComponent";
import { FIELD_TYPE } from "@/static/constants";
import SelectComponent from "../SelectComponent/SelectComponent";
import Image from "next/image";

const CustomTable = ({
  isExpandable = false,
  columns = [],
  nestedColumns = [],
  data = [],
  tableTopFilters = [],
  tableTopSearchButtons = [],
  tableHeadActionButton = [],
  tableBottomFilters = [],
  tableBottomSearchButtons = [],
  border = true,
  form,
  nestedTableTitle = "",
  total = 0,
  selectedFilters = [],
  tableFilterResetButton,
  showBottomFilters = true,
  showPagination = true,
  handlePaginationOnChange,
  handleFilterSubmit = () => {},
  handleFilterReset = () => {},
  onRowClick = () => {},
  loading = false,
  defaultPageSize = 10,
  rowSelection,
  tableClassName = "",
}: {
  defaultPageSize?: number;
  isExpandable?: boolean;
  columns?: any[];
  nestedColumns?: any[];
  data?: any[];
  tableTopFilters?: (ITableSearchInputType & {
    className?: string;
    formItemClassName?: string;
  })[];
  tableTopSearchButtons?: (IActionButtonsListType & { className?: string })[];
  tableHeadActionButton?: (IActionButtonsListType & { className?: string })[];
  tableBottomFilters?: (ITableSearchInputType & {
    className?: string;
    formItemClassName?: string;
  })[];
  tableBottomSearchButtons?: (IActionButtonsListType & {
    className?: string;
  })[];
  tableFilterResetButton?: (IActionButtonsListType & { className?: string })[];
  border?: boolean;
  form?: FormInstance;
  nestedTableTitle?: string;
  limit?: number;
  total?: number;
  selectedFilters?: IFilterListType[];
  showBottomFilters?: boolean;
  handlePaginationOnChange?:
    | ((page: number, pageSize: number) => void)
    | undefined;
  handleFilterSubmit?: IFunctionParams;
  handleFilterReset?: IFunctionParams;
  showPagination?: boolean;
  onRowClick?: IFunctionMultiParams;
  loading?: boolean;
  rowSelection?: any;
  tableClassName?: string;
}) => {
  const [toggle, setToggle] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);

  const [selectedCurrentIndex, setSelectedCurrentIndex] = React.useState<
    number | undefined
  >(undefined);

  const onChange: PaginationProps["onChange"] = (page, pageSize) => {
    setPage(page);
    setPageSize(pageSize);
    if (handlePaginationOnChange) handlePaginationOnChange(page, pageSize);
  };

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const onExpand = (expanded: any, record: any) => {
    const newExpandedRowKeys: any = expanded
      ? [...expandedRowKeys, record.key] // Add key if expanding
      : expandedRowKeys.filter((key: any) => key !== record.key); // Remove key if collapsing

    setExpandedRowKeys(newExpandedRowKeys);
  };

  return (
    <>
      <Row gutter={[8, 8]} className="mb-2 sm:mb-2 lg:mb-0">
        {tableTopFilters.map((filter, index) => (
          <Col
            {...filter.colProp}
            key={index}
            className={filter.className || ""}>
            {filter.showSelectSearch ? (
              <FormInput
                className={filter.formItemClassName}
                fieldName={filter.fieldName}
                type={filter.type}
                size={filter.size}
                onSelectSearch={filter.onSelectSearch}
                onClickSelectSearch={filter.onClickSelectSearch}
                showSelectSearch={filter.showSelectSearch}
                selectOptions={filter.selectOptions}
                handleSelectSearch={filter.onSearch}
                notFoundContent={filter.notFoundContent}
                placeholder={filter.placeholder}
                showSuffixIcon={filter.showSuffixIcon}
                selectLoading={filter.selectLoading}
                optionRender={filter.optionRender}
                {...(Object.keys(filter).includes("filterOption")
                  ? { filterOption: filter.filterOption }
                  : {})}
              />
            ) : filter.type === FIELD_TYPE.text ? (
              <FormInput
                className={filter.formItemClassName}
                fieldName={filter.fieldName}
                type={filter.type}>
                <InputText placeholder={filter.placeholder} size="large" />
              </FormInput>
            ) : filter.type === FIELD_TYPE.select ? (
              <FormInput
                className={filter.formItemClassName}
                fieldName={filter.fieldName}
                type={filter.type}>
                <SelectComponent
                  placeholder={filter.placeholder}
                  size="large"
                />
              </FormInput>
            ) : (
              <FormInput
                className={filter.formItemClassName}
                fieldName={filter.fieldName}
                type={filter.type}>
                <InputText placeholder={filter.placeholder} size="large" />
              </FormInput>
            )}
          </Col>
        ))}

        {/* 🔹 Divider between filters and buttons */}
        {tableTopSearchButtons.length > 0 && (
          <Col className="horizontal-border">
            <div className="border-l mx-2 mt-2 border-l-mainborder h-6"></div>
          </Col>
        )}

        {tableTopSearchButtons?.map((buttonProp, index) => (
          <Col
            className={`full-width ${buttonProp.className || ""}`}
            {...buttonProp.colProp}
            key={index}>
            <ButtonComponent
              className={buttonProp.className}
              size={buttonProp.size}
              onClick={() => {
                if (buttonProp?.isToggle) setToggle(!toggle);
                buttonProp?.onClick?.();
              }}
              iconImage={buttonProp.iconImage}
              text={buttonProp.text}
              type={buttonProp.type}
              block={buttonProp.block}
              btnCustomType={buttonProp.buttonType}
              htmlType={buttonProp.htmlType}
            />
          </Col>
        ))}
      </Row>
      <Form
        form={form}
        onFinish={handleFilterSubmit}
        onReset={handleFilterReset}>
        {tableBottomFilters.length > 0 && showBottomFilters && (
          <div
            className={`${
              toggle
                ? "block animate-in fade-in duration-500"
                : "hidden animate-out fade-out duration-500"
            }`}>
            <Row gutter={[8, 8]} justify={"space-between"} className="mb-4">
              <Col span={24}>
                <SubHeadingComponent text="Filters:" />
              </Col>
              <Col span={24} lg={{ span: 20 }}>
                <Row gutter={[8, 0]} justify={"start"}>
                  {tableBottomFilters?.map((filter, index) => (
                    <Col
                      span={24}
                      key={index}
                      className={filter.className || ""}
                      {...(filter.colProp
                        ? { ...filter.colProp }
                        : { md: { span: 6 }, lg: { span: 4 } })}>
                      <FormInput
                        className={filter.formItemClassName}
                        notFoundContent={filter.notFoundContent}
                        disabledDate={filter.disabledDate}
                        showSelectSearch={filter.showSelectSearch}
                        handleSelectSearch={filter.onSearch}
                        selectOptions={filter.selectOptions}
                        placeholder={filter.placeholder}
                        fieldName={filter.fieldName}
                        type={filter.type}
                        size={filter.size}
                      />
                    </Col>
                  ))}
                </Row>
              </Col>

              {tableBottomSearchButtons?.map((actionButton, index) => (
                <Col
                  span={24}
                  {...actionButton.colProp}
                  key={index}
                  className={actionButton.className || ""}>
                  <ButtonComponent
                    className={actionButton.className}
                    loading={actionButton.loading}
                    iconImage={actionButton.icon}
                    text={actionButton.text}
                    block={actionButton.block}
                    btnCustomType={actionButton.buttonType}
                    onClick={actionButton.onClick}
                    size={actionButton.size}
                    type={actionButton.type}
                    disabled={actionButton.disabled}
                    danger={actionButton.danger}
                    htmlType={actionButton.htmlType}
                  />
                </Col>
              ))}
            </Row>
          </div>
        )}
        {!showBottomFilters && selectedFilters.length > 0 && (
          <Row gutter={[8, 8]} justify={"space-between"} align={"middle"}>
            <Col span={24}>
              <SubHeadingComponent text="Filters:" />
            </Col>
            <Col span={24} md={{ span: 20 }}>
              <Row gutter={[8, 8]}>
                {selectedFilters?.map((filter, index) => (
                  <Col key={index}>
                    <div className=" px-3 py-1 border rounded-md border-mainborder relative">
                      {filter.label}
                      <Image
                        alt=""
                        onClick={filter?.onClick}
                        src={CrossIcon}
                        className="absolute cursor-pointer -right-1 -top-1"
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>

            {tableFilterResetButton?.map((actionButton, index) => (
              <Col
                span={24}
                {...actionButton.colProp}
                key={index}
                className={actionButton.className || ""}>
                <ButtonComponent
                  // className={actionButton.className}
                  loading={actionButton.loading}
                  iconImage={actionButton.icon}
                  text={actionButton.text}
                  block={actionButton.block}
                  btnCustomType={actionButton.buttonType}
                  onClick={actionButton.onClick}
                  size={actionButton.size}
                  type={actionButton.type}
                  danger={actionButton.danger}
                  htmlType={actionButton.htmlType}
                  className="mb-6"
                />
              </Col>
            ))}
          </Row>
        )}
      </Form>
      <Row gutter={[8, 8]} className="sm:mb-2 lg:mb-0" justify={"end"}>
        {tableHeadActionButton?.map((buttonProp, index) => (
          <Col
            className={`full-width ${buttonProp.className || ""}`}
            {...buttonProp.colProp}
            key={index}>
            <ButtonComponent
              className={buttonProp.className}
              size={buttonProp.size}
              onClick={() => {
                if (buttonProp?.isToggle) {
                  setToggle(!toggle);
                }
                if (buttonProp?.onClick) {
                  buttonProp.onClick();
                }
              }}
              iconImage={buttonProp.iconImage}
              text={buttonProp.text}
              type={buttonProp.type}
              block={buttonProp.block}
              btnCustomType={buttonProp.buttonType}
              htmlType={buttonProp.htmlType}
            />
          </Col>
        ))}
      </Row>
      <Table
        loading={loading}
        {...(rowSelection ? { rowSelection } : {})}
        className={`ant-design-table mt-4 ${
          border ? "" : "ant-design-table-without-border"
        } ${tableClassName}`}
        columns={columns}
        onRow={(row: any, index: number | undefined) => ({
          className:
            !isNaN(Number(selectedCurrentIndex)) &&
            selectedCurrentIndex === index
              ? ""
              : "",
          onClick: () => {
            setSelectedCurrentIndex(index);
            onRowClick(row, index);
          },
        })}
        {...(isExpandable
          ? {
              expandable: {
                expandedRowKeys: expandedRowKeys,
                onExpand: onExpand,
                expandedRowRender: (val: { data: any[] }) => (
                  <NestedTable
                    title={nestedTableTitle}
                    data={val?.data ?? []}
                    columns={nestedColumns}
                  />
                ),
              },
            }
          : {})}
        dataSource={data}
        pagination={
          showPagination
            ? {
                pageSize: pageSize,
                current: page,
                onChange: onChange,
                total: total ?? data.length,
                showSizeChanger: true,
                className: "flex justify-center",
              }
            : false
        }
        scroll={{ x: "max-content" }}
      />
    </>
  );
};

const NestedTable = ({
  title = "",
  data,
  columns,
}: {
  title: string;
  data: any[];
  columns: any[];
}) => {
  return (
    <div className="px-0 md:px-6">
      {title && (
        <h2 className="p-[16px] pl-1 font-medium text-[18px]">{title}</h2>
      )}
      <Table
        size="small"
        columns={columns}
        className="ant-design-table-small bg-[#fafafa]"
        dataSource={data}
        pagination={false}
      />
    </div>
  );
};

export default CustomTable;
