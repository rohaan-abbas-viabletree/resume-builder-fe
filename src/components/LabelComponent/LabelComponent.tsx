const LabelComponent = ({
  text = "",
  className = "",
  required = true,
}: {
  text: string;
  className?: string;
  required?: boolean;
}) => {
  return (
    <p className={"text-black1 mb-1 " + className}>
      {" "}
      {text} {required && "*"}
    </p>
  );
};
export default LabelComponent;
