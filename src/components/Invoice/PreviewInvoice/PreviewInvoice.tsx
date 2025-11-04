import { Container, DocumentManagement } from "@/app/client-types";
import ButtonComponent from "@/components/ButtonComponent/ButtonComponent";
import FormInput from "@/components/FormInput/FormInput";
import LabelComponent from "@/components/LabelComponent/LabelComponent";
import { formatNumber, openNotification } from "@/lib/utils/utils";
import { FIELD_TYPE } from "@/static/constants";
import { IFunctionMultiParams } from "@/types/common";
import { OrderType } from "@/types/order";
import { Col, Form, FormInstance, Modal, Row } from "antd";
import dynamic from "next/dynamic";
import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import dayjs from "dayjs";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

interface PreviewInvoiceProps {
  form?: FormInstance;
  title?: string;
  open: boolean;
  handleClose: IFunctionMultiParams;
  supplierEmail?: string;
  subject?: string;
  dataSource: OrderType[];
  documentManagement?: DocumentManagement;
}

const generateEmailContentFromDocMgmt = (docMgmt?: DocumentManagement) => {
  if (!docMgmt) return "<p>No Document Management data</p>";
  let totalNetWeight = 0;
  let totalGrossWeight = 0;
  console.log("docMgmt not found", docMgmt);
  const products = docMgmt.bl_documents_connection?.nodes?.flatMap((val) => {
    return val.invoices_connection?.nodes?.flatMap((inv) => {
      return inv.containers_connection?.nodes?.flatMap((cont) => {
        totalNetWeight +=
          (cont?.total_net_weight ?? 0) *
          (cont?.container_type?.weight_unit?.value_in_kilogram ?? 0);
        totalGrossWeight +=
          (cont?.total_gross_weight ?? 0) *
          (cont?.container_type?.weight_unit?.value_in_kilogram ?? 0);
        return cont.container_products_connection?.nodes?.flatMap((val) => val);
      });
    });
  });

  const invoices = docMgmt.bl_documents_connection?.nodes?.flatMap((val) => {
    return val.invoices_connection?.nodes?.flatMap((inv) => {
      return inv;
    });
  });

  totalNetWeight = totalNetWeight / 1000;
  totalGrossWeight = totalGrossWeight / 1000;

  const productNames =
    products && products.length
      ? products
          .map((p) => {
            console.log("product data:", p);

            // If document is 'without_order', use product_name_no_ref
            if (docMgmt?.doc_type === "without_order") {
              // Handle multiple product_name_no_ref (array or string)
              const names = Array.isArray(p?.product_name_no_ref)
                ? p.product_name_no_ref.filter(Boolean)
                : [p?.product_name_no_ref].filter(Boolean);

              return names.length ? `(${names.join(", ")})` : "-";
            }

            // Otherwise, use normal product + packaging structure
            return `${p?.product?.name ?? ""} (${
              p?.packaging?.package_type?.package_name ?? ""
            }${p?.packaging?.package_type?.weight_unit?.unit ?? ""})`;
          })
          .filter((name) => name && name.trim() !== "")
          .join(", ")
      : "-";
  const formattedTotalNetWeight = formatNumber(
    Number(totalNetWeight?.toFixed?.(3) ?? totalNetWeight) || 0,
  );
  const formattedTotalGrossWeight = formatNumber(
    Number(totalGrossWeight?.toFixed?.(3) ?? totalGrossWeight) || 0,
  );
  const invoiceNames =
    invoices?.map((p) => `${p?.shipper_invoice_no ?? ""}`).join(", ") || "-";

  let html = `
<h2 style="margin-bottom:20px; font-size:18px; text-align: center; font-weight: bold; color: #333; border: 2px solid #000; padding: 8px; width: 100%; display: block; margin-left: auto; margin-right: auto;">
  Packing List
</h2>
  <p style="font-size:14px; margin-bottom:10px;">
    <b>1. Invoice No:</b> ${invoiceNames}<br>
    <b>2. Invoice Date:</b> ${dayjs().format("YYYY-MM-DD") || "-"}<br>
    <b>3. Commodity:</b> ${productNames} <br>
    <b>4. Total Net weight:</b> ${formattedTotalNetWeight} MT <br>
    <b>5. Total Gross weight:</b> ${formattedTotalGrossWeight} MT
  </p>
`;

  // Container and Product Details Table
  const containers: Container[] = [];

  if (docMgmt.bl_documents_connection?.nodes?.length) {
    docMgmt.bl_documents_connection.nodes.forEach((bl, blIndex) => {
      if (bl.invoices_connection?.nodes?.length) {
        bl.invoices_connection.nodes.forEach((inv, invIndex) => {
          inv.containers_connection?.nodes?.forEach((cont) => {
            containers.push(cont);
          });
        });
      }
    });
  }
  html += `
  <table width="100%" border="1" cellspacing="0" cellpadding="5" style="border-collapse:collapse; font-size:12px;">
       <thead style="background:#eef6ff; text-align: center; font-weight: bold; border: 1px solid #ddd;">
         <tr>
           <th class="dark-bg" style="border: 1px solid #ddd; padding: 8px;">Container No</th>
           <th class="dark-bg" style="border: 1px solid #ddd; padding: 8px;">Commodity</th>
           <th class="dark-bg" style="border: 1px solid #ddd; padding: 8px;">Seal No</th>
           <th class="dark-bg" style="border: 1px solid #ddd; padding: 8px;">Size</th>
           <th class="dark-bg" style="border: 1px solid #ddd; padding: 8px;">Cartons</th>
           <th class="dark-bg" style="border: 1px solid #ddd; padding: 8px;">Net Wt (KG)</th>
           <th class="dark-bg" style="border: 1px solid #ddd; padding: 8px;">Gross Wt (KG)</th>
         </tr>
       </thead>
       <tbody>`;
  containers?.forEach((cont) => {
    containers.push(cont);
    html += `
         <tr>
           <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
             cont.container_no || "-"
           }</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
            ${
              cont.container_products_connection?.nodes
                ?.map((item) => item.product?.name)
                .filter(Boolean)
                .join(", ") || "-"
            }
          </td>

           <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
             cont.seal_no || "-"
           }</td>
           <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
             cont.container_type?.container_type || "-"
           }</td>
           <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${formatNumber(
             cont.total_no_of_boxes_in_container || 0,
           )}</td>
           <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${formatNumber(
             (cont.total_net_weight ?? 0) *
               (cont.container_type?.weight_unit?.value_in_kilogram ?? 0),
           )}</td>
           <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${formatNumber(
             (cont.total_gross_weight ?? 0) *
               (cont.container_type?.weight_unit?.value_in_kilogram ?? 0),
           )}</td>
         </tr>
       `;
  });
  html += `</tbody></table>`;

  html += "</div>";

  return html;
};

