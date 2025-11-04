import React from "react";
import CustomBorderTable from "../CustomBorderTable/CustomBorderTable";
import { useVesselListQuery } from "@/graphql/vessel/vessel.generated";

const ShippingTable = ({ shippingData }: { shippingData: any }) => {
  const { data: vesselData } = useVesselListQuery({
    pagination: { pageSize: 1000000 },
  });

  const vesselOptions =
    vesselData?.vessels_connection?.nodes?.map((v) => ({
      label: v?.vessel_name || "-",
      value: v?.documentId,
    })) ?? [];

  const ShippingColumns = [
    {
      title: "Shipping Line",
      dataIndex: "shipping_line",
      key: "shipping_line",
    },
    {
      title: "Container No",
      dataIndex: "container_no",
      key: "container_no",
    },
    {
      title: "Vessel Name",
      dataIndex: "vessel",
      key: "vessel",
      render: (_: any, record: any) => {
        // Prefer the vessel name from nested data if available
        const vesselName = record?.vessel?.vessel_name;
        if (vesselName) return vesselName;

        // Otherwise find it from options
        const vessel = vesselOptions.find(
          (opt) => opt.value === record?.vessel,
        );
        return vessel?.label || "-";
      },
    },
    {
      title: "POL",
      dataIndex: "port_from",
      key: "port_from",
    },
    {
      title: "POD",
      dataIndex: "port_to",
      key: "port_to",
    },
    {
      title: "Safe To Load",
      dataIndex: "safe_to_load",
      key: "safe_to_load",
    },
    {
      title: "Cutoff",
      dataIndex: "vessel_cutoff",
      key: "vessel_cutoff",
    },
    {
      title: "ETD POL",
      dataIndex: "etd_pol",
      dataInkey: "etd_pol",
    },
    {
      title: "ETA POD",
      dataIndex: "eta_pod",
      dataInkey: "eta_pod",
    },
  ];

  return (
    <>
      <div className="border-l border-r border-t border-mainborder p-4">
        <p className="text-color_purple mb-0">Shipping Details</p>
      </div>
      <CustomBorderTable
        data={shippingData}
        border
        columns={ShippingColumns}
        showPagination={false}
      />
    </>
  );
};

export default ShippingTable;
