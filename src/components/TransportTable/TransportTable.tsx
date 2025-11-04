import React, { useContext, useEffect, useRef, useState } from "react";
import CustomBorderTable from "../CustomBorderTable/CustomBorderTable";
import { Checkbox, Col, Form, InputRef, Row } from "antd";
import {
  ColumnTypes,
  EditableCellContainerProps,
  EditableRowProps,
  FormInstanceType,
} from "@/types/common";
import FormInput from "../FormInput/FormInput";
import { DATE_Y_M_D, FIELD_TYPE } from "@/static/constants";
import { SelectOption, TransportFields } from "@/types/order";
import { Container, ContainerInput, Invoice } from "@/app/client-types";
import { useVehicleListQuery } from "@/graphql/vehicle/vehicle.generated";
import dayjs from "dayjs";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import { useUpdateContainerMutation } from "@/graphql/container/container.mutation.generated";
import { openNotification } from "@/lib/utils/utils";
import useUnsavedChanges from "@/lib/hooks/useUnsavedChanges";
import {
  useCreateTransportLocationMutation,
  useTransportLocationListQuery,
} from "@/graphql/transportLocation/transportLocation.generated";
import { useQueryClient } from "react-query";
import { useGetDocumentManagementByIdQuery } from "@/graphql/transport/transport.generated";
import { useParams } from "next/navigation";
import AddEditModal from "../AddEditModal/AddEditModal";
import AddEditVehicle from "../AddEditVehicle/AddEditVehicle";
import { useVesselListQuery } from "@/graphql/vessel/vessel.generated";

const EditableContext = React.createContext<FormInstanceType<any> | null>(null);

// eslint-disable-next-line @typescript-eslint/no-unused-vars

