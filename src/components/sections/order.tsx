"use client";

import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Copy, Mail, RotateCcw, Send } from "lucide-react";

import { Split } from "@/components/motion/split";
import { SectionLabel } from "@/components/section-label";
import { Button } from "@/components/ui/button";
import { useContent } from "@/content/provider";
import { useSectionMotion } from "@/hooks/use-section-motion";
import { useI18n } from "@/i18n/provider";
import { formatOrder, type OrderRequest } from "@/lib/order";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;
const staticHtml = !!process.env.NEXT_PUBLIC_STATIC_HTML;

type Fields = Omit<OrderRequest, "locale">;
const empty: Fields = { type: "", space: "", details: "", budget: "", timeline: "", name: "", org: "", phone: "", contact: "" };
type Status = "idle" | "sending" | "done" | "fallback";

/**
 * Four short steps — kind of work, space, details, contact — that land in
 * Telegram or n8n via /api/order. Without a server (or before the bot is set
 * up) the finished request is offered as an email, a Telegram message or text
 * to copy, so nothing typed is ever lost.
 */
export function Order() {
  const { t, n, locale } = useI18n();
  const { services, profile } = useContent();
  const o = t.order;
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [fields, setFields] = useState<Fields>(empty);
  const [error, setError] = useState<keyof Fields | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);
  const trap = useRef<HTMLInputElement>(null);
  useSectionMotion(root);

  const set = (key: keyof Fields, value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (error === key) setError(null);
  };

  const spaces = [...services[locale].packages.map((p) => p.title), o.spaceOther];
  const required: (keyof Fields)[][] = [["type"], ["space"], ["details"], ["name", "phone"]];
  const text = formatOrder({ ...fields, locale });

  const go = (to: number) => {
    if (to > step) {
      const missing = required[step].find((k) => !fields[k].trim());
      if (missing) {
        setError(missing);
        root.current?.querySelector<HTMLElement>(`[data-field="${missing}"]`)?.focus();
        return;
      }
    }
    setDir(to > step ? 1 : -1);
    setStep(to);
  };

  const submit = async () => {
    const missing = required[3].find((k) => !fields[k].trim());
    if (missing) {
      setError(missing);
      return;
    }
    if (staticHtml) {
      setStatus("fallback");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...fields, locale, website: trap.current?.value ?? "" }),
      });
      setStatus(res.ok ? "done" : "fallback");
    } catch {
      setStatus("fallback");
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* the text is visible on screen to select by hand */
    }
  };

  const restart = () => {
    setFields(empty);
    setStep(0);
    setDir(-1);
    setStatus("idle");
  };

  const Next = locale === "fa" ? ArrowLeft : ArrowRight;
  const Prev = locale === "fa" ? ArrowRight : ArrowLeft;

  return (
    <section ref={root} id="order" className="px-4 pt-28 pb-36 sm:px-6 md:pt-40 md:pb-48">
      <div className="mx-auto grid max-w-[100rem] gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <SectionLabel index={n("07")}>{o.label}</SectionLabel>
          <h2 className="mt-10 font-display text-[clamp(2.8rem,6vw,6.5rem)] leading-[0.95]">
            <Split as="span" lines={[o.heading[0]]} className="block" />
            <Split as="span" lines={[o.heading[1]]} className={cn("foil block", locale === "en" && "italic")} delay={0.1} />
          </h2>
          <p data-reveal className="mt-8 max-w-md leading-8 text-foreground-2">
            {o.intro}
          </p>
        </div>

        <div data-reveal className="edge relative overflow-hidden rounded-3xl bg-card/70 p-6 sm:p-10 md:col-span-7">
          {status === "done" || status === "fallback" ? (
            <Result
              status={status}
              text={text}
              email={profile.email}
              telegram={profile.telegram}
              copied={copied}
              onCopy={copyText}
              onRestart={restart}
            />
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (step < 3) go(step + 1);
                else submit();
              }}
            >
              {/* Progress */}
              <ol className="grid grid-cols-4 gap-2">
                {o.steps.map((label, i) => (
                  <li key={label}>
                    <button
                      type="button"
                      disabled={i > step}
                      onClick={() => go(i)}
                      aria-current={i === step ? "step" : undefined}
                      className="group w-full cursor-pointer text-start disabled:cursor-default"
                    >
                      <span className="block h-0.5 overflow-hidden rounded-full bg-border">
                        <motion.span
                          className="block h-full origin-right bg-accent ltr:origin-left"
                          initial={false}
                          animate={{ scaleX: i <= step ? 1 : 0 }}
                          transition={{ duration: 0.6, ease }}
                        />
                      </span>
                      <span
                        className={cn(
                          "mt-3 block truncate text-xs transition-colors",
                          i === step ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        <span className="font-mono">{n(i + 1)}</span> · {label}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>

              <div className="relative mt-10 min-h-[22rem]">
                <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                  <motion.fieldset
                    key={step}
                    custom={dir}
                    variants={{
                      enter: (d: number) => ({ opacity: 0, x: (locale === "fa" ? -1 : 1) * d * 40, filter: "blur(6px)" }),
                      center: { opacity: 1, x: 0, filter: "blur(0px)" },
                      exit: (d: number) => ({ opacity: 0, x: (locale === "fa" ? 1 : -1) * d * 40, filter: "blur(6px)" }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.55, ease }}
                  >
                    <legend className="font-display text-3xl md:text-4xl">{o.steps[step]}</legend>

                    {step === 0 && (
                      <Choices
                        field="type"
                        value={fields.type}
                        options={Object.values(o.types)}
                        onChange={(v) => set("type", v)}
                        invalid={error === "type"}
                      />
                    )}
                    {step === 1 && (
                      <Choices
                        field="space"
                        value={fields.space}
                        options={spaces}
                        onChange={(v) => set("space", v)}
                        invalid={error === "space"}
                      />
                    )}
                    {step === 2 && (
                      <div className="mt-6 space-y-6">
                        <Field label={o.details} hint={o.detailsHint} error={error === "details" ? o.required : undefined}>
                          <textarea
                            data-field="details"
                            rows={4}
                            value={fields.details}
                            onChange={(e) => set("details", e.target.value)}
                            aria-invalid={error === "details"}
                            className={inputClass}
                          />
                        </Field>
                        <div>
                          <p className="text-sm text-muted-foreground">{o.budget}</p>
                          <Chips value={fields.budget} options={o.budgets} onChange={(v) => set("budget", v)} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{o.timeline}</p>
                          <Chips value={fields.timeline} options={o.timelines} onChange={(v) => set("timeline", v)} />
                        </div>
                      </div>
                    )}
                    {step === 3 && (
                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <Field label={o.name} error={error === "name" ? o.required : undefined}>
                          <input
                            data-field="name"
                            autoComplete="name"
                            value={fields.name}
                            onChange={(e) => set("name", e.target.value)}
                            aria-invalid={error === "name"}
                            className={inputClass}
                          />
                        </Field>
                        <Field label={o.org}>
                          <input
                            autoComplete="organization"
                            value={fields.org}
                            onChange={(e) => set("org", e.target.value)}
                            className={inputClass}
                          />
                        </Field>
                        <Field label={o.phone} error={error === "phone" ? o.required : undefined}>
                          <input
                            data-field="phone"
                            type="tel"
                            dir="ltr"
                            autoComplete="tel"
                            inputMode="tel"
                            value={fields.phone}
                            onChange={(e) => set("phone", e.target.value)}
                            aria-invalid={error === "phone"}
                            className={cn(inputClass, "text-start")}
                          />
                        </Field>
                        <Field label={o.email}>
                          <input
                            dir="ltr"
                            autoComplete="email"
                            value={fields.contact}
                            onChange={(e) => set("contact", e.target.value)}
                            className={cn(inputClass, "text-start")}
                          />
                        </Field>
                        {/* Honeypot */}
                        <input ref={trap} name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
                      </div>
                    )}
                  </motion.fieldset>
                </AnimatePresence>
              </div>

              <div className="mt-8 flex items-center justify-between gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => go(step - 1)}
                  className={cn(step === 0 && "invisible")}
                >
                  <Prev />
                  {o.back}
                </Button>
                <Button type="submit" variant="accent" size="lg" disabled={status === "sending"} className="group">
                  {step < 3 ? o.next : status === "sending" ? o.sending : o.send}
                  {step < 3 ? (
                    <Next className="transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  ) : (
                    <Send className="rtl:-scale-x-100" />
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

const inputClass =
  "w-full rounded-xl bg-background/60 px-4 py-3 text-base ring-1 ring-border transition-shadow outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-accent aria-[invalid=true]:ring-red-400/70";

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="mt-2 block">{children}</span>
      {(error || hint) && (
        <span className={cn("mt-2 block text-xs", error ? "text-red-400" : "text-muted-foreground")}>{error || hint}</span>
      )}
    </label>
  );
}

function Choices({
  field,
  value,
  options,
  onChange,
  invalid,
}: {
  field: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  invalid: boolean;
}) {
  const { t } = useI18n();
  return (
    <div>
      <div role="radiogroup" aria-invalid={invalid} className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {options.map((label, i) => {
          const on = value === label;
          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={on}
              data-field={i === 0 ? field : undefined}
              onClick={() => onChange(label)}
              className={cn(
                "group relative flex min-h-14 cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-start ring-1 transition-[box-shadow,background-color] duration-300",
                on ? "bg-accent/10 ring-accent" : "ring-border hover:bg-foreground/[0.03] hover:ring-foreground/25",
              )}
            >
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full ring-1 transition-colors",
                  on ? "bg-accent text-accent-foreground ring-accent" : "ring-border",
                )}
              >
                {on && <Check className="size-3" strokeWidth={3} />}
              </span>
              <span className="text-[0.95rem]">{label}</span>
            </button>
          );
        })}
      </div>
      {invalid && <p className="mt-3 text-xs text-red-400">{t.order.required}</p>}
    </div>
  );
}

function Chips({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((label) => (
        <button
          key={label}
          type="button"
          aria-pressed={value === label}
          onClick={() => onChange(value === label ? "" : label)}
          className={cn(
            "h-9 cursor-pointer rounded-full px-4 text-sm ring-1 transition-colors",
            value === label
              ? "bg-accent text-accent-foreground ring-accent"
              : "text-foreground-2 ring-border hover:ring-foreground/30",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Result({
  status,
  text,
  email,
  telegram,
  copied,
  onCopy,
  onRestart,
}: {
  status: "done" | "fallback";
  text: string;
  email: string;
  telegram?: string;
  copied: boolean;
  onCopy: () => void;
  onRestart: () => void;
}) {
  const { t } = useI18n();
  const o = t.order;
  const subject = encodeURIComponent(text.split("\n")[0].replace(/—/g, "").trim());
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} aria-live="polite">
      <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
        <Check className="size-5" strokeWidth={2.5} />
      </span>
      <h3 className="mt-6 font-display text-4xl">{status === "done" ? o.doneTitle : o.fallbackTitle}</h3>
      <p className="mt-3 max-w-md leading-8 text-foreground-2">{status === "done" ? o.doneBody : o.fallbackBody}</p>

      {status === "fallback" && (
        <>
          <pre className="mt-6 max-h-72 overflow-auto rounded-xl bg-background/60 p-4 font-sans text-sm leading-7 whitespace-pre-wrap text-foreground-2 ring-1 ring-border">
            {text}
          </pre>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="accent">
              <a href={`mailto:${email}?subject=${subject}&body=${encodeURIComponent(text)}`}>
                <Mail />
                {o.viaEmail}
              </a>
            </Button>
            {telegram && (
              <Button asChild variant="outline">
                <a
                  href={`https://t.me/${telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onCopy}
                >
                  <Send className="rtl:-scale-x-100" />
                  {o.viaTelegram}
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={onCopy}>
              {copied ? <Check /> : <Copy />}
              {copied ? t.contact.copied : o.copy}
            </Button>
          </div>
        </>
      )}

      <Button variant="ghost" onClick={onRestart} className="mt-8">
        <RotateCcw />
        {o.restart}
      </Button>
    </motion.div>
  );
}
