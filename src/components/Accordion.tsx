import React from "react";

export interface AccordionProps {
  children: React.ReactNode;
  header: React.ReactNode;
}

const Accordion = ({ children, header }: AccordionProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <div style={{ cursor: "pointer" }} onClick={() => setIsOpen(!isOpen)}>
        {header}
      </div>
      <div style={{ display: isOpen ? "block" : "none" }}>{children}</div>
    </>
  );
};

export default Accordion;
