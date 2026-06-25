import { Card } from "@/components/ui/card";

export function TaskChallengeExplainer() {
  return (
    <Card className="space-y-4 border-zinc-800 bg-zinc-900/40 p-4 sm:p-5">
      <div>
        <h2 className="text-sm font-semibold text-zinc-100">
          Task or repeating routine?
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Pick the right shape of work before you fill in the details.
        </p>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
          <dt className="text-sm font-semibold text-amber-400">Task</dt>
          <dd className="mt-1 text-sm text-zinc-300">Do this once.</dd>
          <dd className="mt-2 text-xs text-zinc-500">
            Example: Clean bedroom today · Read 20 pages tonight
          </dd>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
          <dt className="text-sm font-semibold text-violet-300">
            Challenge (routine)
          </dt>
          <dd className="mt-1 text-sm text-zinc-300">Repeat this pattern over time.</dd>
          <dd className="mt-2 text-xs text-zinc-500">
            Example: Clean bedroom every Sunday · Read 20 pages every weekday
          </dd>
        </div>
      </dl>
      <p className="text-xs text-zinc-500">
        Cubs see one-time work under <span className="text-zinc-400">Tasks</span>{" "}
        and repeating habits under <span className="text-zinc-400">Routines</span>.
        You review and approve both the same way.
      </p>
    </Card>
  );
}
