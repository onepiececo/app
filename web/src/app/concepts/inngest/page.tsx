import { CodeBlock } from "@/components/ui/code-block";
import { InngestShell } from "@/components/concepts/inngest/shell";

const STEP_OUTPUT = `{
  "topDestination": "Maldives",
  "packagesEvaluated": 142,
  "lowestPrice": 1820,
  "currency": "USD"
}`;

export default function InngestConceptPage() {
  return (
    <InngestShell
      output={
        <CodeBlock
          filename="output.json"
          lang="json"
          code={STEP_OUTPUT}
        />
      }
    />
  );
}
