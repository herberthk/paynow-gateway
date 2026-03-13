---
name: framer-motion-animations
description: How to create advanced performance-optimized animations for React components using Motion (formerly Framer Motion) v12 — covers all use cases, hooks, variants, gestures, layout animations, exit animations, scroll, drag, SVG, keyframes, orchestration, and performance patterns. Kept up-to-date with Motion 12.35.0 (March 2026).
---

# Motion for React — Complete Animation Guide (v12, March 2026)

> **Package rename (v12):** The library previously known as `framer-motion` has been rebranded to **`motion`**. The npm package is now `motion` and imports come from `motion/react`. The old `framer-motion` package remains as a **legacy compatibility alias** — it still works, but new projects should use `motion`.

## 1. Installation & Setup

### New projects (Motion v12+)

```bash
bun add motion
# or
yarn add motion
# or
pnpm add motion
```

Import from the React-specific entry point:

```tsx
import { motion, AnimatePresence, useScroll } from "motion/react";
```

### Existing projects (framer-motion legacy alias)

If your project already has `framer-motion` installed (e.g. `^12.x`), **it still works** — `framer-motion` is now a thin re-export of `motion` under the hood. All APIs are identical.

```bash
# framer-motion is a compatibility alias — no breaking changes
npm install framer-motion@latest   # resolves to motion v12 internally
```

```tsx
// Legacy import — still valid in v12
import { motion, AnimatePresence } from "framer-motion";
```

> **Recommended:** Migrate to `motion/react` imports over time. Both work identically in v12.

No provider is required for basic usage. For layout animations spanning multiple components, wrap the tree in `<LayoutGroup>`.

---

## 2. Core Primitives

### 2.1 `motion` Components

Every HTML/SVG element has a `motion` counterpart. Motion intercepts the render and applies animation transforms via the Web Animations API (WAAPI) or its own JS engine.

```tsx
import { motion } from "motion/react"; // v12 (or 'framer-motion' legacy alias)

// Basic animated div
const Box = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    style={{ width: 100, height: 100, background: "royalblue" }}
  />
);
```

**Key props:**

| Prop          | Purpose                                                    |
| ------------- | ---------------------------------------------------------- |
| `initial`     | Start state (can be `false` to disable mount animation)    |
| `animate`     | Target animation state                                     |
| `exit`        | State when component unmounts (requires `AnimatePresence`) |
| `transition`  | Controls timing, easing, spring, etc.                      |
| `variants`    | Named state map for orchestration                          |
| `whileHover`  | Animate while pointer is hovering                          |
| `whileTap`    | Animate while pointer is pressing                          |
| `whileFocus`  | Animate while element is focused                           |
| `whileDrag`   | Animate while element is being dragged                     |
| `whileInView` | Animate while element is in the viewport                   |
| `layout`      | Enable automatic layout animation                          |
| `layoutId`    | Shared element transition key                              |
| `drag`        | Enable drag (`true`, `'x'`, `'y'`)                         |
| `style`       | MotionValues or regular CSS                                |

### 2.2 Custom Components with `motion()`

Wrap any React component to make it animatable:

```tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MotionLink = motion(Link);

// Usage — pass all motion props
<MotionLink to="/about" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
  About
</MotionLink>;
```

> **Rule**: The wrapped component must forward `ref` via `React.forwardRef` for layout animations to work correctly.

---

## 3. Transition Configuration

```tsx
// Spring (default for physical feel)
transition={{ type: 'spring', stiffness: 300, damping: 24 }}

// Tween (duration-based)
transition={{ type: 'tween', duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}

// Inertia (momentum/drag release)
transition={{ type: 'inertia', velocity: 200, power: 0.4 }}

// Per-property transitions
transition={{
  opacity: { duration: 0.2 },
  scale: { type: 'spring', stiffness: 400, damping: 20 },
}}

// Delay & repeat
transition={{ delay: 0.3, repeat: Infinity, repeatType: 'mirror', duration: 1 }}
```

**Easing presets:** `'linear'`, `'easeIn'`, `'easeOut'`, `'easeInOut'`, `'circIn'`, `'circOut'`, `'backIn'`, `'backOut'`, `'anticipate'`, or a cubic-bezier array `[x1, y1, x2, y2]`.

---

## 4. Variants — Orchestrating Multi-Element Animations

Variants let you define named states and propagate them through the component tree without wiring every child manually.

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      // Stagger children by 0.1s each
      staggerChildren: 0.1,
      delayChildren: 0.2,
      when: "beforeChildren", // 'afterChildren' | 'beforeChildren'
    },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  exit: { opacity: 0, y: -10 },
};

const AnimatedList = ({ items }: { items: string[] }) => (
  <motion.ul
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
  >
    {items.map((item) => (
      <motion.li key={item} variants={itemVariants}>
        {item}
      </motion.li>
    ))}
  </motion.ul>
);
```

> **Key insight**: When a parent has `animate="visible"`, Framer Motion propagates the variant name down to all children automatically — children only need `variants` prop.

### Conditional Variants

```tsx
const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  pressed: { scale: 0.97 },
};

<motion.button
  variants={buttonVariants}
  initial="rest"
  whileHover="hover"
  whileTap="pressed"
>
  Click me
</motion.button>;
```

---

## 5. AnimatePresence — Mount/Unmount Animations

`AnimatePresence` enables `exit` animations when components are conditionally removed from the tree.

```tsx
import { AnimatePresence, motion } from "framer-motion";

const Modal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        key="modal-backdrop"
        className="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          key="modal-content"
          className="modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          Modal content
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
```

### `mode` prop

```tsx
// 'sync' (default) — enter and exit at the same time
// 'wait'          — wait for exit to finish before entering
// 'popLayout'     — exiting element is popped out of layout flow

<AnimatePresence mode="wait">
  {/* Only one child at a time */}
  <motion.div key={currentPage} ... />
</AnimatePresence>
```

### Page / Route Transitions

```tsx
// _app.tsx or layout wrapper
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation"; // or react-router useLocation

const pageVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## 6. Layout Animations

Framer Motion can automatically animate between layout changes (reordering, size changes, position changes) using the FLIP technique.

