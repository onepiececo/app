import { browseAnime } from "@/app/actions/anime";
import { AnimeBrowser } from "@/components/anime-browser";
import { MobileBar } from "@/components/mobile-bar";
import { Sidebar } from "@/components/sidebar";

export const metadata = {
  title: "Anime Database — onepiece",
};

export default async function AnimePage() {
  const initialAnime = await browseAnime("title", 100);
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground lg:flex-row">
      <Sidebar />
      <MobileBar />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <AnimeBrowser initialAnime={initialAnime} initialSort="title" />
      </main>
    </div>
  );
}
