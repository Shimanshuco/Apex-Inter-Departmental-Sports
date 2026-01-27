export default function ScoresFilterBar() {
  return (
    <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-b border-slate-600/50">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Scores & Results
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/80 mt-1">
              Track all matches and scores in real-time
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <select className="rounded-lg bg-white/10 border border-white/20 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white focus:ring-2 focus:ring-emerald-400 focus:outline-none backdrop-blur-sm">
              <option className="text-slate-900">All Sports</option>
              <option className="text-slate-900">Football</option>
              <option className="text-slate-900">Volleyball</option>
              <option className="text-slate-900">Basketball</option>
              <option className="text-slate-900">Cricket</option>
              <option className="text-slate-900">Kabaddi</option>
              <option className="text-slate-900">Badminton</option>
              <option className="text-slate-900">Chess</option>
              <option className="text-slate-900">Kho Kho</option>
              <option className="text-slate-900">Table Tennis</option>
              <option className="text-slate-900">Tug of War</option>
              <option className="text-slate-900">Athletics</option>
            </select>

            <select className="rounded-lg bg-white/10 border border-white/20 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white focus:ring-2 focus:ring-emerald-400 focus:outline-none backdrop-blur-sm">
              <option className="text-slate-900">All Status</option>
              <option className="text-slate-900">Live</option>
              <option className="text-slate-900">Completed</option>
              <option className="text-slate-900">Upcoming</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