```tsx
// Add layout prop to auto-animate layout changes
<motion.div layout>
  {/* If this div changes size or position, it animates */}
</motion.div>

// layout="position" — only animate position, not size
// layout="size"     — only animate size, not position
// layout="preserve-aspect" — preserve aspect ratio while changing size
```

### Shared Element Transitions with `layoutId`

```tsx
// Thumbnail → Detail view shared transition
const items = ["A", "B", "C"];

function Gallery() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <div style={{ display: "flex", gap: 8 }}>
        {items.map((id) => (
          <motion.div
            key={id}
            layoutId={`card-${id}`}
            onClick={() => setSelected(id)}
            style={{
              width: 80,
              height: 80,
              background: "coral",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            key="expanded"
            layoutId={`card-${selected}`}
            style={{
              position: "fixed",
              inset: 0,
              background: "coral",
              zIndex: 100,
            }}
            onClick={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
```

### LayoutGroup — Cross-Component Layout Sync

```tsx
import { LayoutGroup } from "framer-motion";

// Wrap components that share layout animation context
<LayoutGroup id="tabs">
  <TabA />
  <TabB />
</LayoutGroup>;
```

---

## 7. Gestures

### Hover

```tsx
<motion.div
  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
/>
```

### Tap / Press

```tsx
<motion.button whileTap={{ scale: 0.95 }}>Press me</motion.button>
```

### Drag

```tsx
<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
  dragElastic={0.2} // 0 = rigid, 1 = fully elastic
  dragMomentum={true} // apply inertia on release
  onDragEnd={(event, info) => {
    console.log(info.offset, info.velocity);
  }}
/>;

// Drag with ref constraints
const constraintsRef = useRef(null);

<motion.div
  ref={constraintsRef}
  style={{ position: "relative", overflow: "hidden" }}
>
  <motion.div drag dragConstraints={constraintsRef} />
</motion.div>;
```

### Focus

```tsx
<motion.input
  whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)" }}
/>
```

---

## 8. Scroll-Linked Animations

### `whileInView` — Trigger on Viewport Entry

```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px", amount: 0.3 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  Reveals on scroll
</motion.div>
```

> **`viewport` options**: `once` (animate only first time), `margin` (rootMargin), `amount` (0–1 intersection ratio).

### `useScroll` — Scroll Progress MotionValues

```tsx
import { useScroll, useTransform, motion } from "framer-motion";

function ParallaxHero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return <motion.div style={{ y, opacity }}>Hero content</motion.div>;
}

// Element-relative scroll
function ElementScrollProgress() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"], // [entry, exit] in form ["elementEdge containerEdge"]
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

  return <motion.div ref={ref} style={{ scale }} />;
}
```

### `useSpring` — Smoothed Scroll Value

```tsx
import { useScroll, useSpring, motion } from "framer-motion";

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: "royalblue",
        transformOrigin: "left",
        scaleX,
      }}
    />
  );
}
```

---

## 9. MotionValues — Fine-Grained Reactive Values

MotionValues are reactive values that **bypass React re-renders** entirely, updating directly via the DOM.

```tsx
import { useMotionValue, useTransform, motion } from "framer-motion";

function Card() {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  return (
    <motion.div
      drag="x"
      style={{ x, rotate, opacity }}
      dragConstraints={{ left: -200, right: 200 }}
    />
  );
}
```

### `useMotionValueEvent` — React to MotionValue changes without re-renders

```tsx
import { useMotionValueEvent, useScroll } from "framer-motion";

function Header() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(latest > previous && latest > 150);
  });

  return (
    <motion.header
      variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    />
  );
}
```

---

## 10. Keyframes

Use arrays to define multi-step keyframes:

```tsx
<motion.div
  animate={{
    scale: [1, 1.2, 1.1, 1.3, 1],
    opacity: [1, 0.8, 1, 0.9, 1],
    rotate: [0, 10, -10, 0],
  }}
  transition={{
    duration: 2,
    ease: "easeInOut",
    times: [0, 0.2, 0.5, 0.8, 1], // keyframe offsets (0–1)
    repeat: Infinity,
    repeatDelay: 1,
  }}
/>
```

---

## 11. `useAnimate` — Imperative Animations

Use for sequence-driven / event-triggered animations outside of the declarative model:

```tsx
import { useAnimate } from "framer-motion";

function NotificationButton() {
  const [scope, animate] = useAnimate();

  const shake = async () => {
    await animate(scope.current, { x: [-4, 4, -4, 4, 0] }, { duration: 0.4 });
    await animate(scope.current, { scale: [1, 1.1, 1] }, { duration: 0.3 });
  };

  return (
    <button ref={scope} onClick={shake}>
      Notify
    </button>
  );
}
```

### Scoped Animations for Child Elements

```tsx
const [scope, animate] = useAnimate();

const runSequence = async () => {
  // Use CSS selector or ref within scope
  await animate(".title", { opacity: 1, y: 0 }, { duration: 0.4 });
  await animate(
    ".subtitle",
    { opacity: 1, y: 0 },
    { duration: 0.4, delay: 0.1 },
  );
  animate(".cta", { opacity: 1, scale: 1 }, { duration: 0.3 });
};

return (
  <div ref={scope}>
    <h1 className="title" style={{ opacity: 0, y: 20 }}>
      Hello
    </h1>
    <p className="subtitle" style={{ opacity: 0, y: 20 }}>
      World
    </p>
    <button className="cta" style={{ opacity: 0, scale: 0.9 }}>
      Go
    </button>
  </div>
);
```

---

## 12. `useAnimationControls` — External Triggering

```tsx
import { useAnimationControls, motion } from "framer-motion";

function ControlledBox() {
  const controls = useAnimationControls();

  const handleClick = async () => {
    await controls.start({ x: 100, transition: { duration: 0.5 } });
    await controls.start({ rotate: 360, transition: { duration: 0.4 } });
    controls.start({ x: 0, rotate: 0 });
  };

  return (
    <>
      <motion.div animate={controls} initial={{ x: 0 }} />
      <button onClick={handleClick}>Animate</button>
    </>
  );
}
```

---

## 13. SVG Animations

### Path Drawing

```tsx
<motion.path
  d="M10 80 Q 95 10 180 80"
  stroke="royalblue"
  strokeWidth={3}
  fill="transparent"
  initial={{ pathLength: 0, opacity: 0 }}
  animate={{ pathLength: 1, opacity: 1 }}
  transition={{ duration: 1.5, ease: "easeInOut" }}
/>
```

