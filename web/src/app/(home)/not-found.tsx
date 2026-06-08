import { NotFoundView } from "@/components/not-found-view";

// Lives in the home segment so a missing route still renders inside the sidebar shell.
export default function NotFound() {
  return <NotFoundView />;
}
