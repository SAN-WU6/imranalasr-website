"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

/**
 * Six technical drawings, one per work group.
 *
 * These are drawings, not icons: each is the plan, section or single-line
 * diagram an engineer would actually issue for that group of work — with
 * hatching, dimension lines, datum marks and standard symbols. Everything is
 * stroked geometry so the whole sheet can draw itself in when the reader
 * arrives at a new group, the way a setting-out drawing is drawn.
 */

const HAIR = { strokeWidth: 0.85, opacity: 0.5 } as const;

/** Diagonal hatch inside a rectangle — the section-cut convention. */
function hatch(x: number, y: number, w: number, h: number, step = 11, key = "h") {
  const out: ReactNode[] = [];
  for (let d = -h; d < w; d += step) {
    const x1 = Math.max(x, x + d);
    const y1 = y + Math.max(0, -d);
    const x2 = Math.min(x + w, x + d + h);
    const y2 = y + Math.min(h, w - d);
    if (x2 - x1 > 1.5) out.push(<path key={`${key}${d}`} d={`M${x1} ${y1} L${x2} ${y2}`} {...HAIR} />);
  }
  return out;
}

/** Dimension line with end ticks and extension lines. */
function dimV(x: number, y1: number, y2: number, ext = 10, key = "d") {
  return (
    <g key={key}>
      <path d={`M${x} ${y1} L${x} ${y2}`} {...HAIR} />
      <path d={`M${x - 4} ${y1 + 4} L${x + 4} ${y1 - 4}`} {...HAIR} />
      <path d={`M${x - 4} ${y2 + 4} L${x + 4} ${y2 - 4}`} {...HAIR} />
      <path d={`M${x - ext} ${y1} L${x + 5} ${y1}`} {...HAIR} />
      <path d={`M${x - ext} ${y2} L${x + 5} ${y2}`} {...HAIR} />
    </g>
  );
}

function dimH(y: number, x1: number, x2: number, ext = 10, key = "dh") {
  return (
    <g key={key}>
      <path d={`M${x1} ${y} L${x2} ${y}`} {...HAIR} />
      <path d={`M${x1 + 4} ${y - 4} L${x1 - 4} ${y + 4}`} {...HAIR} />
      <path d={`M${x2 + 4} ${y - 4} L${x2 - 4} ${y + 4}`} {...HAIR} />
      <path d={`M${x1} ${y - ext} L${x1} ${y + 5}`} {...HAIR} />
      <path d={`M${x2} ${y - ext} L${x2} ${y + 5}`} {...HAIR} />
    </g>
  );
}

/** Level / datum triangle. */
function datum(x: number, y: number, key = "lv") {
  return <path key={key} d={`M${x - 6} ${y - 9} L${x + 6} ${y - 9} L${x} ${y} Z`} {...HAIR} />;
}

