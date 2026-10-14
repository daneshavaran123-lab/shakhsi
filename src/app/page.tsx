import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { About } from "@/components/sections/about";
import { Work } from "@/components/sections/work";
import { Learning } from "@/components/sections/learning";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        رفتن به محتوا
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Work />
        <Learning />
        <Contact />
      </main>
    </>
  );
}
