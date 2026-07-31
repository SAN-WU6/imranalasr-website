"use client";

import { useCallback, useRef, useState } from "react";
import { validate, type Schema } from "@/lib/validation";

export type SubmitState =
  | { phase: "idle" }
  | { phase: "sending" }
  | { phase: "error"; message: string }
  | { phase: "done"; reference: string };

export function useSubmit(endpoint: string, schema: Schema, messages: Record<string, string>) {
  const [state, setState] = useState<SubmitState>({ phase: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const openedAt = useRef(Date.now());

  const submit = useCallback(
    async (form: HTMLFormElement, extra: Record<string, unknown> = {}) => {
      const fd = new FormData(form);
      const data: Record<string, unknown> = Object.fromEntries(fd.entries());
      Object.assign(data, extra);

      const found = validate(data, schema);
      const map: Record<string, string> = {};
      for (const e of found) map[e.field] = messages[e.code] ?? messages.required;
      if (!data.consent) map.consent = messages.consent;

      setErrors(map);
      if (Object.keys(map).length) {
        const first = form.querySelector<HTMLElement>('[aria-invalid="true"]');
        first?.focus();
        first?.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }

      setState({ phase: "sending" });
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, _elapsed: Date.now() - openedAt.current }),
        });
        const body = (await res.json().catch(() => ({}))) as { reference?: string; error?: string; fields?: Record<string, string> };
        if (!res.ok) {
          if (res.status === 429) {
            setState({ phase: "error", message: messages.rateLimited });
            return;
          }
          if (body.fields) {
            const serverMap: Record<string, string> = {};
            for (const [k, code] of Object.entries(body.fields)) serverMap[k] = messages[code] ?? messages.required;
            setErrors(serverMap);
          }
          setState({ phase: "error", message: messages.generic });
          return;
        }
        setState({ phase: "done", reference: body.reference ?? "" });
      } catch {
        setState({ phase: "error", message: messages.generic });
      }
    },
    [endpoint, schema, messages]
  );

  const reset = useCallback(() => {
    setState({ phase: "idle" });
    setErrors({});
    openedAt.current = Date.now();
  }, []);

  return { state, errors, submit, reset };
}
