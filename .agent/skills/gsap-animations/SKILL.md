---
name: gsap-animations
description: Advanced GSAP animations for React and Next.js applications using GSAP 3.14.2 — covers core tweens, timelines, ScrollTrigger, all plugins (SplitText, MorphSVG, Flip, Draggable, MotionPath), React hooks patterns, Next.js App Router integration, and performance best practices.
---

# GSAP Animations — Complete React & Next.js Guide (v3.14.2)

> **All plugins are now free** (since GSAP 3.13, April 2025). SplitText, MorphSVG, Flip, DrawSVG, MotionPath, Draggable, and all other previously Club GSAP plugins are included in the public `gsap` npm package at no cost.

---

## 1. Installation

```bash
bun add gsap
# or
yarn add gsap
# or
pnpm add gsap
```

All plugins ship inside the `gsap` package — no separate installs needed:

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Flip } from "gsap/Flip";
import { Draggable } from "gsap/Draggable";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { CustomEase } from "gsap/CustomEase";
```

> **Always register plugins before use:**
>
> ```ts
> gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Draggable);
> ```

---

## 2. Core API — Tweens

### `gsap.to()` — Animate TO a state

```ts
gsap.to(".box", {
  x: 200,
  opacity: 0,
  duration: 0.6,
  ease: "power2.out",
});
```

### `gsap.from()` — Animate FROM a state

```ts
gsap.from(".card", {
  y: 40,
  opacity: 0,
  duration: 0.5,
  ease: "back.out(1.7)",
});
```

### `gsap.fromTo()` — Explicit start AND end

```ts
gsap.fromTo(
  ".hero",
  { opacity: 0, scale: 0.9 },
  { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" },
);
```

### `gsap.set()` — Instant property set (no animation)

```ts
gsap.set(".panel", { opacity: 0, y: 30 });
```

### Tween instance — control playback

```ts
const tween = gsap.to(".box", { x: 200, duration: 1 });
tween.pause();
tween.play();
tween.reverse();
tween.restart();
tween.kill();
tween.progress(0.5); // jump to 50%
```

---

## 3. Timelines — Sequencing Animations

Timelines are GSAP's most powerful tool — sequence tweens with precise timing control.

```ts
const tl = gsap.timeline({
  defaults: { ease: "power2.out", duration: 0.5 },
  onComplete: () => console.log("done"),
});

tl.from(".title", { y: -30, opacity: 0 })
  .from(".subtitle", { y: -20, opacity: 0 }, "-=0.2") // overlap by 0.2s
  .from(".cta", { scale: 0.8, opacity: 0 }, "+=0.1") // delay 0.1s after prev
  .from(".card", { y: 40, opacity: 0, stagger: 0.08 }); // stagger multiple elements
```

**Position parameter shortcuts:**

| Syntax      | Meaning                           |
| ----------- | --------------------------------- |
| `'-=0.2'`   | 0.2s before end of previous       |
| `'+=0.3'`   | 0.3s after end of previous        |
| `'<'`       | At the start of previous tween    |
| `'<0.2'`    | 0.2s after start of previous      |
| `1.5`       | Absolute 1.5s from timeline start |
| `'myLabel'` | At a named label                  |

```ts
tl.addLabel("step2", 1.0);
tl.to(".box", { x: 100 }, "step2");
```

### Timeline control

```ts
tl.pause();
tl.play();
tl.reverse();
tl.seek(1.5); // jump to 1.5s
tl.timeScale(2); // double speed
tl.timeScale(0.5); // half speed (slow-mo)
tl.progress(0.75); // jump to 75%
tl.kill();
```

---

## 4. Easing Reference

GSAP has the richest easing library of any animation tool.

```ts
// Built-in families (each has .in, .out, .inOut)
ease: "none"; // linear
ease: "power1.out"; // subtle deceleration
ease: "power2.out"; // smooth deceleration (great default)
ease: "power3.out"; // strong deceleration
ease: "power4.out"; // very strong
ease: "back.out(1.7)"; // overshoot (springy)
ease: "back.inOut(2)";
ease: "bounce.out"; // bounces at end
ease: "elastic.out(1, 0.3)"; // elastic snap
ease: "circ.out"; // circular
ease: "expo.out"; // exponential
ease: "sine.out"; // sinusoidal (gentle)

// Steps (CSS-like)
ease: "steps(5)";
```

### Custom Ease

```ts
import { CustomEase } from "gsap/CustomEase";
gsap.registerPlugin(CustomEase);

CustomEase.create(
  "myEase",
  "M0,0 C0.14,0 0.242,0.438 0.272,0.561 0.313,0.728 0.354,0.963 0.362,1",
);
gsap.to(".box", { x: 200, ease: "myEase", duration: 1 });
```

---

## 5. Stagger — Animating Multiple Elements

```ts
// Basic stagger
gsap.from(".card", {
  y: 40,
  opacity: 0,
  duration: 0.5,
  stagger: 0.08,
});

// Advanced stagger config
gsap.from(".item", {
  scale: 0,
  opacity: 0,
  stagger: {
    amount: 0.8, // total stagger time spread across all elements
    from: "center", // 'start' | 'end' | 'center' | 'random' | index number
    ease: "power2.in",
    grid: "auto", // for grid layouts
    axis: "y", // 'x' | 'y' — for grid-based stagger
  },
});
```

---

## 6. React Integration — The `useGSAP` Hook

**Always use `useGSAP` instead of raw `useEffect`** for GSAP in React. It handles cleanup automatically.

```bash
# useGSAP ships inside gsap package
```

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

// Register the hook once (e.g. in your root layout or providers file)
// gsap.registerPlugin(useGSAP); // optional but recommended

export function AnimatedBox() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // All GSAP code goes here
      // Scope is automatically set to containerRef
      gsap.from(".box", { x: -100, opacity: 0, duration: 0.6 });
    },
    { scope: containerRef },
  ); // scope limits querySelector to this container

  return (
    <div ref={containerRef}>
      <div
        className="box"
        style={{ width: 80, height: 80, background: "royalblue" }}
      />
    </div>
  );
}
```

### Why `useGSAP` over `useEffect`?

- Automatically kills all GSAP animations/ScrollTriggers created inside it on cleanup
- Automatically reverts `gsap.context()` on unmount
- Works correctly with React Strict Mode (double-invocation)
- Provides a `contextSafe` wrapper for event handlers

### `contextSafe` — GSAP in Event Handlers

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function ButtonAnimation() {
  const container = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: container });

  // Wrap event handler in contextSafe so it's tracked and cleaned up properly
  const handleClick = contextSafe(() => {
    gsap.to(".box", { rotation: "+=90", duration: 0.4, ease: "back.out(2)" });
  });

  return (
    <div ref={container}>
      <div className="box" />
      <button onClick={handleClick}>Rotate</button>
    </div>
  );
}
```

### Reactive Animations (re-run when deps change)

```tsx
"use client";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function ReactiveAnimation({ color }: { color: string }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(".box", { backgroundColor: color, duration: 0.4 });
    },
    {
      scope: container,
      dependencies: [color], // re-runs when color changes
    },
  );

  return (
    <div ref={container}>
      <div className="box" />
    </div>
  );
}
```

---

## 7. ScrollTrigger — Scroll-Driven Animations

ScrollTrigger is GSAP's scroll animation plugin. Register it once globally.

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
```

