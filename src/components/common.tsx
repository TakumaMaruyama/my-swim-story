import Link from "next/link";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] bg-white/85 p-6 shadow-[0_18px_60px_rgba(14,116,144,0.10)] ring-1 ring-cyan-100 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold tracking-[0.24em] text-cyan-600">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="max-w-3xl text-sm leading-7 text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function SectionCard({ title, description, children, footer }: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-100">
      <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      <div className="space-y-5 px-6 py-6">{children}</div>
      {footer ? <div className="border-t border-slate-100 px-6 py-4">{footer}</div> : null}
    </section>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-cyan-200 bg-cyan-50/70 px-5 py-6 text-sm text-slate-600">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-2 leading-6">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-medium text-cyan-700 transition hover:border-cyan-300 hover:text-cyan-800"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function StatusBadge({
  tone = "slate",
  children,
}: {
  tone?: "cyan" | "emerald" | "amber" | "rose" | "slate";
  children: React.ReactNode;
}) {
  const className = {
    cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
  }[tone];

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${className}`}>
      {children}
    </span>
  );
}

export function FieldLabel({
  htmlFor,
  label,
  hint,
}: {
  htmlFor?: string;
  label: string;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block space-y-1">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      {hint ? <span className="block text-xs leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function FormHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-5 text-slate-500">{children}</p>;
}

export function SummaryMetric({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_14px_50px_rgba(8,47,73,0.08)] ring-1 ring-cyan-100">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      {subtext ? <p className="mt-2 text-xs text-slate-500">{subtext}</p> : null}
    </div>
  );
}

export function AlertBanner({
  tone,
  message,
}: {
  tone: "success" | "error";
  message: string;
}) {
  return (
    <div
      className={`rounded-[1.25rem] px-4 py-3 text-sm ${
        tone === "success"
          ? "border border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border border-rose-100 bg-rose-50 text-rose-700"
      }`}
    >
      {message}
    </div>
  );
}
