// components/CancelOrderModal.tsx
import { Modal, Input, Form } from "antd";

interface CancelOrderModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  oncancel?: () => void;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values.reason);
      form.resetFields();
      onClose();
    } catch {
      // validation failed
    }
  };

  return (
    <Modal
      title={<span className="text-lg font-semibold">Cancel</span>}
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText="Submit"
      cancelText="Close"
      className="rounded-2xl popup-btn-wrap">
      <Form form={form} layout="vertical">
        <Form.Item
          name="reason"
          label="Reason for cancellation"
          rules={[{ required: true, message: "Please enter a reason" }]}>
          <Input.TextArea
            rows={4}
            placeholder="Type your reason..."
            className="rounded-lg"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CancelOrderModal;