### Basic ScrollTrigger

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollReveal() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".reveal", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".reveal",
          start: "top 85%", // "element-edge viewport-edge"
          end: "bottom 15%",
          toggleActions: "play none none reverse",
          // play | pause | resume | reverse | restart | reset | complete | none
          // toggleActions: onEnter onLeave onEnterBack onLeaveBack
        },
      });
    },
    { scope: container },
  );

  return (
    <div ref={container}>
      <div className="reveal" style={{ height: 100 }}>
        Scroll to reveal
      </div>
    </div>
  );
}
```

### Scrub — Link Animation to Scroll Position

```tsx
useGSAP(
  () => {
    gsap.to(".parallax-img", {
      yPercent: -30,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true, // smooth scrub (links directly to scroll)
        // scrub: 1.5,   // number = spring lag in seconds
      },
    });
  },
  { scope: container },
);
```

### Pin — Sticky Sections

```tsx
useGSAP(
  () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".pinned-section",
        start: "top top",
        end: "+=2000", // pin for 2000px of scroll
        scrub: 1,
        pin: true, // pin the trigger element
        anticipatePin: 1,
      },
    });

    tl.to(".panel-1", { xPercent: -100 })
      .to(".panel-2", { xPercent: -100 })
      .to(".panel-3", { xPercent: -100 });
  },
  { scope: container },
);
```

### Horizontal Scroll

```tsx
useGSAP(
  () => {
    const sections = gsap.utils.toArray<HTMLElement>(".h-section");

    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: ".h-container",
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () =>
          `+=${document.querySelector<HTMLElement>(".h-container")!.offsetWidth}`,
      },
    });
  },
  { scope: container },
);
```

### ScrollTrigger Callbacks

```ts
scrollTrigger: {
  trigger: '.element',
  start: 'top 80%',
  onEnter: (self) => console.log('entered', self.progress),
  onLeave: (self) => console.log('left'),
  onEnterBack: (self) => console.log('entered back'),
  onLeaveBack: (self) => console.log('left back'),
  onUpdate: (self) => console.log('progress:', self.progress),
  onToggle: (self) => console.log('active:', self.isActive),
}
```

### Staggered ScrollTrigger (batch)

```tsx
useGSAP(
  () => {
    ScrollTrigger.batch(".card", {
      onEnter: (elements) => {
        gsap.from(elements, {
          opacity: 0,
          y: 40,
          stagger: 0.06,
          duration: 0.6,
          ease: "power2.out",
        });
      },
      onLeave: (elements) => gsap.set(elements, { opacity: 0 }),
      onEnterBack: (elements) => gsap.to(elements, { opacity: 1 }),
      start: "top 90%",
    });
  },
  { scope: container },
);
```

---

## 8. SplitText — Text Animation

SplitText splits text into characters, words, or lines for granular animation.

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export function AnimatedHeading({ text }: { text: string }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const split = new SplitText("h1", {
        type: "chars,words,lines",
        linesClass: "split-line",
      });

      gsap.from(split.chars, {
        opacity: 0,
        y: 20,
        rotateX: -90,
        stagger: 0.02,
        duration: 0.6,
        ease: "back.out(2)",
      });

      // SplitText auto-reverts with useGSAP cleanup
      return () => split.revert();
    },
    { scope: container },
  );

  return (
    <div ref={container}>
      <h1>{text}</h1>
    </div>
  );
}
```

