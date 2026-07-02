import { useEffect, useMemo, useState } from "react";
import { Plus, ListPlus, Check, RotateCcw, Sparkles } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────

type Energy = "Low" | "Medium" | "High";
type ListName = "Home" | "Work" | "Personal";

interface Subtask {
  id: string;
  label: string;
  done: boolean;
}

interface Task {
  id: string;
  name: string;
  energy: Energy;
  time: string;
  list: ListName;
  done: boolean;
  createdAt: number;
  subtasks: Subtask[];
}

const STORAGE_KEY = "adhd-tasks-v1";

const LIST_COLORS: Record<ListName, string> = {
  Home: "bg-sage/15 text-sagedeep border-sage/40",
  Work: "bg-terracotta/15 text-terracotta border-terracotta/40",
  Personal: "bg-sky/15 text-sky border-sky/40",
};

const LIST_DOT: Record<ListName, string> = {
  Home: "bg-sage",
  Work: "bg-terracotta",
  Personal: "bg-sky",
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedTasks();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return seedTasks();
  } catch {
    return seedTasks();
  }
}

function seedTasks(): Task[] {
  return [
    {
      id: uid(),
      name: "Reply to Mia's email",
      energy: "Low",
      time: "5 min",
      list: "Work",
      done: false,
      createdAt: Date.now() - 4000,
      subtasks: [],
    },
    {
      id: uid(),
      name: "Fold laundry",
      energy: "Low",
      time: "15 min",
      list: "Home",
      done: false,
      createdAt: Date.now() - 3000,
      subtasks: [],
    },
    {
      id: uid(),
      name: "Prep dinner ingredients",
      energy: "Medium",
      time: "15 min",
      list: "Home",
      done: false,
      createdAt: Date.now() - 2000,
      subtasks: [],
    },
    {
      id: uid(),
      name: "Finish Moodboard PR",
      energy: "High",
      time: "1 hr",
      list: "Work",
      done: false,
      createdAt: Date.now() - 1000,
      subtasks: [],
    },
  ];
}

