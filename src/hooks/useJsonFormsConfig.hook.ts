import { useContext, useMemo } from "react";
import { JsonFormsContext } from "@jsonforms/react";

export const useJsonFormsConfig = () => {
  const jsonFormsContext = useContext(JsonFormsContext);
  const cells = useMemo(() => jsonFormsContext.cells ?? [], [jsonFormsContext]);
  const renderers = useMemo(
    () => jsonFormsContext.renderers ?? [],
    [jsonFormsContext],
  );
  const ajv = useMemo(() => jsonFormsContext.core?.ajv, [jsonFormsContext]);

  return { ajv, cells, renderers };
};