### Word-by-Word with ScrollTrigger

```tsx
useGSAP(
  () => {
    const split = new SplitText("p", { type: "words" });

    gsap.from(split.words, {
      opacity: 0,
      y: 10,
      stagger: 0.04,
      duration: 0.5,
      scrollTrigger: {
        trigger: "p",
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    return () => split.revert();
  },
  { scope: container },
);
```

---

## 9. Flip Plugin — Layout Transition Animations

Flip captures element state before and after a DOM change and animates between them (FLIP technique).

```tsx
"use client";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

export function FlipGrid() {
  const [expanded, setExpanded] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP({ scope: container });

  const toggle = contextSafe(() => {
    // 1. Capture state BEFORE the DOM change
    const state = Flip.getState(".item");
    // 2. Make the DOM change
    setExpanded((prev) => !prev);
    // 3. Animate from old to new state
    Flip.from(state, {
      duration: 0.6,
      ease: "power2.inOut",
      stagger: 0.04,
      absolute: true,
      onLeave: (elements) => gsap.to(elements, { opacity: 0, scale: 0.8 }),
      onEnter: (elements) => gsap.from(elements, { opacity: 0, scale: 0.8 }),
    });
  });

  return (
    <div ref={container}>
      <button onClick={toggle}>Toggle Layout</button>
      <div className={expanded ? "grid-expanded" : "grid-collapsed"}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="item">
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 10. MorphSVG Plugin — SVG Path Morphing

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(MorphSVGPlugin);

export function MorphIcon({ isOpen }: { isOpen: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      gsap.to("#hamburger", {
        morphSVG: isOpen ? "#close-icon" : "#hamburger",
        duration: 0.4,
        ease: "power2.inOut",
      });
    },
    { scope: svgRef, dependencies: [isOpen] },
  );

  return (
    <svg ref={svgRef} viewBox="0 0 24 24" width="24" height="24">
      <path
        id="hamburger"
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        fill="none"
      />
      <path
        id="close-icon"
        d="M6 6l12 12M6 18L18 6"
        stroke="currentColor"
        fill="none"
        style={{ display: "none" }}
      />
    </svg>
  );
}
```