// ── App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [addOpen, setAddOpen] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const pending = useMemo(
    () => tasks.filter((t) => !t.done).sort((a, b) => a.createdAt - b.createdAt),
    [tasks]
  );
  const focusTask = pending[0] ?? null;
  const upNext = pending.slice(1, 4);
  const doneToday = tasks.filter((t) => t.done).length;

  function completeTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: true } : t)));
  }

  function undoLast() {
    const lastDone = [...tasks].filter((t) => t.done).sort((a, b) => b.createdAt - a.createdAt)[0];
    if (lastDone) {
      setTasks((prev) => prev.map((t) => (t.id === lastDone.id ? { ...t, done: false } : t)));
    }
  }

  function addTask(newTask: Omit<Task, "id" | "createdAt" | "done" | "subtasks">) {
    setTasks((prev) => [
      ...prev,
      { ...newTask, id: uid(), createdAt: Date.now(), done: false, subtasks: [] },
    ]);
  }

  function addSubtasks(taskId: string, labels: string[]) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: [
                ...t.subtasks,
                ...labels.filter(Boolean).map((label) => ({ id: uid(), label, done: false })),
              ],
            }
          : t
      )
    );
  }

  function toggleSubtask(taskId: string, subId: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)),
            }
          : t
      )
    );
  }

  return (
    <div className="min-h-screen bg-cream text-ink font-sans">
      <div className="mx-auto max-w-md min-h-screen flex flex-col px-6 pt-14 pb-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-muted">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="font-display text-3xl font-semibold leading-tight mt-1">
              One thing at a time.
            </h1>
          </div>
        </div>

        {doneToday > 0 && (
          <button
            onClick={undoLast}
            className="self-start mb-5 flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors"
          >
            <RotateCcw size={12} />
            {doneToday} done today · undo last
          </button>
        )}

        {/* Focus card */}
        {focusTask ? (
          <div className="rounded-xl2 border-[1.5px] border-sage/40 bg-sage/[0.08] p-5 mb-6">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-sagedeep mb-3">
              RIGHT NOW
            </p>
            <div className="flex items-center gap-3">
              <button
                aria-label="Mark task complete"
                onClick={() => completeTask(focusTask.id)}
                className="shrink-0 w-8 h-8 rounded-full border-2 border-sage bg-white flex items-center justify-center hover:bg-sage/20 active:scale-95 transition"
              >
                <Check size={16} className="text-sage opacity-0 hover:opacity-100" />
              </button>
              <p className="font-display text-xl font-semibold leading-snug">
                {focusTask.name}
              </p>
            </div>
            <p className="text-[13px] text-muted mt-2 ml-11">
              Est. {focusTask.time} · {focusTask.energy} energy needed
            </p>

            {focusTask.subtasks.length > 0 && (
              <div className="mt-4 ml-11 space-y-2">
                {focusTask.subtasks.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSubtask(focusTask.id, s.id)}
                    className="flex items-center gap-2 text-left w-full"
                  >
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        s.done ? "bg-sage border-sage" : "border-muted/50 bg-white"
                      }`}
                    >
                      {s.done && <Check size={10} className="text-white" />}
                    </span>
                    <span className={`text-sm ${s.done ? "line-through text-muted" : "text-ink"}`}>
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setBreakdownOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-terracotta shadow-sm hover:shadow transition-shadow"
            >
              <Sparkles size={14} />
              Break this into steps
            </button>
          </div>
        ) : (
          <div className="rounded-xl2 border-[1.5px] border-sage/40 bg-sage/[0.08] p-6 mb-6 text-center">
            <p className="font-display text-xl font-semibold mb-1">All clear.</p>
            <p className="text-sm text-muted">Nothing on your plate right now. Nice work.</p>
          </div>
        )}

        {/* Up next */}
        {upNext.length > 0 && (
          <>
            <p className="font-semibold text-sm mb-3">Up next ({upNext.length})</p>
            <div className="space-y-2.5 mb-6">
              {upNext.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5"
                >
                  <button
                    aria-label="Mark task complete"
                    onClick={() => completeTask(t.id)}
                    className="shrink-0 w-5 h-5 rounded-full border-[1.5px] border-muted/50 bg-white hover:border-sage transition-colors"
                  />
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium truncate">{t.name}</p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${LIST_COLORS[t.list]}`}
                    >
                      {t.list}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex-1" />

      </div>

      {/* Quick-add FAB */}
      <button
        onClick={() => setAddOpen(true)}
        aria-label="Add task"
        className="fixed bottom-8 right-6 sm:right-[calc(50%-224px+24px)] w-14 h-14 rounded-full bg-terracotta text-white flex items-center justify-center shadow-lg shadow-terracotta/30 active:scale-95 transition"
      >
        <Plus size={26} />
      </button>

      {addOpen && (
        <QuickAddSheet
          onClose={() => setAddOpen(false)}
          onSave={(task) => {
            addTask(task);
            setAddOpen(false);
          }}
        />
      )}

      {breakdownOpen && focusTask && (
        <BreakdownSheet
          taskName={focusTask.name}
          onClose={() => setBreakdownOpen(false)}
          onSave={(labels) => {
            addSubtasks(focusTask.id, labels);
            setBreakdownOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ── Quick Add Sheet ──────────────────────────────────────────────────────

function QuickAddSheet({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (task: Omit<Task, "id" | "createdAt" | "done" | "subtasks">) => void;
}) {
  const [name, setName] = useState("");
  const [energy, setEnergy] = useState<Energy>("Low");
  const [time, setTime] = useState("15 min");
  const [list, setList] = useState<ListName>("Home");

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), energy, time, list });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center sm:justify-center">
      <div className="w-full sm:max-w-md bg-cream rounded-t-3xl sm:rounded-3xl px-6 pt-6 pb-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="text-[15px] font-medium text-muted">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="text-[15px] font-semibold text-terracotta disabled:text-muted/40"
          >
            Save
          </button>
        </div>

        <textarea
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What's on your mind?"
          rows={2}
          className="w-full resize-none rounded-xl2 border-[1.5px] border-terracotta/50 bg-white px-4 py-4 text-lg font-medium placeholder:text-muted focus:outline-none focus:border-terracotta"
        />
        <p className="text-xs text-muted mt-2 mb-6">
          Everything below is optional — just tap Save.
        </p>

        <ChipGroup
          label="Energy needed"
          options={["Low", "Medium", "High"] as Energy[]}
          value={energy}
          onChange={setEnergy}
        />
        <ChipGroup
          label="Roughly how long?"
          options={["2 min", "15 min", "1 hr", "Not sure"]}
          value={time}
          onChange={setTime}
        />
        <ChipGroup
          label="List"
          options={["Home", "Work", "Personal"] as ListName[]}
          value={list}
          onChange={setList}
          dotColors={LIST_DOT}
        />

        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full mt-6 rounded-2xl bg-terracotta disabled:bg-muted/30 text-white font-semibold py-4 text-[16px] active:scale-[0.99] transition"
        >
          Add task
        </button>
      </div>
    </div>
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  dotColors,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  dotColors?: Record<string, string>;
}) {
  return (
    <div className="mb-5">
      <p className="text-[13px] font-semibold mb-2.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-medium border transition-colors ${
                selected
                  ? "bg-terracotta/15 border-terracotta text-ink"
                  : "bg-white border-line text-muted"
              }`}
            >
              {dotColors && (
                <span className={`w-2 h-2 rounded-full ${dotColors[opt]}`} />
              )}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Breakdown Sheet ──────────────────────────────────────────────────────

function BreakdownSheet({
  taskName,
  onClose,
  onSave,
}: {
  taskName: string;
  onClose: () => void;
  onSave: (labels: string[]) => void;
}) {
  const [steps, setSteps] = useState<string[]>(["", "", ""]);

  function updateStep(i: number, val: string) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? val : s)));
  }

  function addStepField() {
    setSteps((prev) => [...prev, ""]);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center sm:justify-center">
      <div className="w-full sm:max-w-md bg-cream rounded-t-3xl sm:rounded-3xl px-6 pt-6 pb-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onClose} className="text-[15px] font-medium text-muted">
            Cancel
          </button>
          <button
            onClick={() => onSave(steps)}
            className="text-[15px] font-semibold text-terracotta"
          >
            Save
          </button>
        </div>
        <p className="font-display text-xl font-semibold mb-1">Break it down</p>
        <p className="text-sm text-muted mb-5 truncate">{taskName}</p>

        <div className="space-y-2.5">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-white border border-line flex items-center justify-center text-xs font-medium text-muted shrink-0">
                {i + 1}
              </span>
              <input
                value={s}
                onChange={(e) => updateStep(i, e.target.value)}
                placeholder={`Step ${i + 1}`}
                className="flex-1 rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] placeholder:text-muted/60 focus:outline-none focus:border-terracotta"
              />
            </div>
          ))}
        </div>

        <button
          onClick={addStepField}
          className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-terracotta"
        >
          <ListPlus size={15} />
          Add another step
        </button>
      </div>
    </div>
  );
}
