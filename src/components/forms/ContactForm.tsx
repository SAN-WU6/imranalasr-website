"use client";

import Link from "next/link";
import { Field, Honeypot } from "./fields";
import { useSubmit } from "./useSubmit";
import { contactSchema } from "@/lib/validation";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export default function ContactForm({ locale, t }: { locale: Locale; t: Dictionary }) {
  const f = t.forms;
  const { state, errors, submit, reset } = useSubmit("/api/contact", contactSchema, f.errors);

  if (state.phase === "done") {
    return (
      <div className="form-success card" role="status">
        <h2 className="form-success-title">{t.quote.successTitle}</h2>
        <p className="form-reference-label">{t.quote.referenceLabel}</p>
        <p className="tabular form-reference">{state.reference}</p>
        <button type="button" className="btn btn-ghost" onClick={reset}>
          {t.quote.newRequest}
        </button>
      </div>
    );
  }

  return (
    <form
      className="form-grid"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit(e.currentTarget, { locale });
      }}
    >
      <Honeypot />

      <Field label={f.name} name="name" required error={errors.name}>
        {(p) => <input {...p} className="control" type="text" autoComplete="name" required />}
      </Field>

      <Field label={f.company} name="company" hint={t.common.optional} error={errors.company}>
        {(p) => <input {...p} className="control" type="text" autoComplete="organization" />}
      </Field>

      <Field label={f.email} name="email" required error={errors.email}>
        {(p) => <input {...p} className="control" type="email" autoComplete="email" dir="ltr" required />}
      </Field>

      <Field label={f.phone} name="phone" hint={t.common.optional} error={errors.phone}>
        {(p) => <input {...p} className="control tabular" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" />}
      </Field>

      <Field label={f.subject} name="subject" required error={errors.subject} full>
        {(p) => <input {...p} className="control" type="text" required />}
      </Field>

      <Field label={f.message} name="message" required error={errors.message} full>
        {(p) => <textarea {...p} className="control" rows={6} required />}
      </Field>

      <div className="field field-consent" data-full="true">
        <label className="consent">
          <input type="checkbox" name="consent" value="yes" />
          <span>
            {f.consent}{" "}
            <Link href={href("/privacy", locale)} className="link-sweep">
              {t.nav.privacy}
            </Link>
          </span>
        </label>
        {errors.consent ? <p className="error-text">{errors.consent}</p> : null}
      </div>

      {state.phase === "error" ? (
        <p className="form-error" role="alert" data-full="true">
          {state.message}
        </p>
      ) : null}

      <div className="form-actions" data-full="true">
        <button type="submit" className="btn" disabled={state.phase === "sending"}>
          {state.phase === "sending" ? t.common.submitting : f.submitMessage}
        </button>
      </div>
    </form>
  );
}