---

## 11. DrawSVG Plugin — SVG Path Drawing

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger);

export function DrawingPath() {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      gsap.set("path", { drawSVG: 0 });
      gsap.to("path", {
        drawSVG: "100%",
        duration: 2,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: svgRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    },
    { scope: svgRef },
  );

  return (
    <svg ref={svgRef} viewBox="0 0 400 200">
      <path
        d="M10,100 C50,0 150,200 200,100 C250,0 350,200 390,100"
        fill="none"
        stroke="#6366f1"
        strokeWidth="3"
      />
    </svg>
  );
}
```

---

## 12. MotionPath Plugin — Animate Along a Path

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

export function PathFollower() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(".dot", {
        duration: 4,
        repeat: -1,
        ease: "none",
        motionPath: {
          path: "#track",
          align: "#track",
          autoRotate: true,
          alignOrigin: [0.5, 0.5],
        },
      });
    },
    { scope: container },
  );

  return (
    <div ref={container} style={{ position: "relative" }}>
      <svg viewBox="0 0 500 200" style={{ width: "100%" }}>
        <path
          id="track"
          d="M10,100 C100,-50 400,250 490,100"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="2"
        />
      </svg>
      <div
        className="dot"
        style={{
          position: "absolute",
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#6366f1",
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}
```

---

## 13. Draggable Plugin

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(Draggable, InertiaPlugin);

export function DraggableCard() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      Draggable.create(".draggable", {
        type: "x,y", // 'x' | 'y' | 'x,y' | 'rotation' | 'scroll'
        edgeResistance: 0.65,
        bounds: container.current, // constrain within container
        inertia: true, // momentum on release (requires InertiaPlugin)
        onClick: () => console.log("clicked"),
        onDragStart: () =>
          gsap.to(".draggable", { scale: 1.05, duration: 0.2 }),
        onDragEnd: () => gsap.to(".draggable", { scale: 1, duration: 0.2 }),
        snap: {
          x: (value) => Math.round(value / 50) * 50, // snap to 50px grid
        },
      });
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      style={{
        position: "relative",
        width: 400,
        height: 400,
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        className="draggable"
        style={{
          width: 80,
          height: 80,
          background: "#6366f1",
          borderRadius: 8,
          cursor: "grab",
          position: "absolute",
        }}
      />
    </div>
  );
}
```

---

## 14. gsap.utils — Utility Functions

```ts
// Clamp a value between min/max
const clamped = gsap.utils.clamp(0, 100, value);

// Map a range to another range
const mapped = gsap.utils.mapRange(0, 100, 0, 1, value);

// Wrap a value within a range (circular)
const wrapped = gsap.utils.wrap(0, 360, 400); // → 40

// Snap to nearest value or array
const snapped = gsap.utils.snap(10, 23); // → 20
const snappedArr = gsap.utils.snap([0, 50, 100], 67); // → 50

// Convert selector/element to array
const elements = gsap.utils.toArray<HTMLElement>(".card");

// Random number in range
const rand = gsap.utils.random(10, 50);
const randFn = gsap.utils.random(10, 50, true); // returns a function for reuse

// Pipe functions
const transform = gsap.utils.pipe(
  gsap.utils.clamp(0, 100),
  gsap.utils.mapRange(0, 100, 0, 1),
);

// Interpolate between values
const interp = gsap.utils.interpolate("#ff0000", "#0000ff", 0.5); // → '#7f007f'
```

---

## 15. Next.js App Router Integration

### Critical: Register Plugins in a Client Provider

```tsx
// app/providers/GSAPProvider.tsx
"use client";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);

export function GSAPProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

