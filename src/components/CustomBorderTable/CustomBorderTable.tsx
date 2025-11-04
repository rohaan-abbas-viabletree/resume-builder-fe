"use client";
import { IFunctionMultiParams } from "@/types/common";
import { PaginationProps, Table } from "antd";
import React, { useState } from "react";

const CustomBorderTable = ({
  border = false,
  columns = [],
  data = [],
  handlePaginationOnChange = () => {},
  total = 0,
  limit = 5,
  tableComponents,
  showPagination = true,
  className = "",
  onRowClick = () => {},
}: {
  border?: boolean;
  columns?: any[];
  data?: any[];
  handlePaginationOnChange?:
    | ((page: number, pageSize: number) => void)
    | undefined;
  limit?: number;
  total?: number;
  tableComponents?: any;
  showPagination?: boolean;
  className?: string;
  onRowClick?: IFunctionMultiParams;
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(limit); // 👈 new state
  const [selectedCurrentIndex, setSelectedCurrentIndex] = useState<
    number | undefined
  >(undefined);

  const onChange: PaginationProps["onChange"] = (page, newPageSize) => {
    setPage(page);
    setPageSize(newPageSize); // 👈 update pageSize also
    if (handlePaginationOnChange) handlePaginationOnChange(page, newPageSize);
  };

  return (
    <Table
      components={tableComponents}
      bordered={border}
      className={
        "bordered-table " + (border ? "bordered-custom-table " : "") + className
      }
      columns={columns}
      onRow={(row: any, index: number | undefined) => {
        return {
          className:
            !isNaN(Number(selectedCurrentIndex)) &&
            selectedCurrentIndex === index
              ? ""
              : "",
          onClick: () => {
            setSelectedCurrentIndex(index);
            onRowClick(row, index);
          },
        };
      }}
      dataSource={data}
      pagination={
        showPagination
          ? {
              pageSize: pageSize, // 👈 controlled pageSize
              current: page,
              onChange: onChange,
              total: total ?? data.length,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20, 50, 100], // 👈 added 5 + AntD defaults
              onShowSizeChange: (current, size) => {
                setPage(1); // 👈 reset page on size change
                setPageSize(size);
                handlePaginationOnChange?.(1, size);
              },
              className: "flex justify-center",
            }
          : false
      }
      scroll={{ x: "max-content" }}
    />
  );
};

export default CustomBorderTable;