const FIGURES: Record<string, ReactNode> = {
  /* 01 — Building elevation with foundation section and storey dimension */
  "building-construction": (
    <>
      {/* massing */}
      <path d="M92 252 L92 108 L200 62 L308 108 L308 252" />
      <path d="M92 196 L308 196" />
      <path d="M92 152 L308 152" />
      {/* columns */}
      <path d="M134 252 L134 122" {...HAIR} />
      <path d="M200 252 L200 89" {...HAIR} />
      <path d="M266 252 L266 122" {...HAIR} />
      {/* openings */}
      <path d="M110 168 L126 168 L126 186 L110 186 Z" {...HAIR} />
      <path d="M274 168 L290 168 L290 186 L274 186 Z" {...HAIR} />
      <path d="M186 212 L214 212 L214 252" {...HAIR} />
      {/* ground + cut earth */}
      <path d="M28 252 L372 252" />
      {hatch(28, 252, 344, 14, 13, "g")}
      {/* stepped footings */}
      <path d="M74 252 L74 274 L112 274 L112 252" />
      <path d="M288 252 L288 274 L326 274 L326 252" />
      {hatch(74, 252, 38, 22, 8, "f1")}
      {hatch(288, 252, 38, 22, 8, "f2")}
      {/* storey dimension + datums */}
      {dimV(350, 108, 252, 12, "dim")}
      {datum(92, 152, "l1")}
      {datum(92, 196, "l2")}
    </>
  ),

  /* 02 — Wall build-up: existing substrate, render coats, finish, reveal detail */
  "restoration-finishing": (
    <>
      {/* existing masonry, cut */}
      <path d="M58 66 L58 262 L142 262 L142 66" />
      {hatch(58, 66, 84, 196, 14, "m")}
      {/* break line at the top of the cut */}
      <path d="M58 66 L74 60 L90 72 L106 60 L122 72 L138 62 L142 66" {...HAIR} />
      {/* successive coats */}
      <path d="M142 66 L142 262" />
      <path d="M156 66 L156 262" />
      <path d="M168 66 L168 262" />
      <path d="M178 66 L178 262" />
      {/* leaders */}
      <path d="M149 66 L149 42 L206 42" {...HAIR} />
      <path d="M162 66 L162 34 L206 34" {...HAIR} />
      <path d="M173 66 L173 26 L206 26" {...HAIR} />
      <circle cx="149" cy="66" r="2" {...HAIR} />
      <circle cx="162" cy="66" r="2" {...HAIR} />
      <circle cx="173" cy="66" r="2" {...HAIR} />
      {/* build-up dimension */}
      {dimH(282, 142, 178, 12, "d")}
      {/* opening with reveal + sill */}
      <path d="M226 108 L344 108 L344 214 L226 214 Z" />
      <path d="M238 120 L332 120 L332 202 L238 202 Z" {...HAIR} />
      <path d="M220 214 L350 214" />
      <path d="M220 214 L226 222 L344 222 L350 214" {...HAIR} />
      {/* floor line */}
      <path d="M28 262 L372 262" />
    </>
  ),

  /* 03 — Pavement cross-section with kerb, footway and crossfall */
  "roads-pavements": (
    <>
      {/* wearing course (crossfall 2%) */}
      <path d="M40 128 L296 118" />
      <path d="M40 142 L296 132" />
      {/* binder */}
      <path d="M40 160 L296 150" />
      {/* base */}
      <path d="M40 188 L296 178" />
      {/* sub-base */}
      <path d="M40 216 L296 206" />
      {/* subgrade, cut */}
      <path d="M40 216 L40 254 L296 254 L296 206" />
      {hatch(42, 218, 250, 34, 16, "sg")}
      {/* layer texture */}
      <path d="M64 146 L64 156" {...HAIR} />
      <path d="M120 144 L120 154" {...HAIR} />
      <path d="M176 142 L176 152" {...HAIR} />
      <path d="M232 140 L232 150" {...HAIR} />
      {/* crossfall arrow */}
      <path d="M96 104 L196 100" {...HAIR} />
      <path d="M188 96 L196 100 L188 104" {...HAIR} />
      {/* kerb + footway */}
      <path d="M296 118 L296 96 L322 92 L322 76 L366 74" />
      <path d="M322 92 L322 206 L296 206" {...HAIR} />
      <path d="M366 74 L366 206 L322 206" {...HAIR} />
      {/* build-up dimension */}
      {dimV(26, 128, 216, 10, "d")}
      {/* road centre-line marking */}
      <path d="M56 134 L82 133" />
      <path d="M112 132 L138 131" />
      <path d="M168 130 L194 129" />
      <path d="M224 128 L250 127" />
    </>
  ),

  /* 04 — Single-line diagram: incomer, isolator, breaker, transformer, busbar */
  "electrical-power": (
    <>
      {/* incoming feeder */}
      <path d="M200 30 L200 62" />
      {/* isolator */}
      <path d="M200 62 L216 84" />
      <path d="M200 84 L200 92" />
      <circle cx="200" cy="62" r="2.5" {...HAIR} />
      <circle cx="200" cy="84" r="2.5" {...HAIR} />
      {/* circuit breaker */}
      <path d="M189 92 L211 92 L211 114 L189 114 Z" />
      <path d="M200 114 L200 128" />
      {/* transformer — two windings */}
      <circle cx="200" cy="150" r="22" />
      <circle cx="200" cy="176" r="22" />
      <path d="M200 198 L200 220" />
      {/* neutral earthing */}
      <path d="M222 176 L252 176 L252 224" {...HAIR} />
      <path d="M240 224 L264 224" {...HAIR} />
      <path d="M244 230 L260 230" {...HAIR} />
      <path d="M248 236 L256 236" {...HAIR} />
      {/* busbar */}
      <path d="M104 220 L296 220" strokeWidth="2.6" />
      {/* outgoing ways */}
      <path d="M134 220 L134 240" />
      <path d="M123 240 L145 240 L145 262 L123 262 Z" />
      <path d="M134 262 L134 288" />
      <path d="M266 220 L266 240" />
      <path d="M255 240 L277 240 L277 262 L255 262 Z" />
      <path d="M266 262 L266 288" />
      {/* enclosure corner brackets */}
      <path d="M64 42 L64 24 L92 24" {...HAIR} />
      <path d="M336 42 L336 24 L308 24" {...HAIR} />
      <path d="M64 286 L64 304 L92 304" {...HAIR} />
      <path d="M336 286 L336 304 L308 304" {...HAIR} />
    </>
  ),

  /* 05 — Structured cabling riser: MDF, backbone, floor nodes, outlets */
  "telecom-low-current": (
    <>
      {/* floor slabs */}
      <path d="M52 96 L348 96" />
      <path d="M52 164 L348 164" />
      <path d="M52 232 L348 232" />
      {/* riser */}
      <path d="M104 268 L104 74" />
      {/* main distribution frame */}
      <path d="M78 268 L78 314 L130 314 L130 268 Z" />
      <path d="M78 282 L130 282" {...HAIR} />
      <path d="M78 296 L130 296" {...HAIR} />
      {/* floor distribution nodes */}
      <circle cx="104" cy="96" r="9" />
      <circle cx="104" cy="164" r="9" />
      <circle cx="104" cy="232" r="9" />
      {/* horizontal cabling */}
      <path d="M113 96 L300 96" {...HAIR} />
      <path d="M113 164 L300 164" {...HAIR} />
      <path d="M113 232 L300 232" {...HAIR} />
      {/* outlets */}
      <path d="M200 90 L212 90 L212 102 L200 102 Z" {...HAIR} />
      <path d="M296 90 L308 90 L308 102 L296 102 Z" />
      <path d="M200 158 L212 158 L212 170 L200 170 Z" {...HAIR} />
      <path d="M296 158 L308 158 L308 170 L296 170 Z" />
      <path d="M200 226 L212 226 L212 238 L200 238 Z" {...HAIR} />
      <path d="M296 226 L308 226 L308 238 L296 238 Z" />
      {/* fire detection loop */}
      <circle cx="322" cy="52" r="13" />
      <circle cx="322" cy="52" r="3.5" {...HAIR} />
      <path d="M322 65 L322 78 L113 78" {...HAIR} />
      <path d="M304 40 L296 32" {...HAIR} />
      <path d="M340 40 L348 32" {...HAIR} />
      {/* riser datum */}
      {datum(52, 96, "f1")}
      {datum(52, 164, "f2")}
      {datum(52, 232, "f3")}
    </>
  ),

  /* 06 — Scaffold bay over a post-tensioned beam with tendon profile */
  "structural-support": (
    <>
      {/* standards */}
      <path d="M78 34 L78 196" />
      <path d="M156 34 L156 196" />
      <path d="M244 34 L244 196" />
      <path d="M322 34 L322 196" />
      {/* ledgers */}
      <path d="M78 66 L322 66" />
      <path d="M78 116 L322 116" />
      <path d="M78 166 L322 166" />
      {/* diagonal bracing */}
      <path d="M78 116 L156 66" {...HAIR} />
      <path d="M156 166 L78 116" {...HAIR} />
      <path d="M244 66 L322 116" {...HAIR} />
      <path d="M322 116 L244 166" {...HAIR} />
      {/* working platform */}
      <path d="M156 66 L244 66" strokeWidth="2.4" />
      {/* base plates + sole line */}
      <path d="M68 196 L88 196" strokeWidth="2.4" />
      <path d="M146 196 L166 196" strokeWidth="2.4" />
      <path d="M234 196 L254 196" strokeWidth="2.4" />
      <path d="M312 196 L332 196" strokeWidth="2.4" />
      <path d="M52 196 L348 196" />
      {/* post-tensioned beam */}
      <path d="M62 238 L338 238 L338 292 L62 292 Z" />
      {/* tendon profile */}
      <path d="M78 254 Q200 306 322 254" />
      {/* anchorages */}
      <path d="M62 248 L78 248 L78 282 L62 282 Z" {...HAIR} />
      <path d="M322 248 L338 248 L338 282 L322 282 Z" {...HAIR} />
      {/* stirrups */}
      <path d="M120 244 L120 286" {...HAIR} />
      <path d="M160 244 L160 286" {...HAIR} />
      <path d="M200 244 L200 286" {...HAIR} />
      <path d="M240 244 L240 286" {...HAIR} />
      <path d="M280 244 L280 286" {...HAIR} />
      {/* span dimension */}
      {dimH(312, 62, 338, 10, "d")}
    </>
  ),
};

