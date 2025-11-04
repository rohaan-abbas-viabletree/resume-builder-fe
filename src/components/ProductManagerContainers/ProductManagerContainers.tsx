"use client";
import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { PlusRedIcon, TrashIcon } from "@/Images";
import SubHeadingComponent from "../SubHeadingComponent/SubHeadingComponent";
import LabelComponent from "../LabelComponent/LabelComponent";
import FormInput from "../FormInput/FormInput";
import { FIELD_TYPE } from "@/static/constants";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import { checkValidationSubmitError } from "@/lib/utils/utils";
import { useContainerTypeListQuery } from "@/graphql/containerType/containerType.generated";
import { useDebounce } from "@uidotdev/usehooks";
import { SelectNotFoundContent } from "../SelectNotFoundContent";
import { ComponentContainerProductContainer } from "@/app/client-types";
import AddEditModal from "../AddEditModal/AddEditModal";
import AddEditContainer from "../AddEditContainer/AddEditContainer";

const ProductManagerContainers = React.memo(function ProductManagerContainers({
  error,
  containersDefaultLength,
  productContainers = [],
}: {
  error: any;
  containersDefaultLength: number;
  productContainers: ComponentContainerProductContainer[];
}) {
  // states
  const [containers, setContainers] = useState(1);
  const [searchContainerType, setSearchContainerType] = useState<string>("");
  const debouncedSearchContainerType = useDebounce(searchContainerType, 500);
  const [modalStates, setModalStates] = useState<"idle" | "container">("idle");
  // const
  const container_types_IDS = productContainers.map(
    (value) => value.container_type?.documentId || "",
  );
  const {
    data: getContainerType,
    isLoading: containerTypeLoading,
    refetch: refetchContainers,
  } = useContainerTypeListQuery({
    filters: debouncedSearchContainerType?.trim()
      ? { container_type: { containsi: debouncedSearchContainerType } }
      : container_types_IDS?.length
      ? { documentId: { in: container_types_IDS ?? [] } }
      : {},
  });
  const containerTypeOptions =
    getContainerType?.containerTypes_connection?.nodes?.map((value) => {
      return {
        label: value.container_type,
        value: value.documentId,
        disabled: !value.is_active,
      };
    });

  // hooks
  useEffect(() => {
    if (containersDefaultLength) {
      setContainers(containersDefaultLength);
    }
  }, [containersDefaultLength]);

  // handles
  // functions
  const handleCloseModalStates = (type: "idle" | "container" = "idle") => {
    setModalStates(type);
  };
  const handleSelectContainerType = (search: string) => {
    setSearchContainerType(search);
  };

  return (
    <>
      <Col span={24} className="flex justify-between items-center">
        <SubHeadingComponent text="Containers" />

        <ButtonComponent
          onClick={() => setContainers(containers + 1)}
          iconImage={PlusRedIcon}
          text=""
          type="text"
          size="large"
          className="p-2 border-border_primary w-auto h-auto bg-bg_blue_linear plus-icon-b"
        />
      </Col>
      {Array.from({ length: containers }).map((_, index) => {
        return (
          <>
            {index != 0 && (
              <Col span={24} className="flex justify-end">
                <ButtonComponent
                  onClick={() => setContainers(containers - 1)}
                  iconImage={TrashIcon}
                  text=""
                  type="text"
                  className="p-2 border-border_red w-auto h-auto bg-bg_red_linear"
                />
              </Col>
            )}
            <Col span={24}>
              <Row gutter={[8, 16]} className="flex items-stretch">
                <Col
                  xs={{ span: 24 }}
                  sm={{ span: 24 }}
                  md={{ span: 24 }}
                  lg={{ span: 12 }}
                  xl={{ span: 8 }}
                  className="flex flex-col justify-between">
                  <LabelComponent text="Container Type" required={false} />
                  <FormInput
                    selectDropDownEndButtonOption
                    handleDropdownEndButtonPress={() => {
                      handleCloseModalStates("container");
                    }}
                    className="mb-0"
                    type={FIELD_TYPE.select}
                    notFoundContent={
                      <SelectNotFoundContent loading={containerTypeLoading} />
                    }
                    fieldName={[
                      "product_container",
                      index,
                      "container_type",
                      "documentId",
                    ]}
                    showSelectSearch
                    handleSelectSearch={handleSelectContainerType}
                    selectOptions={containerTypeOptions}
                    selectLoading={containerTypeLoading}
                    // rules={[
                    //   {
                    //     validator: (
                    //       _: any,
                    //       value: string | null | undefined,
                    //     ) => {
                    //       return validatorField(_, value);
                    //     },
                    //   },
                    //   checkValidationSubmitError("container_type", error),
                    // ]}
                    rules={[
                      checkValidationSubmitError("container_type", error),
                    ]}
                    placeholder="Container Type"
                  />
                </Col>
                <Col
                  xs={{ span: 24 }}
                  sm={{ span: 12 }}
                  md={{ span: 24 }}
                  lg={{ span: 12 }}
                  xl={{ span: 8 }}>
                  <LabelComponent
                    text="No of Box Per Container (Space Wise)"
                    required={false}
                  />
                  <FormInput
                    className="mb-0 "
                    type={FIELD_TYPE.number}
                    // rules={[
                    //   {
                    //     validator: (_: any, value: string) => {
                    //       return validatorFieldUpdated(
                    //         _,
                    //         value,
                    //         1,
                    //         15,
                    //         false,
                    //         true,
                    //         0,
                    //         true,
                    //         false,
                    //       );
                    //     },
                    //   },
                    //   checkValidationSubmitError("no_of_box_space_wise", error),
                    // ]}
                    rules={[
                      checkValidationSubmitError("no_of_box_space_wise", error),
                    ]}
                    fieldName={[
                      "product_container",
                      index,
                      "no_of_box_space_wise",
                    ]}
                    placeholder="No of Box (Space Wise)"
                  />
                </Col>
                <Col
                  xs={{ span: 24 }}
                  sm={{ span: 12 }}
                  md={{ span: 24 }}
                  lg={{ span: 24 }}
                  xl={{ span: 8 }}>
                  <LabelComponent
                    text="No of Box Per Container (Weight Wise)"
                    required={false}
                  />
                  <FormInput
                    className="mb-0"
                    // rules={[
                    //   {
                    //     validator: (_: any, value: string) => {
                    //       return validatorFieldUpdated(
                    //         _,
                    //         value,
                    //         1,
                    //         15,
                    //         true,
                    //         true,
                    //         0,
                    //         true,
                    //         false,
                    //       );
                    //     },
                    //   },
                    //   checkValidationSubmitError(
                    //     "no_of_box_weight_wise",
                    //     error,
                    //   ),
                    // ]}
                    rules={[
                      checkValidationSubmitError(
                        "no_of_box_weight_wise",
                        error,
                      ),
                    ]}
                    type={FIELD_TYPE.number}
                    fieldName={[
                      "product_container",
                      index,
                      "no_of_box_weight_wise",
                    ]}
                    placeholder="No of Box (Weight Wise)"
                  />
                </Col>
              </Row>
            </Col>
          </>
        );
      })}

      <AddEditModal
        open={modalStates === "container"}
        handleClose={handleCloseModalStates}>
        <AddEditContainer
          isComponent
          handleAfterSubmit={(val) => {
            if (val === "SAVE_CLOSE" || val === "CLOSE") {
              handleCloseModalStates();
            }
            if (val !== "CLOSE") refetchContainers();
          }}
        />
      </AddEditModal>
    </>
  );
});

export default ProductManagerContainers;
