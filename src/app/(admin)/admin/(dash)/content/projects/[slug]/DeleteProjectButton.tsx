"use client";

import { deleteProjectAction } from "../../../../actions";

export default function DeleteProjectButton({ slug }: { slug: string }) {
  return (
    <form action={deleteProjectAction} onSubmit={(event) => {
      if (!confirm("حذف المشروع سيزيله وصوره المرفوعة نهائياً. هل أنت متأكد؟")) event.preventDefault();
    }}>
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className="a-btn a-btn-danger">حذف المشروع</button>
    </form>
  );
}
