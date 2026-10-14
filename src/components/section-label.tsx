import { cn } from "@/lib/utils";

export function SectionLabel({
  index,
  children,
  className,
}: {
  index: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-reveal className={cn("flex items-center gap-3 self-start text-sm", className)}>
      <span className="font-mono text-xs text-stone">({index})</span>
      <span className="h-px w-8 bg-current/30" />
      <span>{children}</span>
    </div>
  );
}
