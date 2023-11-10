export const HeadingComp = ({
  heading,
  onClick,
}: {
  heading: string;
  onClick: (event: React.MouseEvent<HTMLParagraphElement, MouseEvent>) => void;
}) => (
  <h3
    onClick={onClick}
    className="ml-4 mt-3 cursor-pointer text-sm font-bold font-medium leading-[125%] tracking-tight hover:text-custom-primary max-md:ml-2.5"
  >
    {heading}
  </h3>
);

export const SubheadingComp = ({
  subHeading,
  onClick,
}: {
  subHeading: string;
  onClick: (event: React.MouseEvent<HTMLParagraphElement, MouseEvent>) => void;
}) => (
  <p
    onClick={onClick}
    className="ml-4 mt-2 text-xs cursor-pointer font-medium leading-[150%] tracking-tight text-gray-400 hover:text-custom-primary"
  >
    {subHeading}
  </p>
);