```tsx
// app/layout.tsx (Server Component — no 'use client' needed here)
import { GSAPProvider } from "./providers/GSAPProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GSAPProvider>{children}</GSAPProvider>
      </body>
    </html>
  );
}
```

### `useIsomorphicLayoutEffect` Hook (SSR-safe)

```ts
// hooks/useIsomorphicLayoutEffect.ts
import { useEffect, useLayoutEffect } from "react";

// useLayoutEffect on client, useEffect on server (avoids SSR warnings)
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
```

### Marking GSAP Components as Client Components

```tsx
// components/HeroAnimation.tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Plugin already registered in GSAPProvider — no need to re-register here

export function HeroAnimation() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".hero-title", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: container },
  );

  return <div ref={container}>...</div>;
}
```

### ScrollTrigger + Next.js: Refresh After Hydration

```tsx
// components/ScrollAnimations.tsx
"use client";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function ScrollRefresher() {
  useEffect(() => {
    // Next.js may change layout after hydration; refresh ScrollTrigger
    const id = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => clearTimeout(id);
  }, []);

  return null;
}
```

```tsx
// app/layout.tsx
import { ScrollRefresher } from "@/components/ScrollRefresher";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ScrollRefresher />
      </body>
    </html>
  );
}
```

---

## 16. Performance Best Practices

### 16.1 Only Animate GPU-Composited Properties

```ts
// ✅ Fast — compositor-safe (transform + opacity only)
gsap.to(".box", { x: 200, y: 50, scale: 1.2, rotation: 45, opacity: 0.5 });

// ❌ Slow — triggers layout reflow
gsap.to(".box", { width: 200, height: 100, top: 50, left: 100, marginTop: 20 });
```

GSAP maps shorthand properties to `transform` automatically:

- `x` → `translateX`
- `y` → `translateY`
- `scale`, `scaleX`, `scaleY` → `scale()`
- `rotation` → `rotate()` (degrees)
- `rotationX`, `rotationY` → `rotateX()`, `rotateY()`
- `skewX`, `skewY` → `skew()`
- `xPercent`, `yPercent` → `translateX(%)`

### 16.2 Use `will-change` Sparingly

```ts
// Set before animation, remove after
gsap.set(".box", { willChange: "transform, opacity" });
gsap.to(".box", {
  x: 200,
  onComplete: () => gsap.set(".box", { willChange: "auto" }),
});
```

### 16.3 Use `force3D` for Hardware Acceleration

```ts
gsap.to(".box", { x: 200, force3D: true }); // forces translateZ(0) — GPU layer
```

### 16.4 Kill Animations on Cleanup (Critical for React)

`useGSAP` handles this automatically. If ever using raw `useEffect`:

```ts
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.to(".box", { x: 200 });
  }, containerRef);

  return () => ctx.revert(); // kills all animations and reverts to original state
}, []);
```

### 16.5 Avoid Creating Tweens in Render/Every Re-render

```tsx
// ❌ Bad — creates a new tween every render
function Component({ x }: { x: number }) {
  gsap.to(".box", { x }); // runs on every render!
  return <div className="box" />;
}

// ✅ Good — inside useGSAP with dependency
function Component({ x }: { x: number }) {
  const container = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.to(".box", { x, duration: 0.4 });
    },
    { scope: container, dependencies: [x] },
  );
  return (
    <div ref={container}>
      <div className="box" />
    </div>
  );
}
```

### 16.6 Batch DOM Reads — `ScrollTrigger.refresh()`

```ts
// After dynamic content loads (images, fonts, async data)
ScrollTrigger.refresh();

// Or use ResizeObserver pattern
ScrollTrigger.addEventListener("refreshInit", () => {
  // Runs before every refresh — ideal for recalculating positions
});
```

### 16.7 `gsap.ticker` for `requestAnimationFrame` Integration

```ts
// Add a function to GSAP's internal RAF loop
gsap.ticker.add((time, deltaTime, frame) => {
  // Runs every frame — use for canvas, WebGL, physics
  myCanvas.update(deltaTime);
});

// Remove when done
gsap.ticker.remove(myFunction);

// Lag smoothing — prevent huge jumps after tab switch/unfocus
gsap.ticker.lagSmoothing(500, 33); // (threshold ms, cap ms)
```

