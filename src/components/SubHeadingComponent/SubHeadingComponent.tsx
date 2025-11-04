const SubHeadingComponent = ({
  text = "",
  className = ""
}: {
  text: string;
  className?: string;
}) => {
  return (
    <p className={"text-color_purple font-medium " + className}> {text}</p>
  );
};
export default SubHeadingComponent;
