"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Moon, Search, Sun } from "lucide-react";

import { Scramble } from "@/components/motion/scramble";
import { useContent } from "@/content/provider";
import { locales } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { TehranClock } from "@/components/tehran-clock";
import { useLenis } from "@/components/providers/smooth-scroll";
import { useTheme } from "@/components/providers/theme";
import { cn } from "@/lib/utils";
import { pageHref, type Page } from "@/lib/routes";
import { useOpenCommandMenu } from "@/components/command-menu";
import { Menu } from "@/components/menu";
import { useSound } from "@/components/providers/sound";

const ease = [0.16, 1, 0.3, 1] as const;

export function LanguageSwitch({ className, page = "home" }: { className?: string; page?: Page }) {
  const localeHref = (l: string) => pageHref(l, page);
  const { locale, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t.langSwitch}
      className={cn("relative flex h-9 items-center rounded-full p-0.5 ring-1 ring-border", className)}
    >
      {locales.map((l) => {
        const current = l === locale;
        return (
          <a
            key={l}
            href={localeHref(l)}
            hrefLang={l}
            lang={l}
            aria-current={current ? "page" : undefined}
            onClick={(e) => {
              // Keep the reader's place when switching language.
              if (!current && location.hash) {
                e.preventDefault();
                location.href = `${localeHref(l)}${location.hash}`;
              }
            }}
            className={cn(
              "relative grid h-8 w-10 place-items-center rounded-full font-mono text-[0.7rem] tracking-wider uppercase transition-colors",
              current ? "text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {current && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative">{l === "fa" ? "فا" : "EN"}</span>
          </a>
        );
      })}
    </div>
  );
}

function CommandTrigger() {
  const open = useOpenCommandMenu();
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={open}
      aria-label={t.command.open}
      aria-keyshortcuts="Control+K Meta+K"
      className="group inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-2.5 text-muted-foreground ring-1 ring-border transition-colors hover:bg-foreground/5 hover:text-foreground"
    >
      <Search className="size-4" />
      <kbd className="ltr hidden rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[0.65rem] md:inline">Ctrl K</kbd>
    </button>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const next = theme === "dark" ? "light" : "dark";

  // Day ↔ night as a circle of light spreading from the button (View
  // Transitions API); browsers without it, or reduced motion, switch instantly.
  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTheme(next);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    doc.startViewTransition(() => setTheme(next)).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 750, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={next === "light" ? t.theme.toLight : t.theme.toDark}
      title={next === "light" ? t.theme.toLight : t.theme.toDark}
      className="relative grid size-9 cursor-pointer place-items-center overflow-hidden rounded-full ring-1 ring-border transition-colors hover:bg-foreground/5"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 18, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -18, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function SoundToggle({ className }: { className?: string }) {
  const { on, toggle } = useSound();
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? t.sound.off : t.sound.on}
      title={on ? t.sound.off : t.sound.on}
      className={cn(
        "grid size-9 cursor-pointer place-items-center rounded-full ring-1 ring-border transition-colors hover:bg-foreground/5",
        className,
      )}
    >
      <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
        {[0.55, 1, 0.7, 0.4].map((h, i) => (
          <span
            key={i}
            className={cn("sound-bar w-[2px] rounded-full bg-current", on && "is-on")}
            style={{ height: `${h * 100}%`, animationDelay: `${i * -0.23}s` }}
          />
        ))}
      </span>
    </button>
  );
}

export function Header() {
  const { t, locale } = useI18n();
  const { profile } = useContent();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hoverMenu, setHoverMenu] = useState(false);
  const lenis = useLenis();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 240 && !open);
    setScrolled(y > 24);
  });

  const toggleMenu = useCallback(
    (next: boolean, hash?: string) => {
      setOpen(next);
      if (next) {
        lenis?.stop();
        return;
      }
      lenis?.start();
      if (hash) {
        // Let the menu start closing, then travel to the section.
        window.setTimeout(() => {
          if (lenis) lenis.scrollTo(hash, { offset: -24, duration: 1.6 });
          else document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
        }, 250);
      }
    },
    [lenis],
  );
  const closeMenu = useCallback((hash?: string) => toggleMenu(false, hash), [toggleMenu]);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: hidden ? "-120%" : 0, opacity: 1 }}
        transition={{ duration: 0.7, ease }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
      >
        <div
          className={cn(
            "relative mx-auto flex h-14 max-w-[100rem] items-center justify-between rounded-full ps-2.5 pe-2 transition-[background-color,box-shadow,backdrop-filter] duration-500",
            scrolled && !open && "bg-background/70 shadow-[0_0_0_1px_var(--border),0_10px_40px_-12px_rgb(0_0_0/0.35)] backdrop-blur-xl",
            open && "chapter bg-transparent text-foreground",
          )}
        >
          <a
            href="#top"
            className="group relative flex items-center gap-2.5 text-[0.95rem] font-medium tracking-tight"
            onClick={() => open && toggleMenu(false)}
          >
            <span className="relative grid size-7 place-items-center rounded-full bg-accent text-[0.7rem] font-semibold text-accent-foreground transition-transform duration-500 ease-out-expo group-hover:rotate-[-12deg]">
              {t.name.short.charAt(0)}
            </span>
            <span className="hidden sm:inline">{t.name.short}</span>
          </a>

          <div className="flex items-center gap-2">
            <TehranClock className="hidden pe-2 font-mono text-xs text-muted-foreground xl:inline" />
            <CommandTrigger />
            <SoundToggle />
            <LanguageSwitch className="hidden sm:flex" />
            <ThemeToggle />
            {profile.available && (
              <a
                href="#order"
                className="hidden h-9 items-center gap-2 rounded-full bg-foreground px-4 text-sm text-background transition-colors duration-300 hover:bg-accent hover:text-accent-foreground lg:inline-flex"
              >
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7fd18b] opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[#7fd18b]" />
                </span>
                {t.available}
              </a>
            )}
            <button
              type="button"
              className="group relative flex h-9 cursor-pointer items-center gap-3 rounded-full ps-3 pe-2 text-sm ring-1 ring-border transition-colors hover:bg-foreground/5"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? t.nav.close : t.nav.open}
              onClick={() => toggleMenu(!open)}
              onMouseEnter={() => setHoverMenu(true)}
              onMouseLeave={() => setHoverMenu(false)}
            >
              <span className="hidden sm:inline">
                <Scramble text={open ? t.menu.close : t.menu.open} active={hoverMenu} locale={locale} />
              </span>
              <span className="relative block h-2.5 w-5">
                <motion.span
                  className="absolute inset-x-0 top-0 h-px bg-current"
                  animate={open ? { top: "50%", rotate: 45 } : { top: "0%", rotate: 0 }}
                  transition={{ duration: 0.5, ease }}
                />
                <motion.span
                  className="absolute inset-x-0 bottom-0 h-px bg-current"
                  animate={open ? { bottom: "50%", rotate: -45 } : { bottom: "0%", rotate: 0 }}
                  transition={{ duration: 0.5, ease }}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>{open && <Menu onNavigate={closeMenu} />}</AnimatePresence>
    </>
  );
}
