"use client";

import { useId, type ReactNode } from "react";

export function Field({
  label,
  name,
  error,
  hint,
  required,
  children,
  full,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (props: { id: string; name: string; "aria-invalid": boolean; "aria-describedby": string | undefined }) => ReactNode;
  full?: boolean;
}) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className="field" data-full={full ? "true" : undefined}>
      <label htmlFor={id}>
        {label}
        {!required ? <span className="hint">({hint ?? ""})</span> : null}
      </label>
      {children({ id, name, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {error ? (
        <p className="error-text" id={`${id}-err`} role="alert">
          {error}
        </p>
      ) : hint && required ? (
        <p className="hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Honeypot() {
  return (
    <div className="hp" aria-hidden="true">
      <label htmlFor="company_website">Company website</label>
      <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
