"use client";
import { Modal } from "antd";
import React from "react";
import { IFunctionType } from "@/types/common";
import { CloseIcon } from "@/Images";
import Image from "next/image";

const ViewDocsComponent = ({
  open = false,
  handleClose,
  title = "Confirmation!",
  children,
  width = 400,
  description = "",
}: {
  description?: string;
  open: boolean;
  handleClose?: IFunctionType;
  title?: string;
  width?: number;
  children: React.ReactNode;
}) => {
  return (
    <Modal
      width={width}
      open={open}
      classNames={{ content: "rounded-2xl p-8" }}
      className="rounded-3xl"
      closeIcon={<Image alt="" src={CloseIcon} />}
      onCancel={() => handleClose && handleClose()}
      footer={null}>
      <div>
        <h4 className="text-lg text-greyish-small-heading font-bold leading-3">
          {title}
        </h4>
        {description && <p className="text-gray-500">{description}</p>}
        <div className="mt-2 max-h-60 overflow-y-auto">{children}</div>
      </div>
    </Modal>
  );
};

export default ViewDocsComponent;