### 16.8 `matchMedia` for Responsive Animations

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function ResponsiveAnimation() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        // Desktop animations
        gsap.from(".title", { x: -100, opacity: 0 });
        return () => gsap.set(".title", { clearProps: "all" }); // cleanup
      });

      mm.add("(max-width: 767px)", () => {
        // Mobile animations
        gsap.from(".title", { y: 40, opacity: 0 });
        return () => gsap.set(".title", { clearProps: "all" });
      });

      return () => mm.revert(); // useGSAP calls this on unmount
    },
    { scope: container },
  );

  return (
    <div ref={container}>
      <h1 className="title">Hello</h1>
    </div>
  );
}
```

---

## 17. Real-World Component Recipes

### 17.1 Scroll-Triggered Section Reveal

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function SectionReveal({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".reveal-item", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: container },
  );

  return (
    <div ref={container} className="reveal-item">
      {children}
    </div>
  );
}
```

### 17.2 Animated Page Counter

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function CountUp({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current)
          ref.current.textContent = `${Math.round(obj.val)}${suffix}`;
      },
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });

  return <span ref={ref}>0{suffix}</span>;
}
```

### 17.3 Horizontal Scroll Sections

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SECTIONS = ["Section A", "Section B", "Section C", "Section D"];

export function HorizontalScroll() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const sections = gsap.utils.toArray<HTMLElement>(".h-panel");

      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          end: () =>
            `+=${container.current!.offsetWidth * (sections.length - 1)}`,
        },
      });
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      style={{ display: "flex", width: `${SECTIONS.length * 100}vw` }}
    >
      {SECTIONS.map((s) => (
        <div
          key={s}
          className="h-panel"
          style={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2>{s}</h2>
        </div>
      ))}
    </div>
  );
}
```

### 17.4 Cursor Follower

```tsx
"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";

export function CursorFollower() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const xTo = gsap.quickTo(cursor, "x", {
      duration: 0.4,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(cursor, "y", {
      duration: 0.4,
      ease: "power3.out",
    });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        top: -16,
        left: -16,
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: "2px solid #6366f1",
        pointerEvents: "none",
        zIndex: 9999,
        mixBlendMode: "difference",
      }}
    />
  );
}
```

