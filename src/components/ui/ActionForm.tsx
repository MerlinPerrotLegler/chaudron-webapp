'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { FormState } from '@/lib/form-state';

export type { FormState };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? 'Enregistrement…' : label}
    </button>
  );
}

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function ActionForm({
  action,
  children,
  submitLabel,
  className,
}: {
  action: Action;
  children: React.ReactNode;
  submitLabel: string;
  className?: string;
}) {
  const [state, formAction] = useFormState(action, null as FormState);
  return (
    <form action={formAction} className={className ?? 'space-y-4'}>
      {state?.ok === false ? (
        <div className="rounded-theme border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.message}
        </div>
      ) : null}
      {state?.ok === true ? (
        <div className="rounded-theme border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          Enregistré
        </div>
      ) : null}
      {children}
      <Submit label={submitLabel} />
    </form>
  );
}
