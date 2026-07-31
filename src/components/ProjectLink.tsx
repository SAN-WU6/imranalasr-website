"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

type Doc = Document & { startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> } };

/**
 * Navigates with a shared-element transition where the browser supports one.
 * The cover image on the card and the cover image on the detail page carry the
 * same `view-transition-name`, so the picture travels between the two pages
 * instead of the page cutting. Everywhere else this is a plain <Link>.
 */
export default function ProjectLink({
  href,
  children,
  ...rest
}: { href: string; children: ReactNode } & Omit<ComponentProps<typeof Link>, "href" | "children">) {
  const router = useRouter();
  const doc = typeof document !== "undefined" ? (document as Doc) : null;

  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (!doc?.startViewTransition) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        e.preventDefault();
        doc.startViewTransition(() => {
          router.push(href);
          // Give React a frame to commit before the snapshot is taken.
          return new Promise<void>((resolve) => setTimeout(resolve, 90));
        });
      }}
    >
      {children}
    </Link>
  );
}
