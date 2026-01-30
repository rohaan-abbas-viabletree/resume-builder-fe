"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

type Props = {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: Props) {
  // Minimal toolbar: allow line breaks + simple formatting
  const modules = {
    toolbar: [["bold", "italic", "underline"], [{ list: "bullet" }], ["clean"]],
  };

  return (
    <ReactQuill
      theme="snow"
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      modules={modules}
    />
  );
}
