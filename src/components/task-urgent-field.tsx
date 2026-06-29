type TaskUrgentFieldProps = {
  id?: string;
  defaultChecked?: boolean;
};

export function TaskUrgentField({
  id = "isUrgent",
  defaultChecked = false,
}: TaskUrgentFieldProps) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-11 touch-manipulation cursor-pointer items-start gap-3 rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-3"
    >
      <input
        id={id}
        name="isUrgent"
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 size-5 shrink-0 rounded border-zinc-600"
      />
      <span>
        <span className="block text-sm font-medium text-amber-100">
          Mark as urgent
        </span>
        <span className="mt-0.5 block text-sm text-amber-200/70">
          Urgent tasks stand out on your board and in Small Reminders.
        </span>
      </span>
    </label>
  );
}