### SVG Icon Morphing

```tsx
const iconVariants = {
  closed: { d: "M3 12h18M3 6h18M3 18h18" }, // hamburger
  open: { d: "M6 18L18 6M6 6l12 12" }, // X
};

<motion.path
  variants={iconVariants}
  initial="closed"
  animate={isOpen ? "open" : "closed"}
  transition={{ duration: 0.3 }}
/>;
```

---

## 14. `Reorder` — Drag-to-Reorder Lists

```tsx
import { Reorder } from "framer-motion";
import { useState } from "react";

function SortableList() {
  const [items, setItems] = useState(["A", "B", "C", "D"]);

  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems} as="ul">
      {items.map((item) => (
        <Reorder.Item key={item} value={item} as="li">
          {item}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
```

### With Drag Handle

```tsx
import { Reorder, useDragControls } from "framer-motion";

function DraggableItem({ item }: { item: string }) {
  const controls = useDragControls();

  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls}>
      <span onPointerDown={(e) => controls.start(e)} style={{ cursor: "grab" }}>
        ⠿
      </span>
      {item}
    </Reorder.Item>
  );
}
```

---

## 15. Hooks Reference

| Hook                                 | Purpose                                            |
| ------------------------------------ | -------------------------------------------------- |
| `useMotionValue(initial)`            | Create a reactive value that bypasses re-renders   |
| `useTransform(mv, input, output)`    | Derive a new MotionValue from another              |
| `useSpring(value, config)`           | Apply spring physics to a MotionValue              |
| `useScroll(options?)`                | Get `scrollX/Y` and `scrollXProgress/YProgress`    |
| `useVelocity(mv)`                    | Track velocity of a MotionValue                    |
| `useAnimate()`                       | Imperative animations with scope                   |
| `useAnimationControls()`             | External control of `animate` prop                 |
| `useInView(ref, options?)`           | Boolean — is element in viewport                   |
| `useMotionValueEvent(mv, event, cb)` | Subscribe to MotionValue events without re-renders |
| `useReducedMotion()`                 | Detect user's reduced-motion preference            |
| `useDragControls()`                  | Manually trigger drag from a separate element      |
| `useWillChange()`                    | Auto-manage `will-change` CSS property             |

---

## 16. Accessibility — Reduced Motion

Always respect the user's OS-level "reduce motion" preference:

```tsx
import { useReducedMotion } from "framer-motion";

function AnimatedCard() {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={variants} initial="hidden" animate="visible">
      Content
    </motion.div>
  );
}
```

### Global Reduced Motion Config

```tsx
// In your app root — disable all animations for reduced motion users
import { MotionConfig } from "framer-motion";

<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>;
```

Options: `"user"` (respects OS pref) | `"always"` | `"never"`.

---

## 17. `MotionConfig` — Global Configuration

```tsx
import { MotionConfig } from "framer-motion";

<MotionConfig
  transition={{ type: "spring", stiffness: 300, damping: 24 }}
  reducedMotion="user"
>
  <App />
</MotionConfig>;
```

All `motion` components inside will use these defaults unless overridden.

---

## 18. Performance Best Practices

### 18.1 Only Animate GPU-Composited Properties

Animate only properties the browser can handle on the GPU compositor thread without triggering layout or paint. This gives 60fps+ animations even on low-end devices.

| ✅ Compositor-safe (fast)               | ❌ Triggers layout/paint (slow)  |
| --------------------------------------- | -------------------------------- |
| `transform` (x, y, scale, rotate, skew) | `width`, `height`, `top`, `left` |
| `opacity`                               | `margin`, `padding`, `border`    |
| `filter` (blur, brightness)             | `background-color` (can be slow) |
| `clip-path`                             | `font-size`, `line-height`       |

```tsx
// ✅ Good — only transform/opacity
<motion.div animate={{ x: 100, opacity: 1 }} />

// ❌ Bad — triggers layout
<motion.div animate={{ width: 200, left: 100 }} />
```

### 18.2 Use `useMotionValue` + `useTransform` for High-Frequency Updates

MotionValues update the DOM directly, bypassing React diffing entirely:

```tsx
// ✅ No re-renders on scroll/mouse move
const mouseX = useMotionValue(0);
const rotateY = useTransform(mouseX, [-500, 500], [-25, 25]);

const handleMouseMove = (e: React.MouseEvent) => {
  mouseX.set(e.clientX - window.innerWidth / 2);
};

<motion.div onMouseMove={handleMouseMove} style={{ rotateY }} />;
```

### 18.3 `layout` Animation — Avoid on Very Large Subtrees

`layout` prop triggers a FLIP calculation on every render. Scope it carefully:

```tsx
// ✅ Only the moving element gets layout
<motion.div layout style={{ position: 'absolute' }} />

// ❌ Don't add layout to a div containing thousands of children
<motion.div layout>{/* 1000 items */}</motion.div>
```

### 18.4 `LazyMotion` — Code-Split the Animation Engine

Reduces bundle size by ~17kb (gzip) for the default renderer:

```tsx
import { LazyMotion, domAnimation, m } from "framer-motion";

// domAnimation includes: animate, exit, drag, layout, gestures
// domMax additionally includes: pan gestures, layoutId

<LazyMotion features={domAnimation} strict>
  {/* Use `m` instead of `motion` */}
  <m.div animate={{ opacity: 1 }} />
</LazyMotion>;

// Async load features for maximum code-splitting
const loadFeatures = () => import("./features").then((res) => res.default);

<LazyMotion features={loadFeatures}>
  <m.div animate={{ opacity: 1 }} />
</LazyMotion>;
```

```tsx
// features.ts
import { domMax } from "framer-motion";
export default domMax;
```

### 18.5 Avoid Re-creating Variant Objects on Each Render

```tsx
// ❌ Bad — new object reference every render, causes unnecessary work
function Component() {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
    />
  );
}

// ✅ Good — defined outside component or memoized
const variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

function Component() {
  return <motion.div variants={variants} />;
}
```

### 18.6 `will-change` Management

Framer Motion automatically sets `will-change: transform` when an animation starts and removes it when it ends. You can control this via:

