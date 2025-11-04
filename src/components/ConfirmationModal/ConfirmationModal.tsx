"use client";
import { Col, Modal, Row } from "antd";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import React from "react";
import { IFunctionType } from "@/types/common";

const ConfirmationModal = ({
  open = false,
  handleClose,
  handleNo,
  title = "Confirmation!",
  handleSubmit,
  loading = false,
  description = "",
  customButtons,
  width = 400,
  confirmClassName = "",
  cancelClassName = "",
}: {
  description?: string;
  open: boolean;
  handleClose: IFunctionType;
  handleNo?: IFunctionType;
  handleSubmit: any;
  title?: string;
  loading?: boolean;
  customButtons?: React.ReactNode;
  width?: number;
  confirmClassName?: string;
  cancelClassName?: string;
}) => {
  return (
    <Modal
      width={width}
      open={open}
      onCancel={() => handleClose()}
      footer={null}>
      <div>
        <h4 className="text-[21px] mb-4 text-greyish-small-heading font-bold">
          {title}
        </h4>
        <div>
          <p className="mb-5">{description}</p>
          {!customButtons ? (
            <div className="mb-2">
              <Row gutter={16} justify={"end"}>
                <Col>
                  <ButtonComponent
                    text="No"
                    type="default"
                    onClick={() => (handleNo ? handleNo() : handleClose())}
                    btnCustomType={"outline"}
                    className={cancelClassName}
                  />
                </Col>
                <Col>
                  <ButtonComponent
                    loading={loading}
                    onClick={() => handleSubmit()}
                    text="Yes"
                    className={confirmClassName}
                  />
                </Col>
              </Row>
            </div>
          ) : (
            customButtons
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
