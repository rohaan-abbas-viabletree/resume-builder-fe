"use client";
import React, { useEffect, useState } from "react";
import { Col, Form, FormInstance, Row } from "antd";
import { PlusRedIcon, TrashIcon } from "@/Images";
import SubHeadingComponent from "../SubHeadingComponent/SubHeadingComponent";
import LabelComponent from "../LabelComponent/LabelComponent";
import FormInput from "../FormInput/FormInput";
import { FIELD_TYPE } from "@/static/constants";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import { checkValidationSubmitError, validatorField } from "@/lib/utils/utils";

const AddressManagement = ({
  isEdit,
  form,
  defaultAddressCount = 1,
}: {
  isEdit: any;
  form: FormInstance;
  defaultAddressCount: number;
}) => {
  const [addressCount, setAddressCount] = useState(1);

  const locations = Form.useWatch("location", form);

  useEffect(() => {
    setAddressCount(defaultAddressCount);
  }, [defaultAddressCount]);

  const removeItem = (ind: number) => {
    setAddressCount(addressCount - 1);
    form.setFieldValue(
      "location",
      locations.filter((_: any, index: number) => index != ind),
    );
  };

  return (
    <>
      <Col span={24} className="flex justify-between">
        <div className="flex items-center">
          <SubHeadingComponent text="Locations" />
          {/* <Image src={InfoIcon} alt="info" className="ml-1 cursor-pointer" /> */}
        </div>

        <ButtonComponent
          onClick={() => setAddressCount(addressCount + 1)}
          iconImage={PlusRedIcon}
          text=""
          type="text"
          size="large"
          className="p-2 border-border_primary w-auto h-auto bg-bg_blue_linear plus-bg "
        />
      </Col>
      {Array.from({ length: addressCount }).map((_, index) => {
        return (
          <>
            <Col span={24}>
              <Row gutter={8}>
                <Col span={24} md={{ flex: "auto" }}>
                  {index != 0 && (
                    <Col className="flex justify-end">
                      <ButtonComponent
                        onClick={() => removeItem(index)}
                        iconImage={TrashIcon}
                        text=""
                        type="text"
                        className="p-2 border-border_red w-auto h-auto bg-bg_red_linear"
                      />
                    </Col>
                  )}
                  <Row gutter={[8, 8]}>
                    <Col
                      xs={{ span: 24 }}
                      sm={{ span: 12 }}
                      md={{ span: 8 }}
                      lg={{ span: 6 }}
                      xl={{ span: 4 }}>
                      <LabelComponent text="Country" />
                      <FormInput
                        className="mb-0"
                        type={FIELD_TYPE.text}
                        fieldName={["location", index, "country"]}
                        rules={[
                          {
                            validator: (
                              _: any,
                              value: string | null | undefined,
                            ) => {
                              return validatorField(_, value);
                            },
                          },
                          checkValidationSubmitError("country", isEdit),
                        ]}
                        placeholder="Type Here"
                      />
                    </Col>

                    <Col
                      xs={{ span: 24 }}
                      sm={{ span: 12 }}
                      md={{ span: 8 }}
                      lg={{ span: 6 }}
                      xl={{ span: 4 }}>
                      <LabelComponent text="City" />
                      <FormInput
                        className="mb-0 "
                        type={FIELD_TYPE.text}
                        fieldName={["location", index, "city"]}
                        rules={[
                          {
                            validator: (
                              _: any,
                              value: string | null | undefined,
                            ) => {
                              return validatorField(_, value);
                            },
                          },
                          checkValidationSubmitError("city", isEdit),
                        ]}
                        placeholder="Type Here (Headquarter,Branch)"
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <LabelComponent text="Address" />
              <FormInput
                className="mb-0"
                type={FIELD_TYPE.text}
                fieldName={["location", index, "address"]}
                rules={[
                  {
                    validator: (_: any, value: string | null | undefined) => {
                      return validatorField(_, value);
                    },
                  },
                  checkValidationSubmitError("address", isEdit),
                ]}
                placeholder="Type Address"
              />
            </Col>
          </>
        );
      })}
    </>
  );
};

export default AddressManagement;
