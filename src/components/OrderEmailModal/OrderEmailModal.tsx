import React, { useEffect, useState } from "react";
import { Modal, Form } from "antd";
import { IFunctionType } from "@/types/common";
import dynamic from "next/dynamic";
import {
  checkValidationSubmitError,
  openNotification,
} from "@/lib/utils/utils";
import { FIELD_TYPE } from "@/static/constants";
import FormInput from "../FormInput/FormInput";
import LabelComponent from "../LabelComponent/LabelComponent";
import ButtonComponent from "../ButtonComponent/ButtonComponent";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const PreviewOrderModal = ({
  open = false,
  handleClose,
  title = "Preview Order Email",
  data,
  supplierEmail = "",
  subject = "Order Details",
}: {
  open: boolean;
  handleClose: IFunctionType;
  title?: string;
  data: string; // HTML content
  supplierEmail?: string;
  subject?: string;
}) => {
  const config = {
    readonly: false,
    toolbar: true,
    theme: "",
  };

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<any>(null);
  const [htmlContent, setHtmlContent] = useState<string>(data);

  useEffect(() => {
    if (supplierEmail || subject) {
      form.setFieldsValue({ email: supplierEmail, subject });
    }
  }, [supplierEmail, subject, form]);

  useEffect(() => {
    setHtmlContent(data);
  }, [data, open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const emails = values.email
        .split(",")
        .map((e: string) => e.trim())
        .filter((e: string) => e.length > 0);

      for (const email of emails) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-email`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: email,
              subject: values.subject,
              html: htmlContent,
            }),
          },
        );

        const result = await response.json();
        if (!result.success) {
          console.error("Failed to send email:", result);
          setLoading(false);
          setFormError({
            field: "email",
            message: `Failed to send email to ${email}`,
          });
          return;
        }
      }

      openNotification("Email(s) sent successfully");
      setLoading(false);
      setFormError(null);
      handleClose();
    } catch (error) {
      setLoading(false);
      console.error("Validation or API Error:", error);
      setFormError({
        field: "email",
        message: "Unexpected error occurred.",
      });
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={() => handleClose()}
      footer={null}
      width={800}>
      <Form
        form={form}
        onFinish={handleSubmit}
        initialValues={{ email: supplierEmail, subject }}>
        {/* ✅ Subject field */}
        <LabelComponent text="Email Subject" />
        <FormInput
          className="mb-4"
          type={FIELD_TYPE.text}
          fieldName="subject"
          rules={[
            { required: true, message: "Subject is required" },
            checkValidationSubmitError("subject", formError),
          ]}
          placeholder="Enter email subject"
        />

        {/* ✅ Email field */}
        <LabelComponent text="Email Address" />
        <FormInput
          className="mb-4"
          type={FIELD_TYPE.text}
          fieldName="email"
          rules={[
            {
              validator: (_: any, value: string) => {
                if (!value) {
                  return Promise.reject("Email address is required");
                }
                const emails = value.split(",").map((e) => e.trim());
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const invalidEmails = emails.filter((e) => !emailRegex.test(e));
                if (invalidEmails.length > 0) {
                  return Promise.reject(
                    `Invalid email(s): ${invalidEmails.join(", ")}`,
                  );
                }
                return Promise.resolve();
              },
            },
            checkValidationSubmitError("email", formError),
          ]}
          placeholder="Enter one or multiple emails (comma separated)"
        />

        {/* ✅ Controlled JoditEditor */}
        <JoditEditor
          value={htmlContent}
          config={config}
          onBlur={(newContent) => setHtmlContent(newContent)}
        />

        <ButtonComponent
          type="primary"
          className="testing"
          text="Send Email"
          size="large"
          block
          loading={loading}
          onClick={handleSubmit}
        />
      </Form>
    </Modal>
  );
};

export default PreviewOrderModal;
