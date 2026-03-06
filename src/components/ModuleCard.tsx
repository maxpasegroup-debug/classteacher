import Link from "next/link";

type ModuleCardProps = {
  title: string;
  description: string;
  href: string;
  badge?: string;
};

export default function ModuleCard({ title, description, href, badge }: ModuleCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-100 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        {badge ? (
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            {badge}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
