type ProgressCardProps = {
  title: string;
  progress: number;
  nextStep: string;
};

export default function ProgressCard({ title, progress, nextStep }: ProgressCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <span className="text-sm font-medium text-brand-700">{progress}%</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-xs text-slate-600">Next: {nextStep}</p>
    </article>
  );
}