```tsx
import { useWillChange } from "framer-motion";

function AnimatedCard() {
  const willChange = useWillChange();
  return <motion.div style={{ willChange }} animate={{ x: 100 }} />;
}
```

> **Warning**: Don't manually set `will-change: transform` on many elements simultaneously — it consumes GPU memory layers.

### 18.7 Disable Animations for Static Renders (SSR / Tests)

```tsx
// In Next.js or SSR contexts
<MotionConfig reducedMotion="always">
  {/* No animations rendered server-side */}
</MotionConfig>;

// In tests
import { MotionGlobalConfig } from "framer-motion";
MotionGlobalConfig.skipAnimations = true;
```

### 18.8 Batch Multiple Properties

Rather than chaining `.start()` calls, animate multiple properties together:

```tsx
// ✅ Single animation tick
controls.start({ x: 100, opacity: 1, scale: 1.1 });

// ❌ Three separate ticks
controls.start({ x: 100 });
controls.start({ opacity: 1 });
controls.start({ scale: 1.1 });
```

---

## 19. Advanced Patterns

### 19.1 Staggered List Reveal

```tsx
const list = {
  visible: { transition: { staggerChildren: 0.08 } },
  hidden: {},
};
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

<motion.ul
  variants={list}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  {data.map((d) => (
    <motion.li key={d.id} variants={item}>
      {d.label}
    </motion.li>
  ))}
</motion.ul>;
```

### 19.2 Animated Counter

```tsx
import { useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { animate } from "framer-motion";

function Counter({ from = 0, to = 100 }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(from, to, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (value) => {
        if (ref.current) ref.current.textContent = Math.round(value).toString();
      },
    });
    return () => controls.stop();
  }, [inView, from, to]);

  return <span ref={ref}>{from}</span>;
}
```

### 19.3 Mouse-Tracked 3D Card Tilt

```tsx
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

function TiltCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}
```

### 19.4 Morphing / Crossfade Between Two Components

```tsx
<AnimatePresence mode="wait">
  {isA ? (
    <motion.div
      key="a"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Component A
    </motion.div>
  ) : (
    <motion.div
      key="b"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Component B
    </motion.div>
  )}
</AnimatePresence>
```

### 19.5 Infinite Marquee / Ticker

```tsx
const marqueeVariants = {
  animate: {
    x: [0, -1035],
    transition: {
      x: { repeat: Infinity, repeatType: "loop", duration: 20, ease: "linear" },
    },
  },
};

<div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
  <motion.div
    variants={marqueeVariants}
    animate="animate"
    style={{ display: "inline-block" }}
  >
    {/* Duplicate content for seamless loop */}
    {content}
    {content}
  </motion.div>
</div>;
```

### 19.6 Scroll-Linked Parallax

```tsx
function ParallaxLayer({
  offset = 50,
  children,
}: {
  offset?: number;
  children: React.ReactNode;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
}
```

### 19.7 Gesture-Driven Swipe Cards

```tsx
const SWIPE_THRESHOLD = 100;

function SwipeCard({
  onDismiss,
}: {
  onDismiss: (dir: "left" | "right") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  return (
    <motion.div
      drag="x"
      style={{ x, rotate, opacity }}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_THRESHOLD) onDismiss("right");
        else if (info.offset.x < -SWIPE_THRESHOLD) onDismiss("left");
      }}
    />
  );
}
```

### 19.8 Flip Animation Between Variants with `layout`

```tsx
function Accordion({ title, content }: { title: string; content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setIsOpen(!isOpen)}
      style={{ overflow: "hidden" }}
    >
      <motion.h3 layout>{title}</motion.h3>
      <AnimatePresence>
        {isOpen && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {content}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

---

## 20. Full Example — Animated Dashboard Card

```tsx
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { useState } from "react";

const cardVariants = {
  rest: { scale: 1, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
  hover: {
    scale: 1.02,
    boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
    transition: { type: "spring", stiffness: 400, damping: 17 },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 500, damping: 22 },
  },
  exit: { opacity: 0, scale: 0.7, transition: { duration: 0.15 } },
};

