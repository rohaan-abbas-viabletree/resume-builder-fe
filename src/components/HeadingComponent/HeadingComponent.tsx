const HeadingH1Component = ({
  text = "",
  className = "",
}: {
  text: string;
  className?: string;
}) => {
  return (
    <h1
      className={
        "text-color_dark_purple text-sm font-bold md:text-2xl " + className
      }>
      {text}
    </h1>
  );
};
export default HeadingH1Component;
