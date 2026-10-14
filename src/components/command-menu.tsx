"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Copy,
  FileText,
  Hash,
  Languages,
  LayoutGrid,
  Mail,
  Moon,
  Phone,
  Printer,
  Send,
  Sun,
} from "lucide-react";

import { useContent } from "@/content/provider";
import { navKeys } from "@/data/site";
import { useI18n } from "@/i18n/provider";
import { useLenis } from "@/components/providers/smooth-scroll";
import { useTheme } from "@/components/providers/theme";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { formatPhone } from "@/lib/phone";
import { pageHref, type Page } from "@/lib/routes";

const CommandMenuContext = createContext<() => void>(() => {});

/** Opens the palette from anywhere (header button, hero hint, …). */
export const useOpenCommandMenu = () => useContext(CommandMenuContext);

/**
 * ⌘K / Ctrl+K palette — jump to a section, open a project, copy the email,
 * switch theme or language, or go to the printable résumé.
 */
export function CommandMenu({ page = "home", children }: { page?: Page; children: React.ReactNode }) {
  const { t, locale } = useI18n();
  const { projects, profile } = useContent();
  const { theme, setTheme } = useTheme();
  const lenis = useLenis();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenis]);

  const run = useCallback((fn: () => void) => {
    setOpen(false);
    // Let the dialog close (and Lenis resume) before scrolling or navigating.
    window.setTimeout(fn, 60);
  }, []);

  const go = (hash: string) => {
    if (page !== "home") {
      location.href = `${pageHref(locale)}${hash}`;
      return;
    }
    if (hash.startsWith("#project-")) {
      location.hash = hash;
      return;
    }
    if (lenis) lenis.scrollTo(hash, { offset: -24, duration: 1.4 });
    else document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  };

  const phone = formatPhone(profile.phone, locale);
  const other = locale === "fa" ? "en" : "fa";
  const c = t.command;

  return (
    <CommandMenuContext.Provider value={() => setOpen(true)}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl overflow-hidden p-0" closeLabel={t.sheet.close}>
          <DialogTitle className="sr-only">{c.title}</DialogTitle>
          <DialogDescription className="sr-only">{c.placeholder}</DialogDescription>
          <Command loop>
            <CommandInput placeholder={c.placeholder} />
            <CommandList data-lenis-prevent>
              <CommandEmpty>{c.empty}</CommandEmpty>

              <CommandGroup heading={c.sections}>
                {[...navKeys].map((key) => (
                  <CommandItem key={key} value={`${t.nav[key]} ${key}`} onSelect={() => run(() => go(`#${key}`))}>
                    <Hash />
                    {t.nav[key]}
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading={c.projects}>
                {projects.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={`${p[locale].title} ${p.eng} ${p[locale].client}`}
                    onSelect={() => run(() => go(`#project-${p.id}`))}
                  >
                    <LayoutGrid />
                    <span className="truncate">{p[locale].title}</span>
                    {p[locale].client && (
                      <CommandShortcut className="max-w-[45%] truncate font-sans">{p[locale].client}</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading={c.contact}>
                <CommandItem
                  value={`${c.copyEmail} ${profile.email}`}
                  onSelect={() => run(() => navigator.clipboard?.writeText(profile.email))}
                >
                  <Copy />
                  {c.copyEmail}
                  <CommandShortcut className="ltr">{profile.email}</CommandShortcut>
                </CommandItem>
                <CommandItem value={`${c.email} mail`} onSelect={() => run(() => (location.href = `mailto:${profile.email}`))}>
                  <Mail />
                  {c.email}
                </CommandItem>
                {phone && (
                  <CommandItem value={`${c.call} phone`} onSelect={() => run(() => (location.href = phone.href))}>
                    <Phone />
                    {c.call}
                    <CommandShortcut className="ltr">{phone.display}</CommandShortcut>
                  </CommandItem>
                )}
                {profile.telegram && (
                  <CommandItem
                    value={`${t.contact.telegram} telegram`}
                    onSelect={() => run(() => window.open(`https://t.me/${profile.telegram}`, "_blank", "noopener"))}
                  >
                    <Send />
                    {t.contact.telegram}
                    <CommandShortcut className="ltr">@{profile.telegram}</CommandShortcut>
                  </CommandItem>
                )}
                {profile.linkedin && (
                  <CommandItem
                    value={`${t.contact.linkedin} linkedin`}
                    onSelect={() => run(() => window.open(profile.linkedin, "_blank", "noopener"))}
                  >
                    <ArrowUpRight />
                    {t.contact.linkedin}
                  </CommandItem>
                )}
              </CommandGroup>

              <CommandGroup heading={c.preferences}>
                <CommandItem
                  value={`${c.resume} resume cv`}
                  onSelect={() => run(() => (location.href = pageHref(locale, "resume")))}
                >
                  <FileText />
                  {c.resume}
                </CommandItem>
                {page === "resume" && (
                  <CommandItem value={`${c.print} print pdf`} onSelect={() => run(() => window.print())}>
                    <Printer />
                    {c.print}
                  </CommandItem>
                )}
                <CommandItem
                  value={`${theme === "dark" ? t.theme.toLight : t.theme.toDark} theme`}
                  onSelect={() => run(() => setTheme(theme === "dark" ? "light" : "dark"))}
                >
                  {theme === "dark" ? <Sun /> : <Moon />}
                  {theme === "dark" ? t.theme.toLight : t.theme.toDark}
                </CommandItem>
                <CommandItem
                  value={`${c.language} language`}
                  onSelect={() => run(() => (location.href = pageHref(other, page)))}
                >
                  <Languages />
                  {c.language}
                </CommandItem>
              </CommandGroup>
            </CommandList>
            <div className="flex items-center justify-between border-t px-4 py-2.5 text-[0.7rem] text-muted-foreground">
              <span>{c.hint}</span>
              <kbd className="ltr rounded border px-1.5 py-0.5 font-mono">Ctrl K</kbd>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </CommandMenuContext.Provider>
  );
}
