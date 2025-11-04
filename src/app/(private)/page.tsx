"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Col, Form, Row, Space, TableProps } from "antd";
import dayjs from "dayjs";

import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import CustomTable from "@/components/CustomTable/CustomTable";
import FormInput from "@/components/FormInput/FormInput";
import { FIELD_TYPE } from "@/static/constants";
import { EditIcon } from "@/Images";
import { useGetResumesConnectionQuery } from "@/graphql/resume/resume.generated";

// ✅ Import your GraphQL hook

type ResumeRow = {
  documentId: string;
  name: string;
};

export default function ResumeManagementListing() {
  // 📌 State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const router = useRouter();
  const [form] = Form.useForm();

  // ✅ Filters dynamically (search by `name`)
  const filters = search.trim()
    ? {
        name: { containsi: search.trim() },
      }
    : {};

  // ✅ Call GraphQL API
  const { data, isLoading } = useGetResumesConnectionQuery({
    pagination: { page, pageSize },
    sort: ["name:asc"],
    filters,
  });

  // ✅ Format table data
  const tableData = useMemo(() => {
    const rows: ResumeRow[] =
      data?.resumes_connection?.nodes?.map((r: any) => ({
        documentId: r?.documentId as string,
        name: r?.name || "-",
      })) || [];

    return {
      data: rows,
      total: data?.resumes_connection?.pageInfo?.total || 0,
    };
  }, [data]);

  // ✅ Row click handler
  const onRowClick = (row: ResumeRow) => {
    router.push(`/resume/${row.documentId}`);
  };

  // ✅ Table columns
  const columns: TableProps<ResumeRow>["columns"] = [
    {
      title: "Resume Name",
      dataIndex: "name",
      key: "name",
      render: (val, record) => (
        <p className="cursor-pointer" onClick={() => onRowClick(record)}>
          {val}
        </p>
      ),
    },
    {
      title: "Action",
      dataIndex: "documentId",
      key: "actions",
      align: "center",
      render: (documentId: string) => (
        <Space>
          <ButtonComponent
            text="Edit"
            iconImage={EditIcon}
            type="default"
            btnCustomType="inner-primary"
            onClick={() => router.push(`/resume/${documentId}`)}
          />
        </Space>
      ),
    },
  ];

  // ✅ Search handler
  const handleFilterSubmit = (v: { search: string }) => {
    setSearch(v.search?.trim() || "");
    setPage(1);
  };

  return (
    <>
      <h1 className="text-color_dark_purple text-2xl font-bold mb-4">
        Resume Management
      </h1>

      {/* 🔍 Search + Add Button */}
      <Row gutter={[8, 8]}>
        <Col flex="auto">
          <Form form={form} onFinish={handleFilterSubmit}>
            <FormInput
              fieldName="search"
              type={FIELD_TYPE.textSearch}
              placeholder="Search by Name"
              size="large"
              onChange={(e) => handleFilterSubmit({ search: e.target.value })}
            />
          </Form>
        </Col>

        <Col className="hidden lg:block">
          <div className="border-l mx-2 mt-2 border-l-mainborder h-6" />
        </Col>

        <Col span={24} lg={{ span: 4 }}>
          <ButtonComponent
            text="Add Resume"
            size="large"
            block
            type="default"
            btnCustomType="outline"
            onClick={() => router.push("/resume/create")}
          />
        </Col>
      </Row>

      {/* 📋 Table */}
      <CustomTable
        data={tableData.data}
        total={tableData.total}
        columns={columns}
        loading={isLoading}
        handlePaginationOnChange={(p, size) => {
          setPage(p);
          setPageSize(size);
        }}
        onRowClick={(record) => onRowClick(record)}
      />
    </>
  );
}
