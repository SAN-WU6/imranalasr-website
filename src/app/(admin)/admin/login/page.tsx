"use client";

import { useActionState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { loginAction, type ActionState } from "../actions";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, {});

  return (
    <form action={action} className="a-login-card">
      <Image src="/brand/mark.png" alt="" width={40} height={48} />
      <div>
        <h1 className="a-title">لوحة الإدارة</h1>
        <p className="a-sub">شركة عمران العصر الحديثة للمقاولات</p>
      </div>

      {state.error ? (
        <p className="a-error" role="alert">
          بيانات الدخول غير صحيحة
        </p>
      ) : null}

      <input type="hidden" name="next" value={next} />

      <div className="a-field">
        <label htmlFor="email">البريد الإلكتروني</label>
        <input id="email" name="email" type="email" className="a-input" required autoComplete="username" dir="ltr" />
      </div>

      <div className="a-field">
        <label htmlFor="password">كلمة المرور</label>
        <input
          id="password"
          name="password"
          type="password"
          className="a-input"
          required
          autoComplete="current-password"
          dir="ltr"
        />
      </div>

      <button type="submit" className="a-btn" disabled={pending}>
        {pending ? "جارٍ الدخول…" : "دخول"}
      </button>

      <p className="a-hint">
        الحساب يُنشأ من الخادم بأمر <code>npm run admin:create</code>. لا توجد صلاحية تسجيل ذاتي.
      </p>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="a-login">
      <Suspense fallback={<div className="a-login-card">…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
