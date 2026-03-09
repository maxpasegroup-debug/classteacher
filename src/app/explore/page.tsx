import Header from "@/components/Header";

const institutions = [
  {
    title: "Roots World School",
    description: "A K-12 school focused on academic excellence and values-based learning."
  },
  {
    title: "Roots Tuition Centres",
    description: "After-school coaching programs with personalized support across core subjects."
  },
  {
    title: "ACE Allied Health College",
    description: "Career-driven health education with practical training for modern care environments."
  },
  {
    title: "MIPS Paramedical Institute",
    description: "Specialized paramedical pathways designed for clinical readiness and confidence."
  }
];

export default function ExplorePage() {
  return (
    <>
      <Header title="Explore Roots" subtitle="Discover trusted learning institutions" />
      <main className="space-y-4 px-4 py-5 md:px-0">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Roots Education Hub</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Building Futures Through Knowledge</h2>
          <p className="mt-2 text-sm text-slate-600">
            Explore institutions under the Roots network and find the right path for your learning journey.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Institutions</h3>
            <span className="text-xs text-slate-500">{institutions.length} available</span>
          </div>

          {/* Mobile: horizontal scroll, Desktop: grid */}
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:snap-none md:overflow-visible md:px-0 md:pb-0 md:grid-cols-2 lg:grid-cols-3">
            {institutions.map((institution) => (
              <article
                key={institution.title}
                className="w-[85%] shrink-0 snap-start rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:w-full md:shrink md:snap-none"
              >
                <div className="h-36 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 md:h-40" />
                <h4 className="mt-4 text-base font-semibold text-slate-900">{institution.title}</h4>
                <p className="mt-2 text-sm leading-5 text-slate-600">{institution.description}</p>
                <button
                  type="button"
                  className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Explore programs
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
