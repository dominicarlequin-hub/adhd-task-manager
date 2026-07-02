import { useEffect, useMemo, useState } from "react";
import { Plus, ListPlus, Check, RotateCcw, Sparkles, Pencil, Trash2 } from "lucide-react";

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
  Home: "bg-sage text-white",
  Work: "bg-terracotta text-white",
  Personal: "bg-sky text-white",
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

// ── App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [addOpen, setAddOpen] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  function updateTask(id: string, updates: Partial<Pick<Task, "name" | "energy" | "time" | "list">>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }

  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
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
            <p className="text-sm font-semibold text-muted">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="font-display text-[40px] leading-[0.95] font-bold text-terracotta mt-1">
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

        {/* First-time onboarding — no tasks ever added */}
        {tasks.length === 0 && (
          <div className="relative rounded-[26px] bg-focuscard p-6 mb-6 text-center shadow-[0_6px_0_#E4C98E,0_8px_16px_rgba(180,130,60,0.15)]">
            <p className="font-display text-3xl font-bold text-terracotta mb-2">Nothing here yet.</p>
            <p className="text-sm font-semibold text-muted mb-1">
              Whatever's on your mind — big or tiny — just get it out of your head.
            </p>
            <p className="text-sm font-bold text-golddeep mt-3">
              Tap the + button below to add your first task ↘
            </p>
          </div>
        )}

        {/* Focus card */}
        {tasks.length > 0 && focusTask ? (
          <div className="rounded-[26px] bg-focuscard p-5 mb-6 shadow-[0_6px_0_#E4C98E,0_8px_16px_rgba(180,130,60,0.15)]">
            <div className="flex items-center justify-between mb-3">
              <p className="inline-block text-[10px] font-extrabold tracking-[0.1em] text-golddeep bg-goldpill rounded-lg px-2 py-1">
                RIGHT NOW
              </p>
              <button
                aria-label="Edit task"
                onClick={() => setEditingTask(focusTask)}
                className="text-muted hover:text-ink transition-colors"
              >
                <Pencil size={14} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                aria-label="Mark task complete"
                onClick={() => completeTask(focusTask.id)}
                className="shrink-0 w-[26px] h-[26px] rounded-full border-2 border-gold bg-white flex items-center justify-center hover:bg-gold/20 active:scale-95 transition"
              >
                <Check size={14} className="text-golddeep opacity-0 hover:opacity-100" />
              </button>
              <p className="text-[17px] font-bold leading-snug text-ink">
                {focusTask.name}
              </p>
            </div>
            <p className="text-[12px] font-semibold text-muted mt-2 ml-9">
              Est. {focusTask.time} · {focusTask.energy} energy needed
            </p>

            {focusTask.subtasks.length > 0 && (
              <div className="mt-4 ml-9 space-y-2">
                {focusTask.subtasks.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSubtask(focusTask.id, s.id)}
                    className="flex items-center gap-2 text-left w-full"
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        s.done ? "bg-sage border-sage" : "border-gold/60 bg-white"
                      }`}
                    >
                      {s.done && <Check size={10} className="text-white" />}
                    </span>
                    <span className={`text-sm font-medium ${s.done ? "line-through text-muted" : "text-ink"}`}>
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setBreakdownOpen(true)}
              className="mt-4 ml-9 inline-flex items-center gap-1.5 rounded-2xl bg-terracotta px-3.5 py-2 text-[12px] font-bold text-white shadow-[0_3px_0_#8F4436] active:translate-y-[2px] active:shadow-none transition"
            >
              <Sparkles size={13} />
              Break this into steps
            </button>
          </div>
        ) : tasks.length > 0 ? (
          <div className="rounded-[26px] bg-focuscard p-6 mb-6 text-center shadow-[0_6px_0_#E4C98E,0_8px_16px_rgba(180,130,60,0.15)]">
            <p className="font-display text-3xl font-bold text-terracotta mb-1">All clear.</p>
            <p className="text-sm font-semibold text-muted">Nothing on your plate right now. Nice work.</p>
          </div>
        ) : null}

        {/* Up next */}
        {upNext.length > 0 && (
          <>
            <p className="font-extrabold text-sm mb-3 text-ink">Up next ({upNext.length})</p>
            <div className="space-y-2.5 mb-6">
              {upNext.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-[0_3px_0_#DDD2C2]"
                >
                  <button
                    aria-label="Mark task complete"
                    onClick={() => completeTask(t.id)}
                    className="shrink-0 w-[18px] h-[18px] rounded-full border-2 border-muted/50 bg-white hover:border-gold transition-colors"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold truncate text-ink">{t.name}</p>
                    <span
                      className={`inline-block mt-1 text-[9px] font-extrabold px-2 py-0.5 rounded-lg ${LIST_COLORS[t.list]}`}
                    >
                      {t.list.toUpperCase()}
                    </span>
                  </div>
                  <button
                    aria-label="Edit task"
                    onClick={() => setEditingTask(t)}
                    className="shrink-0 text-muted hover:text-ink transition-colors p-1"
                  >
                    <Pencil size={14} />
                  </button>
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
        className="fixed bottom-8 right-6 sm:right-[calc(50%-224px+24px)] w-14 h-14 rounded-full bg-terracotta text-white flex items-center justify-center shadow-[0_5px_0_#8F4436] active:translate-y-[3px] active:shadow-none transition text-[28px] font-normal"
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

      {editingTask && (
        <EditTaskSheet
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={(updates) => {
            updateTask(editingTask.id, updates);
            setEditingTask(null);
          }}
          onDelete={() => {
            deleteTask(editingTask.id);
            setEditingTask(null);
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

function EditTaskSheet({
  task,
  onClose,
  onSave,
  onDelete,
}: {
  task: Task;
  onClose: () => void;
  onSave: (updates: Partial<Pick<Task, "name" | "energy" | "time" | "list">>) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(task.name);
  const [energy, setEnergy] = useState<Energy>(task.energy);
  const [time, setTime] = useState(task.time);
  const [list, setList] = useState<ListName>(task.list);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
          rows={2}
          className="w-full resize-none rounded-xl2 border-[1.5px] border-terracotta/50 bg-white px-4 py-4 text-lg font-medium placeholder:text-muted focus:outline-none focus:border-terracotta"
        />

        <div className="mt-6" />

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
          Save changes
        </button>

        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="w-full mt-3 flex items-center justify-center gap-1.5 rounded-2xl border border-red-200 text-red-500 font-medium py-3.5 text-[14px] active:scale-[0.99] transition"
          >
            <Trash2 size={15} />
            Delete task
          </button>
        ) : (
          <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-[13px] text-red-700 mb-3">Delete this task? This can't be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                className="flex-1 rounded-xl bg-white border border-line py-2.5 text-[13px] font-medium text-ink"
              >
                Keep it
              </button>
              <button
                onClick={onDelete}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-[13px] font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        )}
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
              className={`flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-[13px] font-bold transition-all ${
                selected
                  ? "bg-terracotta text-white shadow-[0_3px_0_#8F4436]"
                  : "bg-white text-muted shadow-[0_3px_0_#DDD2C2]"
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
