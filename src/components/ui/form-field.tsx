import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({
  id,
  label,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm text-zinc-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
