"use client";

import Link from "next/link";
import { Field, Honeypot } from "./fields";
import { useSubmit } from "./useSubmit";
import { profileSchema } from "@/lib/validation";
import { href, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export default function ProfileRequestForm({ locale, t }: { locale: Locale; t: Dictionary }) {
  const f = t.forms;
  const { state, errors, submit, reset } = useSubmit("/api/profile-request", profileSchema, f.errors);

  if (state.phase === "done") {
    return (
      <div className="form-success card" role="status">
        <p className="eyebrow">{t.profileRequest.eyebrow}</p>
        <h2 className="form-success-title">{t.profileRequest.successTitle}</h2>
        <p className="form-success-body">{t.profileRequest.successBody}</p>
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

      <Field label={f.company} name="company" required error={errors.company}>
        {(p) => <input {...p} className="control" type="text" autoComplete="organization" required />}
      </Field>

      <Field label={f.jobTitle} name="jobTitle" hint={t.common.optional} error={errors.jobTitle}>
        {(p) => <input {...p} className="control" type="text" autoComplete="organization-title" />}
      </Field>

      <Field label={f.workEmail} name="email" required error={errors.email}>
        {(p) => <input {...p} className="control" type="email" autoComplete="email" dir="ltr" required />}
      </Field>

      <Field label={f.phone} name="phone" required error={errors.phone} hint="05XXXXXXXX">
        {(p) => <input {...p} className="control tabular" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" required />}
      </Field>

      <Field label={f.relatedOpportunity} name="relatedOpportunity" hint={t.common.optional} error={errors.relatedOpportunity}>
        {(p) => <input {...p} className="control" type="text" />}
      </Field>

      <Field label={f.reason} name="reason" required error={errors.reason} full>
        {(p) => <textarea {...p} className="control" rows={5} required />}
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
          {state.phase === "sending" ? t.common.submitting : f.submitProfile}
        </button>
      </div>
    </form>
  );
}