export default function ServiceDiagram({ slug }: { slug: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.documentElement.classList.contains("reduced-motion")) return;

    const ctx = gsap.context(() => {
      const strokes = Array.from(el.querySelectorAll<SVGGeometryElement>("path, circle"));
      // Draw the primary geometry first, then the hairline notation — the
      // order a drawing is actually produced in.
      const primary = strokes.filter((s) => s.getAttribute("opacity") !== "0.5");
      const notation = strokes.filter((s) => s.getAttribute("opacity") === "0.5");

      [primary, notation].forEach((group, tier) => {
        group.forEach((s, i) => {
          const len = s.getTotalLength?.() ?? 400;
          gsap.fromTo(
            s,
            { strokeDasharray: len, strokeDashoffset: len, opacity: 0 },
            {
              strokeDashoffset: 0,
              opacity: tier === 0 ? 1 : 0.5,
              duration: tier === 0 ? 0.75 : 0.5,
              ease: "power2.out",
              delay: tier * 0.28 + i * 0.012,
            }
          );
        });
      });
    }, el);

    return () => ctx.revert();
  }, [slug]);

  return (
    <svg
      ref={ref}
      key={slug}
      viewBox="0 0 400 340"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
      vectorEffect="non-scaling-stroke"
      aria-hidden="true"
      className="svc-diagram"
    >
      {FIGURES[slug] ?? FIGURES["building-construction"]}
    </svg>
  );
}
