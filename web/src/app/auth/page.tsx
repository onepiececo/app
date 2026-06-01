import { VariantClassic } from "@/components/auth/variant-classic";
import { PanelDither } from "@/components/auth/panel-dither";

export default function TestPage() {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <VariantClassic />
        </div>
      </div>
      <div className="hidden lg:block">
        <PanelDither />
      </div>
    </div>
  );
}