export function DashboardCard({
  title,
  value,
  badge,
}: {
  title: string;
  value: number;
  badge?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(
    useSpring(y, { stiffness: 150, damping: 20 }),
    [-0.5, 0.5],
    ["8deg", "-8deg"],
  );
  const rotateY = useTransform(
    useSpring(x, { stiffness: 150, damping: 20 }),
    [-0.5, 0.5],
    ["-8deg", "8deg"],
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        borderRadius: 16,
        padding: 24,
        background: "#fff",
        cursor: "pointer",
      }}
      onClick={() => setIsExpanded(!isExpanded)}
      layout
    >
      <motion.h2 layout style={{ margin: 0 }}>
        {title}
      </motion.h2>
      <motion.span layout style={{ fontSize: 40, fontWeight: 700 }}>
        {value}
      </motion.span>

      <AnimatePresence>
        {badge && (
          <motion.span
            key="badge"
            variants={badgeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p>Expanded details about {title}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

---

## 21. Common Gotchas & Debugging

| Issue                                              | Cause                                      | Fix                                                                 |
| -------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| Exit animation not playing                         | `AnimatePresence` missing                  | Wrap conditional render with `<AnimatePresence>`                    |
| Layout animation jumps                             | Missing `layout` prop on sibling           | Add `layout` to all siblings sharing the same space                 |
| `layoutId` shared transition broken                | Components unmount/mount at same time      | Use `AnimatePresence` around conditional with `mode="wait"`         |
| Drag snaps back instantly                          | No `dragConstraints` or `dragElastic`      | Set `dragConstraints={{ left: 0, right: 0 }}` + `dragElastic={0.2}` |
| Stagger not working                                | Children don't inherit parent variant name | Ensure children use `variants` prop with matching keys              |
| `initial={false}` not working on `AnimatePresence` | Used on wrong element                      | Place `initial={false}` on `<AnimatePresence>` itself, not child    |
| Animation re-triggers on every render              | Variant objects defined inside component   | Move variant definitions outside component scope                    |
| High JS CPU on scroll                              | Using `onChange` on MotionValue            | Use `useMotionValueEvent` instead of `.onChange()` (deprecated)     |
| TypeScript errors with `motion()`                  | Missing `ref` forwarding                   | Wrap component with `React.forwardRef` before passing to `motion()` |

---

## 22. What's New in Motion v12 (Current)

### Package & Import Changes (Breaking for new setups)

| Before (framer-motion)                    | After (motion v12)                      |
| ----------------------------------------- | --------------------------------------- |
| `npm install framer-motion`               | `npm install motion`                    |
| `import { motion } from 'framer-motion'`  | `import { motion } from 'motion/react'` |
| `import { animate } from 'framer-motion'` | `import { animate } from 'motion'`      |
| `import { m } from 'framer-motion'`       | `import { m } from 'motion/react'`      |

> `framer-motion` package still works as a compatibility alias — no removal planned.

### New APIs in v12

#### `transition.inherit` (v12.32.0)

When `true`, a child element inherits transition values from a less-specific parent transition:

```tsx
<motion.div
  animate={{ opacity: 1, x: 100 }}
  transition={{
    duration: 0.5,
    // x overrides with its own duration but inherits ease from parent
    x: { duration: 0.8, inherit: true },
  }}
/>
```

#### `propagate.tap` (v12.33.0)

Prevents tap gestures from bubbling up to parent `motion` elements:

```tsx
<motion.div whileTap={{ scale: 0.95 }}>
  {/* This inner button's tap won't trigger parent's whileTap */}
  <motion.button propagate={{ tap: false }} whileTap={{ scale: 0.9 }}>
    Click me
  </motion.button>
</motion.div>
```

#### `MotionConfig.skipAnimations` (v12.30.0)

Skip all animations globally via `MotionConfig` — cleaner than `MotionGlobalConfig.skipAnimations` for component-tree scoping:

```tsx
<MotionConfig skipAnimations={process.env.NODE_ENV === "test"}>
  <App />
</MotionConfig>
```

#### Bi-directional Sequence Callbacks (v12.31.0)

`animate()` sequences now support callbacks that fire when playing forward **and** in reverse:

```tsx
animate(
  [
    [element, { x: 100 }],
    () => console.log("reached end"), // fires on forward play
    [element, { x: 200 }],
  ],
  { direction: "reverse" },
); // callbacks fire in reverse order too
```

#### `AnimatePresence` `mode` is now changeable (v12.31.2)

Previously the `mode` prop was read once. In v12 it can be changed dynamically:

```tsx
<AnimatePresence mode={isLoading ? "wait" : "sync"}>{children}</AnimatePresence>
```

### Retained from v11 (still current)

- `useMotionValueEvent` — replaces deprecated `.onChange()` / `.on()` pattern
- `animate()` — returns `AnimationPlaybackControls` with `.play()`, `.pause()`, `.stop()`, `.cancel()`, `.complete()`, `.time`
- `LazyMotion` with `domAnimation` — recommended for production bundle size
- `useAnimate` — preferred over `useAnimationControls` for imperative sequences
- `MotionConfig reducedMotion="user"` — respects OS reduced-motion preference

---

## 23. Standalone `animate()` Function

The `animate()` function can be used completely outside React — useful for one-shot animations, counters, colour interpolation, or any value over time.

```tsx
import { animate } from "framer-motion";

// Animate a raw DOM element
animate("#box", { x: 200, opacity: 0.5 }, { duration: 0.6, ease: "easeOut" });

// Animate a JS value (no DOM needed)
const controls = animate(0, 100, {
  duration: 1.5,
  onUpdate: (v) => console.log(Math.round(v)),
  onComplete: () => console.log("done"),
});

// Pause / resume / cancel
controls.pause();
controls.play();
controls.stop();
controls.cancel(); // resets to initial
controls.complete(); // jumps to final value

// Scrub manually (useful for scroll-driven animations outside React)
controls.pause();
controls.time = 0.75; // set playhead in seconds
```

### `animate()` with CSS Variables

```tsx
animate(
  ":root",
  {
    "--primary": "#6366f1",
    "--bg": "#0f172a",
  },
  { duration: 0.4 },
);
```

### `animate()` Sequence (sequential steps without async/await)

```tsx
import { animate } from "framer-motion";

// Steps run sequentially as an array: [element, keyframes, options]
animate([
  ["#step-1", { opacity: 1, y: 0 }, { duration: 0.4 }],
  ["#step-2", { opacity: 1, y: 0 }, { duration: 0.4, at: "-0.1" }], // overlap by 0.1s
  ["#step-3", { scale: 1 }, { duration: 0.3, at: "+0.2" }], // delay by 0.2s after previous
]);
```

**`at` options:**

- `at: 0.5` — absolute time in seconds from sequence start
- `at: '<'` — at the start of the previous animation
- `at: '+'` — at the end of the previous animation (default)
- `at: '-0.1'` — 0.1s before the end of the previous animation
- `at: '+0.2'` — 0.2s after the end of the previous animation

---

## 24. `useVelocity` — Velocity-Driven Effects

Track the rate-of-change of any MotionValue to create velocity-sensitive effects.

```tsx
import {
  useMotionValue,
  useVelocity,
  useTransform,
  useSpring,
  motion,
} from "framer-motion";

function VelocityCard() {
  const x = useMotionValue(0);
  const xVelocity = useVelocity(x);

  // Skew proportional to drag velocity
  const skewX = useTransform(xVelocity, [-3000, 3000], [-20, 20]);
  const skewXSmoothed = useSpring(skewX, { stiffness: 300, damping: 40 });

  return (
    <motion.div
      drag="x"
      style={{ x, skewX: skewXSmoothed }}
      dragConstraints={{ left: -300, right: 300 }}
    >
      Drag me
    </motion.div>
  );
}
```

---

## 25. `useInView` Hook

Boolean hook version of `whileInView` — useful when you need imperative control.

```tsx
import { useInView } from "framer-motion";
import { useRef } from "react";

function FadeSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true, // only trigger once
    margin: "-100px", // rootMargin equivalent
    amount: 0.5, // 50% of element must be visible
  });

  return (
    <div
      ref={ref}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "none" : "translateY(30px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {children}
    </div>
  );
}
```

---

## 26. `useMotionTemplate` — Dynamic CSS String Values

Compose MotionValues into a CSS string that updates without re-renders.

```tsx
import { useMotionValue, useMotionTemplate, motion } from "framer-motion";

function GlowCard() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Reactive radial-gradient string
  const background = useMotionTemplate`radial-gradient(
    400px at ${mouseX}px ${mouseY}px,
    rgba(99,102,241,0.15),
    transparent 80%
  )`;

  const handleMouseMove = ({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <motion.div onMouseMove={handleMouseMove} style={{ background }}>
      Hover me
    </motion.div>
  );
}
```

---

## 27. TypeScript — Full Typing Guide

### Typed Variants

```tsx
import { Variants } from "framer-motion";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};
```

### Typed MotionValues

```tsx
import { useMotionValue, MotionValue } from "framer-motion";

const x: MotionValue<number> = useMotionValue(0);
const color: MotionValue<string> = useMotionValue("#fff");
```

### Typed Transition

```tsx
import { Transition } from "framer-motion";

const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 20,
};
```

### Typed `animate()` Controls

```tsx
import { AnimationPlaybackControls } from "framer-motion";

let controls: AnimationPlaybackControls;
controls = animate("#el", { opacity: 1 }, { duration: 0.3 });
```

### Typed Custom `motion()` Component

```tsx
import { motion, MotionProps } from "framer-motion";
import { ComponentPropsWithRef, forwardRef } from "react";

type CardProps = MotionProps &
  ComponentPropsWithRef<"div"> & {
    elevated?: boolean;
  };

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      style={{ boxShadow: elevated ? "0 8px 30px rgba(0,0,0,0.2)" : "none" }}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
Card.displayName = "Card";
```

### Typed Drag Event Handler

```tsx
import { PanInfo } from "framer-motion";

const handleDragEnd = (
  event: MouseEvent | TouchEvent | PointerEvent,
  info: PanInfo,
) => {
  console.log(info.point.x, info.velocity.x, info.offset.x);
};
```

---

## 28. Testing Framer Motion Components

### Skip All Animations in Tests

```tsx
// vitest.setup.ts or jest.setup.ts
import { MotionGlobalConfig } from "framer-motion";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});
```

### Mocking `framer-motion` Entirely

```tsx
// __mocks__/framer-motion.tsx
const actual = jest.requireActual("framer-motion");
const React = require("react");

const mockMotion = new Proxy(
  {},
  {
    get: (_, tag: string) =>
      React.forwardRef(({ children, ...props }: any, ref: any) =>
        React.createElement(tag, { ...props, ref }, children),
      ),
  },
);

module.exports = {
  ...actual,
  motion: mockMotion,
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({ start: jest.fn(), stop: jest.fn() }),
  useInView: () => true,
  useScroll: () => ({
    scrollY: { get: () => 0 },
    scrollYProgress: { get: () => 0 },
  }),
};
```

### Testing Animation State with `@testing-library/react`

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("modal renders with correct exit state", async () => {
  const { rerender } = render(<Modal isOpen={true} onClose={() => {}} />);
  expect(screen.getByRole("dialog")).toBeInTheDocument();

  rerender(<Modal isOpen={false} onClose={() => {}} />);
  // With skipAnimations=true, exit happens synchronously
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
```

---

## 29. Next.js App Router Integration

### Marking Client Components

Since `framer-motion` uses browser APIs (`requestAnimationFrame`, DOM), all components using it must be client components:

```tsx
"use client"; // REQUIRED at top of any file using framer-motion

import { motion } from "framer-motion";
```

### Server Component Pattern — Delegate to Client

```tsx
// app/page.tsx (Server Component — NO 'use client')
import { HeroSection } from "@/components/HeroSection";

export default function Page() {
  return <HeroSection />;
}
```

```tsx
// components/HeroSection.tsx
"use client";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      Hero
    </motion.section>
  );
}
```

### Page Transitions in App Router

```tsx
// components/PageTransition.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

```tsx
// app/layout.tsx
import { PageTransition } from "@/components/PageTransition";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
```

### Optimized Bundle with `LazyMotion` in Next.js

```tsx
// components/providers/MotionProvider.tsx
"use client";
import { LazyMotion } from "framer-motion";

const loadFeatures = () => import("./motion-features").then((m) => m.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
```

```tsx
// components/providers/motion-features.ts
import { domAnimation } from "framer-motion";
export default domAnimation;
```

```tsx
// app/layout.tsx
import { MotionProvider } from "@/components/providers/MotionProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
```

---

## 30. Real-World Component Recipes

### 30.1 Animated Navigation Bar (Hide on Scroll Down)

```tsx
"use client";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(latest > prev && latest > 80);
  });

  return (
    <motion.nav
      variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "rgba(10,10,10,0.8)",
        backdropFilter: "blur(12px)",
        zIndex: 50,
      }}
    >
      Navigation
    </motion.nav>
  );
}
```

### 30.2 Toast Notification Stack

```tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type Toast = { id: number; message: string };

const toastVariants = {
  initial: { opacity: 0, x: 60, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.2 } },
};

export function ToastStack() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = 0;

  const addToast = (msg: string) => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, message: msg }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  };

  return (
    <>
      <button onClick={() => addToast("Action completed!")}>Show Toast</button>
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              variants={toastVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{
                padding: "12px 20px",
                background: "#1e293b",
                color: "#fff",
                borderRadius: 8,
              }}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
```

### 30.3 Animated Hero Section with Staggered Text

```tsx
"use client";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

export function Hero() {
  return (
    <motion.section variants={container} initial="hidden" animate="visible">
      <motion.h1 variants={item} style={{ fontSize: 64, fontWeight: 800 }}>
        Build Faster.
      </motion.h1>
      <motion.p variants={item} style={{ fontSize: 20, opacity: 0.7 }}>
        The most powerful animation library for React.
      </motion.p>
      <motion.div variants={item}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            padding: "14px 32px",
            borderRadius: 8,
            background: "#6366f1",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Get Started
        </motion.button>
      </motion.div>
    </motion.section>
  );
}
```

### 30.4 Skeleton Loader with Shimmer

```tsx
"use client";
import { motion } from "framer-motion";

const shimmer = {
  animate: {
    backgroundPosition: ["200% center", "-200% center"],
    transition: { repeat: Infinity, duration: 1.8, ease: "linear" },
  },
};

function Skeleton({
  width = "100%",
  height = 16,
}: {
  width?: number | string;
  height?: number;
}) {
  return (
    <motion.div
      variants={shimmer}
      animate="animate"
      style={{
        width,
        height,
        borderRadius: 6,
        background:
          "linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)",
        backgroundSize: "400% 100%",
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}
    >
      <Skeleton height={20} width="60%" />
      <Skeleton height={14} />
      <Skeleton height={14} />
      <Skeleton height={14} width="80%" />
    </div>
  );
}
```

### 30.5 Animated Tabs with Underline Indicator

```tsx
"use client";
import { motion } from "framer-motion";
import { useState } from "react";

const tabs = ["Overview", "Analytics", "Settings"];

export function AnimatedTabs() {
  const [active, setActive] = useState(tabs[0]);

  return (
    <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #1e293b" }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          style={{
            position: "relative",
            padding: "10px 20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: active === tab ? "#6366f1" : "#94a3b8",
            fontWeight: active === tab ? 600 : 400,
            transition: "color 0.2s",
          }}
        >
          {tab}
          {active === tab && (
            <motion.div
              layoutId="tab-underline"
              style={{
                position: "absolute",
                bottom: -2,
                left: 0,
                right: 0,
                height: 2,
                background: "#6366f1",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
```

### 30.6 Circular Progress Ring

```tsx
"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CircularProgress({ target = 75 }: { target?: number }) {
  const progress = useMotionValue(0);
  const dashOffset = useTransform(progress, [0, 100], [CIRCUMFERENCE, 0]);
  const color = useTransform(
    progress,
    [0, 50, 100],
    ["#ef4444", "#f59e0b", "#22c55e"],
  );

  useEffect(() => {
    const controls = animate(progress, target, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [target]);

  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      {/* Background ring */}
      <circle
        cx="64"
        cy="64"
        r={RADIUS}
        fill="none"
        stroke="#1e293b"
        strokeWidth="12"
      />
      {/* Progress ring */}
      <motion.circle
        cx="64"
        cy="64"
        r={RADIUS}
        fill="none"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        style={{ strokeDashoffset: dashOffset, stroke: color }}
        transform="rotate(-90 64 64)"
      />
      {/* Label */}
      <motion.text
        x="64"
        y="64"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="20"
        fontWeight="700"
        fill="#f8fafc"
      >
        {useTransform(progress, Math.round)}%
      </motion.text>
    </svg>
  );
}
```

### 30.7 Floating Action Button with Radial Menu

```tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const actions = [
  { icon: "📝", label: "New Note", color: "#6366f1" },
  { icon: "📸", label: "Photo", color: "#ec4899" },
  { icon: "📎", label: "Attach", color: "#14b8a6" },
];

const menuItemVariants = {
  closed: { opacity: 0, scale: 0, y: 10 },
  open: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 400,
      damping: 22,
    },
  }),
  exit: (i: number) => ({
    opacity: 0,
    scale: 0.8,
    y: 6,
    transition: { delay: (actions.length - i) * 0.04 },
  }),
};

export function FloatingActionButton() {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <AnimatePresence>
        {open &&
          actions.map((action, i) => (
            <motion.button
              key={action.label}
              custom={i}
              variants={menuItemVariants}
              initial="closed"
              animate="open"
              exit="exit"
              title={action.label}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: action.color,
                border: "none",
                cursor: "pointer",
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              {action.icon}
            </motion.button>
          ))}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#6366f1",
          border: "none",
          cursor: "pointer",
          fontSize: 28,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 24px rgba(99,102,241,0.5)",
        }}
      >
        +
      </motion.button>
    </div>
  );
}
```

### 30.8 Animated Number Ticker

```tsx
"use client";
import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

export function NumberTicker({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1], // expo-out
      onUpdate: (v) => {
        el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
      },
    });
    return controls.stop;
  }, [inView, value, prefix, suffix, decimals]);

  return (
    <span ref={ref}>
      {prefix}0{suffix}
    </span>
  );
}

// Usage
// <NumberTicker value={1250000} prefix="$" suffix="+" decimals={0} />
```

---

## 31. Optimistic UI Animations

Animate immediately on user action before the server responds, then reconcile:

```tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useTransition } from "react";

type Item = { id: string; text: string };

export function OptimisticList({ serverItems }: { serverItems: Item[] }) {
  const [items, setItems] = useState(serverItems);
  const [isPending, startTransition] = useTransition();

  const removeItem = (id: string) => {
    // Optimistically remove from UI immediately
    setItems((prev) => prev.filter((i) => i.id !== id));

    startTransition(async () => {
      try {
        await fetch(`/api/items/${id}`, { method: "DELETE" });
      } catch {
        // Rollback on failure
        setItems(serverItems);
      }
    });
  };

  return (
    <motion.ul layout>
      <AnimatePresence>
        {items.map((item) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25 }}
          >
            {item.text}
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
```

---

## 32. `scroll()` — Timeline-Based Scroll Animations (v11+)

The standalone `scroll()` function enables scroll-linked animations outside React, similar to GSAP ScrollTrigger.

```tsx
import { scroll, animate } from "framer-motion";

// Animate element tied to page scroll progress
const stop = scroll(animate("#hero", { opacity: [1, 0], scale: [1, 0.95] }), {
  target: document.querySelector("#hero"),
  offset: ["start start", "end start"],
});

// Call stop() to detach the scroll listener
// stop();
```

```tsx
// React usage with cleanup
useEffect(() => {
  const stop = scroll(animate(".parallax-img", { y: [0, -100] }), {
    offset: ["start end", "end start"],
  });
  return stop;
}, []);
```

---

## 33. `inView()` — Standalone Intersection Observer

```tsx
import { inView } from "framer-motion";

// Returns stop function. Handler fires when element enters viewport.
const stop = inView(
  "#section",
  ({ target }) => {
    animate(target, { opacity: 1, y: 0 }, { duration: 0.5 });
    // Return cleanup if needed
    return () => animate(target, { opacity: 0 });
  },
  {
    margin: "-100px",
    amount: 0.5,
  },
);
```

---

## 34. Multi-Step Animation Sequences with `useAnimate`

```tsx
"use client";
import { useAnimate, stagger } from "framer-motion";

export function OnboardingFlow() {
  const [scope, animate] = useAnimate();

  const runOnboarding = async () => {
    // Step 1: Reveal title
    await animate(".title", { opacity: 1, y: 0 }, { duration: 0.5 });

    // Step 2: Stagger feature cards
    await animate(
      ".feature-card",
      { opacity: 1, scale: 1 },
      { delay: stagger(0.1), duration: 0.4 },
    );

    // Step 3: Pop CTA button
    animate(
      ".cta-btn",
      { scale: [0.9, 1.05, 1] },
      { duration: 0.4, ease: "easeOut" },
    );
  };

  return (
    <div ref={scope}>
      <h1
        className="title"
        style={{ opacity: 0, transform: "translateY(20px)" }}
      >
        Welcome
      </h1>

      {["Fast", "Flexible", "Fun"].map((f) => (
        <div
          key={f}
          className="feature-card"
          style={{ opacity: 0, scale: 0.95 }}
        >
          {f}
        </div>
      ))}

      <button
        className="cta-btn"
        onClick={runOnboarding}
        style={{ opacity: 1, scale: 0.9 }}
      >
        Start Tour
      </button>
    </div>
  );
}
```

### `stagger` helper

```tsx
import { stagger } from "framer-motion";

// Stagger all '.item' elements by 0.05s
animate(".item", { opacity: 1 }, { delay: stagger(0.05) });

// Stagger from center outward
animate(".item", { opacity: 1 }, { delay: stagger(0.05, { from: "center" }) });

// Stagger from specific index
animate(".item", { opacity: 1 }, { delay: stagger(0.05, { from: 2 }) });

// Stagger in reverse
animate(".item", { opacity: 1 }, { delay: stagger(0.05, { from: "last" }) });
```

---

## 35. Integration with Tailwind CSS

### Using `motion` with Tailwind Classes

```tsx
// Combine Tailwind classes with motion props freely
<motion.div
  className="rounded-xl bg-indigo-600 p-6 text-white shadow-lg"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  Tailwind + Framer Motion
</motion.div>
```

### Conditional Classes + Dynamic Animations

```tsx
"use client";
import { motion } from "framer-motion";
import { clsx } from "clsx"; // or 'classnames'

function StatusBadge({ active }: { active: boolean }) {
  return (
    <motion.span
      layout
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
        active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600",
      )}
      animate={{ scale: active ? 1.05 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {active ? "Active" : "Inactive"}
    </motion.span>
  );
}
```

### `cn` utility + Framer Motion Best Practice

```tsx
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
// Never animate Tailwind layout-affecting classes (margin, padding, width)
// ✅ Animate via motion props (transform-safe)
<motion.div className="rounded-lg bg-blue-500" whileHover={{ scale: 1.03 }} />

// ❌ Toggling 'scale-110' class —  not animated, discrete class switch
<div className={isHovered ? 'scale-110' : 'scale-100'} />
```

---

## 36. Advanced Spring Physics Reference

Springs in Framer Motion are governed by three parameters:

| Parameter   | Effect                                                                     |
| ----------- | -------------------------------------------------------------------------- |
| `stiffness` | How fast the spring pulls toward target. Higher = faster / snappier.       |
| `damping`   | Resistance. Lower = more bounce. Zero = infinite oscillation.              |
| `mass`      | Virtual object mass. Higher = slower, more inertia.                        |
| `restDelta` | Distance from target at which animation is considered done (default 0.01). |
| `restSpeed` | Speed below which animation is considered done (default 0.01).             |
| `velocity`  | Initial velocity (useful to chain from a drag release).                    |

### Preset Feel Reference

```tsx
// Snappy UI (buttons, cards)
{ type: 'spring', stiffness: 400, damping: 24 }

// Bouncy / playful
{ type: 'spring', stiffness: 300, damping: 10 }

// Smooth / gentle
{ type: 'spring', stiffness: 120, damping: 20 }

// Critical damping (no bounce, fastest settle)
// damping = 2 * sqrt(stiffness * mass)
{ type: 'spring', stiffness: 200, damping: 28, mass: 1 }

// Heavy / dramatic
{ type: 'spring', stiffness: 80, damping: 12, mass: 2 }
```

---

## 37. Context-Driven Animation State

Drive child animations from a shared context without prop drilling:

```tsx
"use client";
import { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            background: theme === "dark" ? "#0f172a" : "#f8fafc",
            color: theme === "dark" ? "#f8fafc" : "#0f172a",
            minHeight: "100vh",
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

---

## 38. Quick-Reference Cheatsheet

```tsx
// ── Mount/unmount animation
<AnimatePresence>
  {show && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />}
</AnimatePresence>

// ── Stagger children
const parent: Variants = { visible: { transition: { staggerChildren: 0.08 } } };
const child: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

// ── Shared element transition
<motion.div layoutId="card" />   // same layoutId in two places = morphing transition

// ── Scroll progress bar
const { scrollYProgress } = useScroll();
<motion.div style={{ scaleX: scrollYProgress, transformOrigin: 'left' }} />

// ── Smooth scroll bar (spring)
const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

// ── Parallax
const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
const y = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);

// ── Drag to dismiss
<motion.div drag="x" onDragEnd={(_, { offset }) => offset.x > 100 && dismiss()} />

// ── Imperative sequence
const [scope, animate] = useAnimate();
await animate('.title', { opacity: 1 });
animate('.subtitle', { opacity: 1 }, { delay: 0.1 });

// ── Standalone value animation
animate(0, 100, { duration: 1, onUpdate: (v) => (el.textContent = String(Math.round(v))) });

// ── Standalone scroll timeline
scroll(animate('#box', { y: [-100, 100] }), { target: ref, offset: ['start end', 'end start'] });

// ── Gesture shortcuts
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
whileFocus={{ boxShadow: '0 0 0 3px rgba(99,102,241,0.5)' }}
whileDrag={{ opacity: 0.8 }}
whileInView={{ opacity: 1 }}

// ── Global config
<MotionConfig transition={{ type: 'spring', stiffness: 300, damping: 24 }} reducedMotion="user">

// ── Skip all animations (tests/SSR)
MotionGlobalConfig.skipAnimations = true;

// ── Reduced bundle (production)
<LazyMotion features={domAnimation}><m.div animate={{ opacity: 1 }} /></LazyMotion>
```