### 17.5 Parallax Hero Image

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function ParallaxHero() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(".parallax-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: container },
  );

  return (
    <div
      ref={container}
      style={{ height: "100vh", overflow: "hidden", position: "relative" }}
    >
      <div
        className="parallax-bg"
        style={{
          position: "absolute",
          inset: "-30%",
          backgroundImage: "url(/hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
}
```

### 17.6 Navbar Hide/Show on Scroll

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function AnimatedNavbar() {
  const navRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    let lastScrollY = 0;

    ScrollTrigger.create({
      start: "top top",
      onUpdate: (self) => {
        const scrollY = self.scroll();
        if (scrollY < 80) {
          gsap.to(navRef.current, { y: 0, duration: 0.3, ease: "power2.out" });
          return;
        }
        if (scrollY > lastScrollY) {
          gsap.to(navRef.current, {
            y: "-100%",
            duration: 0.4,
            ease: "power2.inOut",
          });
        } else {
          gsap.to(navRef.current, { y: 0, duration: 0.3, ease: "power2.out" });
        }
        lastScrollY = scrollY;
      },
    });
  });

  return (
    <nav
      ref={navRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 50,
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(12px)",
      }}
    >
      Nav content
    </nav>
  );
}
```

### 17.7 Text Scramble / Glitch Effect (TextPlugin)

```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(TextPlugin, ScrambleTextPlugin);

export function ScrambleText({ words }: { words: string[] }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ repeat: -1 });

      words.forEach((word) => {
        tl.to(".scramble", {
          duration: 1,
          scrambleText: { text: word, chars: "upperCase", speed: 0.5 },
          ease: "none",
        }).to({}, { duration: 0.8 }); // pause between words
      });
    },
    { scope: container },
  );

  return (
    <div ref={container}>
      <span className="scramble">{words[0]}</span>
    </div>
  );
}
```

---

## 18. TypeScript Types Reference

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Tween vars
const vars: gsap.TweenVars = {
  x: 100,
  duration: 0.5,
  ease: "power2.out",
  onComplete: () => {},
};

// Timeline vars
const tlVars: gsap.TimelineVars = {
  defaults: { duration: 0.5 },
  repeat: -1,
  yoyo: true,
};

// ScrollTrigger vars
const stVars: ScrollTrigger.Vars = {
  trigger: ".el",
  start: "top 80%",
  scrub: 1,
};

// Ref typing for GSAP targets
const ref = useRef<HTMLDivElement>(null);
const tl = useRef<gsap.core.Timeline>(null);

// Store timeline in a ref
useGSAP(
  () => {
    tl.current = gsap.timeline();
    tl.current.to(".box", { x: 100 });
  },
  { scope: container },
);

// Pause from an external button
const handlePause = () => tl.current?.pause();
```

---

## 19. Common Gotchas & Debugging

| Issue                                 | Cause                               | Fix                                                       |
| ------------------------------------- | ----------------------------------- | --------------------------------------------------------- |
| Animation doesn't run in Next.js      | Component not marked `'use client'` | Add `'use client'` at top                                 |
| Plugin not found error                | Plugin not registered               | Call `gsap.registerPlugin(...)` before use                |
| ScrollTrigger fires in wrong position | Layout changes after init           | Call `ScrollTrigger.refresh()` after content loads        |
| Animations run twice in dev           | React Strict Mode double-invoke     | Use `useGSAP` — it handles Strict Mode correctly          |
| Animation persists after unmount      | Not cleaning up                     | Use `useGSAP` or `gsap.context().revert()` in cleanup     |
| `useLayoutEffect` SSR warning         | Using in Server Component           | Use `useIsomorphicLayoutEffect` util                      |
| Stagger on empty NodeList             | Selector runs before render         | Use `scope` + class selectors inside `useGSAP`            |
| clearProps not working                | Wrong property name                 | Use `clearProps: 'all'` or comma-separated CSS prop names |
| Timeline overlapping in loop          | Missing position parameter          | Use `'-=0.2'`, `'<'`, `'+='` position syntax              |

---

## 20. Quick-Reference Cheatsheet

```ts
// ── Core tweens
gsap.to(target, vars)
gsap.from(target, vars)
gsap.fromTo(target, fromVars, toVars)
gsap.set(target, vars)

// ── Timeline
const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.5 } });
tl.to('.a', {}).from('.b', {}, '-=0.2').fromTo('.c', {}, {}, '<');

// ── Stagger
gsap.from('.items', { opacity: 0, stagger: { amount: 0.8, from: 'center' } });

// ── Control
tween.pause() / .play() / .reverse() / .kill() / .progress(0.5) / .timeScale(2)

// ── ScrollTrigger
scrollTrigger: { trigger, start: 'top 80%', scrub: 1, pin: true, snap: 1/3 }

// ── Smart defaults
gsap.defaults({ ease: 'power2.out', duration: 0.6 });

// ── React hook
const { contextSafe } = useGSAP(() => { /* gsap code */ }, { scope: ref, dependencies: [dep] });

// ── Responsive
const mm = gsap.matchMedia();
mm.add('(min-width: 768px)', () => { /* desktop */ return () => { /* cleanup */ } });

// ── Quick setter (high-frequency updates — cursor follower, mouse tracking)
const xTo = gsap.quickTo(el, 'x', { duration: 0.3 });
xTo(mouseX); // call every mousemove — no new tween created

// ── Quick setter (instant, no animation)
const setX = gsap.quickSetter(el, 'x', 'px');
setX(100);

// ── Utils
gsap.utils.toArray('.cards') // → HTMLElement[]
gsap.utils.clamp(0, 100, value)
gsap.utils.mapRange(0, 100, 0, 1, value)
gsap.utils.wrap(0, 5, index)

// ── Kill all
gsap.killTweensOf(target)
gsap.killTweensOf('.all-boxes')
ScrollTrigger.getAll().forEach(st => st.kill())

// ── Register all plugins (do once)
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Draggable, MorphSVGPlugin,
  DrawSVGPlugin, MotionPathPlugin, TextPlugin, CustomEase);
```
