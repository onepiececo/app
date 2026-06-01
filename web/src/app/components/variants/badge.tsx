import { Badge } from "@/components/ui/badge";
import { Row } from "./_shared";

export function BadgeVariants() {
  return (
    <div className="flex flex-col gap-3">
      <Row>
        <Badge>Queued</Badge>
        <Badge variant="info">Review</Badge>
        <Badge variant="success">Live</Badge>
        <Badge variant="warning">Delayed</Badge>
        <Badge variant="destructive">Blocked</Badge>
      </Row>
      <Row>
        <Badge appearance="soft">Backlog</Badge>
        <Badge appearance="soft" variant="info">Spec ready</Badge>
        <Badge appearance="soft" variant="success">Healthy</Badge>
        <Badge appearance="soft" variant="warning">Waiting</Badge>
        <Badge appearance="soft" variant="destructive">Escalated</Badge>
      </Row>
    </div>
  );
}
