import { InboxIcon } from "@/Images";
import { Upload, UploadProps } from "antd";
import Image from "next/image";

const UploadDragger = ({
  placeholder = "",
  children,
  ref,
  ...rest
}: {
  ref?: any;
  placeholder?: string;
  children?: React.ReactNode;
} & UploadProps) => {
  return (
    <Upload.Dragger ref={ref} {...rest}>
      <div className="flex justify-center items-center">
        {children ? (
          children
        ) : (
          <>
            <Image src={InboxIcon} alt="upload" className="me-4" />
            <p>{placeholder}</p>
          </>
        )}
      </div>
    </Upload.Dragger>
  );
};
export default UploadDragger;
