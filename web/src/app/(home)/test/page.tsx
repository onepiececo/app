import { Preview } from "./preview";

export default function TestPage() {
  return (
    <main className="relative min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-10 px-10 pt-13 pb-10 xl:px-16 xl:pt-19">
        <Preview />
      </div>
    </main>
  );
}
