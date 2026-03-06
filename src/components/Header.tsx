type HeaderProps = {
  title: string;
  subtitle?: string;
};

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto w-full max-w-md px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="View notifications"
          >
            <span aria-hidden>🔔</span>
          </button>
        </div>
      </div>
    </header>
  );
}