const TransportTable = ({
  containersData,
  onSelectionChange,
}: {
  containersData: Invoice[] | undefined;
  onSelectionChange: (selectedIds: string[]) => void;
}) => {
  const [dataSource, setDataSource] = useState<TransportFields[]>([]);

  const [transportLocationOptions, setTransportLocationOptions] = useState<
    SelectOption[]
  >([]);
  const [modalStates, setModalStates] = useState<"idle" | "vehicle">("idle");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // consts
  const queryClient = useQueryClient();
  const params: { id: string } = useParams();

  const { formValuesChange, setFormValueChange } = useUnsavedChanges();
  const { data: list, refetch } = useVehicleListQuery({
    pagination: { limit: 1 },
  });

  const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();

    return (
      <Form
        form={form}
        component={false}
        onValuesChange={() => !formValuesChange && setFormValueChange(true)}>
        <EditableContext.Provider value={form}>
          <tr data-row-index={index} {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };
  const { data: vehicleList, refetch: refetchVehicles } = useVehicleListQuery(
    {
      pagination: { pageSize: list?.vehicles_connection?.pageInfo?.total },
    },
    { enabled: list?.vehicles_connection ? true : false },
  );

  // const { data: portListData } = usePortListQuery({
  //   pagination: { pageSize: 100 },
  // });
  const { data: transportLocationData } = useTransportLocationListQuery({
    pagination: { pageSize: 100 },
  });

  const { mutateAsync: createTransportLocation } =
    useCreateTransportLocationMutation();

  useEffect(() => {
    if (transportLocationData?.transportLocations_connection?.nodes) {
      const mapped =
        transportLocationData.transportLocations_connection.nodes.map(
          (loc) => ({
            label: loc.location ?? "",
            value: loc.documentId,
          }),
        );
      setTransportLocationOptions(mapped);
    }
  }, [transportLocationData]);
  // const portOptions =
  //   portListData?.ports_connection?.nodes?.map((port) => ({
  //     label: port.name + ", " + port.country,
  //     value: port.documentId,
  //   })) ?? [];
  const { mutateAsync: updateContainerRequest, isLoading } =
    useUpdateContainerMutation();

  const vehicleOptions = vehicleList?.vehicles_connection?.nodes?.map(
    (vehicle) => {
      return {
        label: vehicle?.vehicle_no,
        value: vehicle?.documentId,
      };
    },
  );

  const { data: vesselData } = useVesselListQuery({
    pagination: { pageSize: 1000000 },
  });

  const vesselOptions =
    vesselData?.vessels_connection?.nodes?.map((v) => ({
      label: v?.vessel_name || "-",
      value: v?.documentId,
    })) ?? [];

  const handleAddTransportLocation = async (val: string) => {
    if (!val) return null;

    try {
      const res = await createTransportLocation({ data: { location: val } });

      const newOption: SelectOption = {
        label: res.createTransportLocation?.location ?? val,
        value: res.createTransportLocation?.documentId ?? "",
      };

      setTransportLocationOptions((prev) => [...prev, newOption]);
      return newOption;
    } catch (err) {
      console.error("Failed to add location:", err);
      return null;
    }
  };

  const handleCloseModalStates = (type: "idle" | "vehicle" = "idle") => {
    setModalStates(type);
  };

  const handleCheckboxChange = (checked: boolean, recordId: string) => {
    const updated = checked
      ? [...selectedIds, recordId]
      : selectedIds.filter((id) => id !== recordId);

    setSelectedIds(updated);
    onSelectionChange?.(updated);
  };

  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean;
    dataIndex: string;
    inputProps?: EditableCellContainerProps["inputProps"];
  })[] = [
    {
      title: "Select",
      dataIndex: "select",
      width: "60px",
      render: (_: any, record: any) => (
        <Checkbox
          checked={selectedIds.includes(record.documentId)}
          onChange={(e) =>
            handleCheckboxChange(e.target.checked, record.documentId)
          }
        />
      ),
    },
    {
      title: "Order No",
      className: "max-w-150px min-w-150px w-[150px]",
      dataIndex: "order_no",
      render: (list: string[]) => <>{list.join(", ")}</>,
    },
    {
      title: "Invoice No",
      className: "max-w-150px min-w-150px w-[150px]",
      dataIndex: "invoice_no",
    },
    {
      title: "BL No",
      className: "max-w-150px min-w-150px w-[150px]",
      dataIndex: "bl_no",
    },
    {
      title: "Container No",
      dataIndex: "container_no",
      className: "max-w-150px min-w-150px w-[150px]",
      width: "200px",
    },
    {
      title: "Seal No",
      dataIndex: "seal_no",
      className: "max-w-150px min-w-150px w-[150px]",
    },
    {
      title: "Container Type",
      dataIndex: "container_type",
      className: "max-w-150px min-w-150px w-[150px]",
    },
    // {
    //   title: "Vessel",
    //   dataIndex: "vessel_name",
    //   className: "max-w-150px min-w-150px w-[150px]",
    // },
    {
      title: "Vessel",
      dataIndex: "vessel",
      className: "max-w-150px min-w-150px w-[150px]",
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
      title: "Product",
      dataIndex: "product_details",
      className: "max-w-150px min-w-150px w-[150px]",
      render: (list: string[]) => <>{list.join(", ")}</>,
    },
    {
      title: "TPT From",
      dataIndex: "transport_from",
      editable: true,
      width: "6%",
      render: (value: string) =>
        transportLocationOptions.find((opt) => opt.value === value)?.label ??
        "-",
      inputProps: {
        fieldName: "transport_from",
        type: FIELD_TYPE.selectCreatable,
        showSearch: true,
        placeholder: "Transport From",
        selectOptions: transportLocationOptions,
        handleAdd: handleAddTransportLocation as (
          val: string,
        ) => Promise<SelectOption | null>,
      },
    },
    {
      title: "TPT To",
      className: "max-w-150px min-w-150px w-[150px]",
      dataIndex: "transport_to",
      editable: true,
      width: "6%",
      render: (value: string) =>
        transportLocationOptions.find((opt) => opt.value === value)?.label ??
        "-",
      inputProps: {
        fieldName: "transport_to",
        type: FIELD_TYPE.selectCreatable,
        showSearch: true,
        placeholder: "Transport To",
        selectOptions: transportLocationOptions,
        handleAdd: handleAddTransportLocation as (
          val: string,
        ) => Promise<SelectOption | null>,
      },
    },
    {
      title: "No of Pkgs",
      className: "max-w-150px min-w-150px w-[150px]",
      dataIndex: "total_no_of_box",
      render: (value: number) => (value ? value.toLocaleString() : "-"),
    },
    {
      title: "Vehicle",
      className: "max-w-150px min-w-150px w-[150px]",

      dataIndex: "vehicle_no",
      editable: true,
      width: "6%",
      render: (vehicleVal: string) =>
        vehicleOptions?.find((value) => value.value == vehicleVal)?.label,
      inputProps: {
        selectDropDownEndButtonOption: true,
        handleDropdownEndButtonPress: () => {
          handleCloseModalStates("vehicle");
        },
        fieldName: "vehicle_no",
        type: FIELD_TYPE.select,
        showSearch: true,
        placeholder: "Vehicle No",
        selectOptions: vehicleOptions,
      },
    },
    {
      title: "Driver",
      className: "max-w-150px min-w-150px w-[150px]",
      dataIndex: "vehicle_no",
      render: (vehicleVal: string) => {
        const vehicle = vehicleList?.vehicles_connection?.nodes?.find(
          (vehicle) => vehicle.documentId == vehicleVal,
        );

        return vehicle?.driver?.name || "";
      },
    },
    {
      title: "DPW Ref",
      className: "max-w-150px min-w-150px w-[150px]",
      dataIndex: "dbw_ref",
      editable: true,
      inputProps: {
        fieldName: "dbw_ref",
        type: FIELD_TYPE.text,
        placeholder: "DBW Ref",
      },
    },
    {
      title: "Booking Ref",
      className: "max-w-150px min-w-150px w-[150px]",
      dataIndex: "booking_ref",
      editable: true,
      inputProps: {
        fieldName: "booking_ref",
        type: FIELD_TYPE.text,
        placeholder: "Booking Ref",
      },
    },
    {
      title: "Out Token",
      className: "max-w-150px min-w-150px w-[150px]",
      dataIndex: "out_token",
      editable: true,
      inputProps: {
        fieldName: "out_token",
        type: FIELD_TYPE.text,
        placeholder: "Out Token",
      },
    },
    {
      title: "In Token",
      className: "max-w-150px min-w-150px w-[150px]",
      dataIndex: "in_token",
      editable: true,
      inputProps: {
        fieldName: "in_token",
        type: FIELD_TYPE.text,
        placeholder: "In Token",
      },
    },
    {
      title: "Acceptance No",
      className: "max-w-150px min-w-150px w-[150px]",
      dataIndex: "acceptance_no",
      editable: true,
      inputProps: {
        fieldName: "acceptance_no",
        type: FIELD_TYPE.text,
        placeholder: "Acceptance No",
      },
    },
    {
      title: "Acceptance DPW No",
      className: "max-w-150px min-w-150px w-[150px]",
      dataIndex: "acceptance_dpw_no",
      editable: true,
      inputProps: {
        fieldName: "acceptance_dpw_no",
        type: FIELD_TYPE.text,
        placeholder: "Acceptance DPW No",
      },
    },
  ];

  const handleSave = (row: TransportFields) => {
    if (!formValuesChange) setFormValueChange(true);

    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });

    setDataSource(newData);
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        inputProps: col.inputProps,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  // hooks
  useEffect(() => {
    if (containersData) {
      let containerList: TransportFields[] = [];

      containersData?.forEach((invoice: any) => {
        invoice?.containers_connection?.nodes?.forEach(
          (container: Container) => {
            // Assuming `doc_type` is part of the `invoice`, adjust this if necessary
            const docType = invoice?.doc_type || "with_order"; // Default to "with_order" if not available

            // Define the common container data structure
            let containerData: TransportFields = {
              // vessel_name: invoice?.vessel_name || "",
              vessel: invoice?.vessel?.documentId || "", // yaha vessel id save karlo
              documentId: container.documentId,
              key: "",
              container_type: container?.container_type?.container_type || "",
              container_no: container?.container_no || "",
              seal_no: container?.seal_no || "",
              transport_from: container?.transport_from?.documentId,
              transport_from_label: container?.transport_from?.location || "",
              transport_to: container?.transport_to?.documentId,
              transport_to_label: container?.transport_to?.location || "",
              total_no_of_box: container?.total_no_of_boxes_in_container || 0,
              bl_no: invoice?.bl_no || "-",
              invoice_no: invoice?.shipper_invoice_no,
              vehicle_no: container.vehicle?.documentId || "",
              trailer_no: container.vehicle?.trailer?.trailer_no || "",
              dbw_ref: container.dpw_reference || "",
              booking_ref: container?.booking_reference || "",
              out_token: container.out_token || "",
              out_token_date: container.out_token_date || "",
              in_token: container.in_token || "",
              in_token_date: container.in_token_date || "",
              acceptance_dpw_no: container.acceptance_dpw_no || "",
              acceptance_no: container.acceptance_no || "",
            };

            // Handling "without_order" case for docType
            if (docType === "without_order") {
              containerData = {
                ...containerData,
                order_no:
                  container?.container_products_connection?.nodes?.map(
                    (product) => product.order_no_ref || "", // Use order_no_ref for "without_order"
                  ) ?? [],
                product_details:
                  container?.container_products_connection?.nodes?.map(
                    (product) => product.product_name_no_ref || "", // Use product_name_no_ref for "without_order"
                  ) ?? [],
              };
            } else {
              // Default to "with_order" or any other doc_type, using order_id and product_name
              containerData = {
                ...containerData,
                order_no:
                  container?.container_products_connection?.nodes?.map(
                    (product) => product.order?.order_id || "", // Use order_id for other doc_types
                  ) ?? [],
                product_details:
                  container?.container_products_connection?.nodes?.map(
                    (product) =>
                      `${product.product?.name} (${product.packaging?.package_type?.package_name}${product.packaging?.package_type?.weight_unit?.unit})`, // Use product name for other doc_types
                  ) ?? [],
              };
            }

            // Push the containerData to the containerList
            containerList.push(containerData);
          },
        );
      });

      // Add a unique key for each container
      containerList = containerList
        .map((listItem, index) => ({
          ...listItem,
          key: String(index),
        }))
        .sort((a, b) => {
          const dateA = dayjs(a.out_token_date || a.in_token_date);
          const dateB = dayjs(b.out_token_date || b.in_token_date);
          if (!dateA.isValid() && !dateB.isValid()) return 0;
          if (!dateA.isValid()) return 1;
          if (!dateB.isValid()) return -1;
          return dateB.valueOf() - dateA.valueOf();
        });

      // Set the data source after processing all containers
      setDataSource(containerList);
    }
  }, [containersData]); // Only rerun when containersData changes

  const handleTransportSubmit = async () => {
    if (dataSource?.some((val) => !val.vehicle_no)) {
      openNotification("Vehicle no is a required field", "error");
      return;
    }
    try {
      const promises = dataSource.map((value) =>
        handleContainerUpdateRequest(
          {
            vehicle: value.vehicle_no,
            ...(value?.dbw_ref ? { dpw_reference: value?.dbw_ref } : {}),
            ...(value?.booking_ref
              ? { booking_reference: value?.booking_ref }
              : {}),
            ...(value?.transport_from
              ? { transport_from: value?.transport_from }
              : {}),
            ...(value?.transport_to
              ? { transport_to: value?.transport_to }
              : {}),

            out_token: value?.out_token || "",
            ...(value.out_token_date
              ? {
                  out_token_date: dayjs(value.out_token_date).format(
                    DATE_Y_M_D,
                  ),
                }
              : {}),
            in_token: value?.in_token || "",
            ...(value.in_token_date
              ? { in_token_date: dayjs(value.in_token_date).format(DATE_Y_M_D) }
              : {}),
            acceptance_no: value?.acceptance_no || "",
            acceptance_dpw_no: value?.acceptance_dpw_no || "",
          },
          value.documentId,
        ),
      );
      await Promise.all(promises);

      openNotification("Transport details updated successfully", "success");

      queryClient.invalidateQueries({
        queryKey: useGetDocumentManagementByIdQuery.getKey({
          documentId: params?.id.toString(),
        }),
      });
      setFormValueChange(false);
    } catch (error) {
      console.log({ error });
    }
  };

  const handleContainerUpdateRequest = async (
    container: ContainerInput,
    id: string,
  ) => {
    try {
      return await updateContainerRequest({ data: container, documentId: id });
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <div className="border-l border-r border-t border-mainborder p-4">
        <Row
          className="flex-col md:flex-row items-start md:items-center gap-2 md:gap-0 justify-start md:justify-between"
          gutter={16}>
          <Col>
            <p className="text-color_purple mb-0">Transport Details</p>
          </Col>
          <Col
            className="w-full flex gap-2 md:justify-end"
            flex={"auto"}
            span={24}
            md={{ span: 8 }}>
            {/* ✅ Save Transport */}
            <ButtonComponent
              className="w-full md:w-auto"
              loading={isLoading}
              onClick={handleTransportSubmit}
              block
              text="Save Transport"
              size="large"
            />
            <ButtonComponent
              className="w-full md:w-auto"
              disabled={selectedIds.length === 0 || formValuesChange}
              onClick={() => {
                if (typeof window !== "undefined") {
                  // 👇 parent component ka function call karwana hoga
                  const event = new CustomEvent("openTransportEmailPreview");
                  window.dispatchEvent(event);
                }
              }}
              block
              text="Send Email"
              size="large"
            />
          </Col>
        </Row>
      </div>

      <CustomBorderTable
        data={dataSource}
        tableComponents={components}
        border
        columns={columns}
      />

      <AddEditModal
        open={modalStates === "vehicle"}
        handleClose={handleCloseModalStates}>
        <AddEditVehicle
          isComponent
          handleAfterSubmit={async (val) => {
            if (val === "SAVE_CLOSE" || val === "CLOSE") {
              handleCloseModalStates();
            }

            if (val !== "CLOSE") {
              await refetch();
              refetchVehicles();
            }
          }}
        />
      </AddEditModal>
    </>
  );
};

