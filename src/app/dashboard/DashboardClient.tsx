"use client";

import { useRouter } from "next/navigation";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  next_review_date: string;
  review_count: number;
  leetcode_url: string;
}

interface Props {
  shownProblems: Problem[];
  queueCount: number;
  recentProblems: Problem[];
  dailyCommitment: number;
}

function difficultyColor(d: string) {
  if (d === "easy") return "text-green-400";
  if (d === "medium") return "text-yellow-400";
  return "text-red-400";
}

function daysOverdue(dateStr: string) {
  const today = new Date();
  const due = new Date(dateStr);
  const diff = Math.floor(
    (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Due today";
  if (diff > 0) return `${diff}d overdue`;
  return `Due in ${Math.abs(diff)}d`;
}

export default function DashboardClient({
  shownProblems,
  queueCount,
  recentProblems,
  dailyCommitment,
}: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">DSA Shadow</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/settings")}
            className="bg-zinc-800 hover:bg-zinc-700 text-sm px-4 py-2 rounded-lg transition"
          >
            Settings
          </button>
          <button
            onClick={() => router.push("/add-question")}
            className="bg-violet-600 hover:bg-violet-500 text-sm px-4 py-2 rounded-lg transition"
          >
            + Add Problem
          </button>
        </div>
      </div>

      {/* Due for review */}
      <section className="mb-8">
        <h2 className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
          Due for Review — {shownProblems.length}/{dailyCommitment}
        </h2>

        {shownProblems.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl p-6 text-center">
            <p className="text-zinc-400 text-sm">
              Nothing due today. Add a problem or come back tomorrow.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shownProblems.map((p) => (
              <div
                key={p.id}
                className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-medium text-sm">{p.title}</p>
                  <div className="flex gap-3 mt-1">
                    <span
                      className={`text-xs font-medium ${difficultyColor(p.difficulty)}`}
                    >
                      {p.difficulty}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      {daysOverdue(p.next_review_date)}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      Reviewed {p.review_count}x
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/review/${p.id}`)}
                  className="bg-violet-600 hover:bg-violet-500 text-xs px-3 py-2 rounded-lg transition"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        )}

        {queueCount > 0 && (
          <p className="text-zinc-500 text-xs mt-3 text-center">
            +{queueCount} more in queue — finish today's first
          </p>
        )}
      </section>

      {/* Recently added */}
      <section>
        <h2 className="text-zinc-400 text-sm font-medium mb-3 uppercase tracking-wide">
          Recently Added
        </h2>
        {recentProblems.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl p-6 text-center">
            <p className="text-zinc-400 text-sm">No problems tracked yet.</p>
            <button
              onClick={() => router.push("/add-question")}
              className="mt-3 text-violet-400 text-sm hover:underline"
            >
              Add your first problem →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentProblems.map((p) => (
              <div
                key={p.id}
                className="bg-zinc-900 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                <p className="text-sm text-white">{p.title}</p>
                <span
                  className={`text-xs font-medium ${difficultyColor(p.difficulty)}`}
                >
                  {p.difficulty}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
