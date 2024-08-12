import React, { useEffect } from "react";
import OpenApiSchemaInput from "../../components/OpenApiSchemaInput";
import Oas from "oas";
import OASNormalize from "oas-normalize";

const App = () => {
  const [schema, setSchema] = React.useState<string | null>(null);
  const [schemaNormalized, setSchemaNormalized] = React.useState<string | null>(
    null,
  );
  const oas = React.useMemo(
    () =>
      schemaNormalized ? Oas.init(JSON.parse(schemaNormalized)) : Oas.init({}),
    [schemaNormalized],
  );

  useEffect(() => {
    (async () => {
      if (!schema) return;

      /*
      // CSP script-src 'unsafe-eval' not available in manifest V3
      // unsafe-eval needed for oas-normalize
      const oasDocument = await new OASNormalize(schema, {}).validate({
        convertToLatest: true,
      });
      setSchemaNormalized(JSON.stringify(oasDocument));
      */

      setSchemaNormalized(schema);
    })();
  }, [schema]);

  return (
    <>
      <h2>My App</h2>
      {!schema ? (
        <>
          <OpenApiSchemaInput onSchemaChange={setSchema} />
        </>
      ) : (
        <>
          <p>{oas.api.info?.title}</p>
          <div>
            {Object.entries(oas.getPaths()).map(([key, path]) => (
              <div key={key}>
                {Object.entries(path).map(([method, operation]) => (
                  <p key={method}>
                    {method.toUpperCase()} {key}:{" "}
                    {operation.getDescription() || "No description"}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default App;