const EditableCell: React.FC<
  React.PropsWithChildren<EditableCellContainerProps>
> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  inputProps,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    form.setFieldsValue({
      vehicle_no: record?.vehicle_no || "",
      dbw_ref: record?.dbw_ref || "",
      booking_ref: record?.booking_ref || "",
      out_token: record?.out_token || "",
      out_token_date: dayjs(record?.out_token_date).isValid()
        ? dayjs(record?.out_token_date)
        : "", // Normalize date
      in_token: record?.in_token || "",
      in_token_date: dayjs(record?.in_token_date).isValid()
        ? dayjs(record?.in_token_date)
        : "", // Normalize date
      acceptance_no: record?.acceptance_no || "",
      acceptance_dpw_no: record?.acceptance_dpw_no || "",
      transport_from: record?.transport_from || "",
      transport_from_label: record?.transport_from_label || "",
      transport_to: record?.transport_to || "",
      transport_to_label: record?.transport_to_label || "",
      vessel: record?.vessel || "",
    });
  }, [form, record]);

  let options = [...(inputProps?.selectOptions ?? [])];

  // 🚫 Disable selected value in opposite field
  if (dataIndex === "transport_from") {
    options = options.map((opt) => ({
      ...opt,
      disabled: opt.value === record.transport_to, // 👈 correct
    }));
  } else if (dataIndex === "transport_to") {
    options = options.map((opt) => ({
      ...opt,
      disabled: opt.value === record.transport_from, // 👈 correct
    }));
  }

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record?.[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    if (inputProps?.type === FIELD_TYPE.selectCreatable) {
      childNode = (
        <FormInput
          ref={inputRef}
          showSelectSearch={inputProps?.showSearch}
          fieldName={dataIndex}
          type={inputProps?.type || ""}
          placeholder={inputProps?.placeholder}
          selectOptions={options ?? []}
          onPressEnter={save}
          size={inputProps?.size}
          handleAdd={async (val: string) => {
            let created: SelectOption | null = null;
            if (inputProps?.handleAdd) {
              const result = await inputProps.handleAdd(val);
              created = (
                result === undefined ? null : result
              ) as SelectOption | null;
            }

            // If a valid option was created, set its *documentId* as the value
            if (created?.value) {
              form.setFieldsValue({ [dataIndex]: created.value });
              handleSave({ ...record, [dataIndex]: created.value });
            }
          }}
        />
      );
    } else {
      childNode = (
        <FormInput
          ref={inputRef}
          selectDropDownEndButtonOption={
            inputProps?.selectDropDownEndButtonOption ?? false
          }
          {...(inputProps?.handleDropdownEndButtonPress
            ? {
                handleDropdownEndButtonPress:
                  inputProps?.handleDropdownEndButtonPress,
              }
            : {})}
          onPressEnter={save}
          {...(!inputProps?.selectDropDownEndButtonOption
            ? {
                onBlur: save,
              }
            : {})}
          showSelectSearch={inputProps?.showSearch}
          fieldName={dataIndex}
          type={inputProps?.type || ""}
          placeholder={inputProps?.placeholder}
          selectOptions={options ?? []}
          size={inputProps?.size}
          handleAdd={inputProps?.handleAdd}
        />
      );
    }
  } else
    childNode = (
      <div
        className={"w-full h-auto " + `${editable ? "md:h-5" : ""}`}
        onClick={toggleEdit}>
        {children}
      </div>
    );

  return (
    <td {...restProps}>
      <div className="remove-form-margin">{childNode}</div>
    </td>
  );
};

export default TransportTable;
