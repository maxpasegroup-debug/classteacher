type InstitutionCardProps = {
  institution: string;
  location: string;
  programs: number;
};

export default function InstitutionCard({ institution, location, programs }: InstitutionCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{institution}</p>
      <p className="mt-1 text-sm text-slate-500">{location}</p>
      <p className="mt-3 text-xs text-slate-600">{programs} active learning programs</p>
    </article>
  );
}