const PreviewInvoice: React.FC<PreviewInvoiceProps> = React.memo(
  function PreviewInvoice(props) {
    const {
      form,
      title = "Preview Invoice Email",
      open = false,
      handleClose,
      supplierEmail = "",
      subject = "Invoice Details",
      dataSource,
      documentManagement,
    } = props;
    const values = Form.useWatch([], form);

    console.log("all data ", {
      value: values,
      dataSource: dataSource,
      documentManagement: documentManagement,
    });
    const [editorContent, setEditorContent] = useState<string>("");
    const [emailLoading, setEmailLoading] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    // const [includePDF, setIncludePDF] = useState<string>("no");
    const [fileName, setFileName] = useState<string>("invoice.pdf");
    const contentRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (documentManagement) {
        const html = generateEmailContentFromDocMgmt(documentManagement);
        setEditorContent(html);
        form?.setFieldsValue({ message: html });
      }
    }, [documentManagement, form]);

    const config = {
      readonly: false,
      toolbar: true,
      theme: "",
    };

    const generatePDF = () => {
      setPdfLoading(true);
      if (contentRef.current) {
        html2canvas(contentRef.current, { scale: 2 })
          .then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            if (imgData) {
              const doc = new jsPDF();
              const imgWidth = 180;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;
              doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
              doc.save(fileName);
            } else {
              console.error("Failed to capture image data.");
            }
          })
          .catch((error) => {
            console.error("Error capturing canvas:", error);
          })
          .finally(() => {
            setPdfLoading(false); // Stop PDF loading
          });
      }
    };

    // Handle Email submission
    const handleSubmit = async () => {
      if (!form) {
        console.error("Form is undefined");
        return;
      }

      setEmailLoading(true);
      try {
        const values = await form.validateFields([
          "subject",
          "email",
          "message",
          "fileName",
        ]);
        const emails = values.email
          .split(",")
          .map((e: string) => e.trim())
          .filter((e: string) => e.length > 0);

        // let pdfData: string | null = null;
        // if (includePDF === "yes") {
        //   pdfData = await generatePDFBase64();
        // }

        for (const email of emails) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-email`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: email,
                subject: values.subject,
                html: editorContent,
                // include_pdf: includePDF === "yes",
                // pdfData: pdfData,
                // fileName: fileName,
              }),
            },
          );

          const result = await response.json();
          if (!result.success) {
            console.error("Failed to send email:", result);
            setEmailLoading(false);
            return;
          }
        }
        openNotification("Email(s) sent successfully");
        setEmailLoading(false);
        handleClose();
      } catch (error) {
        setEmailLoading(false);
        console.error("Error:", error);
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
          initialValues={{
            // email: "testdev4242@gmail.com",
            email: supplierEmail,
            subject,
            message: editorContent,
            fileName: "invoice",
          }}>
          {/* Subject Field */}
          <LabelComponent text="Email Subject" />
          <FormInput
            className="mb-4"
            type={FIELD_TYPE.text}
            fieldName="subject"
            placeholder="Enter email subject"
          />

          <LabelComponent text="Email Address" />
          <FormInput
            className="mb-4"
            type={FIELD_TYPE.text}
            fieldName="email"
            placeholder="Enter one or multiple emails (comma separated)"
          />

          <LabelComponent text="Email Body" />
          <JoditEditor
            value={editorContent}
            config={config}
            onBlur={(newContent) => {
              setEditorContent(newContent);
              form?.setFieldsValue({ message: newContent });
            }}
          />

          {/* PDF File Name */}
          <LabelComponent text="PDF File Name" />
          <FormInput
            className="mb-4"
            type={FIELD_TYPE.text}
            fieldName="fileName"
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Enter PDF file name"
          />

          <div
            ref={contentRef}
            className="preview-invoice-content"
            style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
            dangerouslySetInnerHTML={{ __html: editorContent }}
          />

          {/* Action Buttons */}
          <Row gutter={16} style={{ marginTop: "20px" }}>
            <Col span={12}>
              <ButtonComponent
                onClick={generatePDF}
                type={"default"}
                btnCustomType="outline"
                text={"Download PDF"}
                loading={pdfLoading}
                size="large"
                block
              />
            </Col>

            <Col span={12}>
              <ButtonComponent
                block
                type="primary"
                text={"Send Email"}
                size="large"
                loading={emailLoading}
                onClick={handleSubmit}
                disabled={emailLoading}
              />
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  },
);

export default PreviewInvoice;
