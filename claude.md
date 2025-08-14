# claude.md

> Note: This is a planning/brainstorming doc. Some names and examples may be outdated. For current package names and APIs, see `README.md` and `ARCHITECTURE_V2.md`.

## Objective

สร้างโปรเจ็กต์สาธิตแนวคิด **UI Interaction Protocol** ที่มีแกนกลางเล็ก เบา และใช้ซ้ำได้ข้ามเฟรมเวิร์ค โดยทำ PoC สำหรับ **Drawer** ที่:

- Core เป็น **pure JS (ES2018+)** ไม่พึ่ง framework
- แยก **Adapter** สำหรับ Vanilla JS, React, และ Svelte
- มี **Gesture/Animation plugin** เสียบเพิ่มได้ แต่ไม่ผูกกับ core
- มี **CLI scaffold** ที่ดึง component พร้อมตัวอย่างใช้งานจริงได้ทันที
- ทั้งหมดพยายามคุมให้อยู่ใน **\~700–900 LOC** (ไม่รวม lockfile)

ผลลัพธ์ต้อง build/run ได้จริง พร้อมตัวอย่างที่เห็น drawer ลื่นในมือถือ และรองรับ a11y หลัก

---

## Deliverables

1. Monorepo ที่แยก package ชัดเจน:

   - `@uikit/core` — headless logic + a11y helper
   - `@uikit/vanilla` — helper เล็กน้อยสำหรับ Vanilla
   - `@uikit/react` — hook adapter
   - `@uikit/svelte` — store adapter
   - `@uikit/cli` — สคริปต์ CLI scaffold
   - (optional skin) `@uikit/skin-tailwind` หรือ `@uikit/skin-vanilla` ขนาดเล็ก

2. Examples 3 ตัว: `examples/vanilla`, `examples/react`, `examples/svelte` (เล็กที่สุดเท่าที่จำเป็น)
3. README root ที่อธิบายภาพรวม + คำสั่งรันเร็ว
4. ขนาด bundle ใกล้เคียง: core \~3–4 KB gzip, รวม React adapter + skin \~7–8 KB gzip

---

## Tech & Constraints

- ภาษา: **JavaScript** ล้วน (ใช้ JSDoc type hint ได้) เพื่อคง low-level และอ่านง่าย
- Build: ใช้ **tsup** หรือ **vite build** ตามแพ็กเกจ (คุมให้ง่าย)
- Module: สร้าง **ESM + CJS** ทุกแพ็กเกจ
- Dependencies:

  - runtime: **ศูนย์** ใน `@uikit/core`
  - adapters มีเฉพาะ **peerDependencies** ไปยัง framework นั้น ๆ

- Browser target: last 2 versions + iOS Safari 14+
- Node: 18+

---

## Monorepo Layout

```
.
├─ packages/
│  ├─ ui-core/
│  │  ├─ src/
│  │  │  ├─ drawer.js
│  │  │  ├─ focus-trap.js
│  │  │  ├─ body-scroll-lock.js
│  │  │  ├─ events.js
│  │  │  └─ index.js
│  │  └─ package.json
│  ├─ ui-vanilla/
│  │  ├─ src/index.js
│  │  └─ package.json
│  ├─ ui-react/
│  │  ├─ src/useDrawer.js
│  │  ├─ src/index.js
│  │  └─ package.json
│  ├─ ui-svelte/
│  │  ├─ src/drawerStore.js
│  │  ├─ src/index.js
│  │  └─ package.json
│  ├─ ui-skin-vanilla/        # CSS vars เบาๆ (optional)
│  │  ├─ src/drawer.css
│  │  └─ package.json
│  └─ cli/
│     ├─ src/index.js
│     └─ package.json
├─ examples/
│  ├─ vanilla/  # index.html + single JS module
│  ├─ react/    # minimal Vite
│  └─ svelte/   # minimal Vite
├─ package.json
└─ README.md
```

---

## Core Spec (Drawer)

### API (pure JS)

```js
// createDrawer(options?)
{
  isOpen: boolean,
  open(): void,
  close(): void,
  toggle(): void,
  onChange((state) => void): () => void, // unsubscribe
  getState(): { isOpen: boolean },

  // Optional a11y helpers (opt-in)
  registerTrigger(el: HTMLElement): () => void,   // aria-expanded, click/keydown Enter/Space
  registerContent(el: HTMLElement, opts?): () => void, // focus trap, aria-hidden

  // Lifecycle events (opt-in)
  onOpenStart(fn): () => void,
  onOpenEnd(fn): () => void,
  onCloseStart(fn): () => void,
  onCloseEnd(fn): () => void,
}
```

### Behavior

- ESC ปิด drawer
- Tab/Shift+Tab ภายใน content ถูก trap
- เปิดแล้ว **lock body scroll** และคืนค่าสภาพเดิมเมื่อปิด
- ไม่บังคับ DOM structure, สามารถ render ใน portal ได้
- รองรับ RTL (ด้วย CSS/transform ที่ฝั่ง presentation)
- รองรับ reduced motion (ผ่าน `prefers-reduced-motion` เช็คใน presentation)
- ไม่อ่านหรือแก้สไตล์ใด ๆ ยกเว้นที่จำเป็นใน helper (เช่น `inert`/`aria-hidden`)

### Gesture/Animation Plugin (optional)

- ฟังก์ชัน `registerDrawerDrag(core, el, { axis='x' | 'y', threshold=0.3, velocityExit=… })`
- ปล่อยค่า progress/velocity ผ่าน data attribute หรือ callback
- ไม่ผูก physics; ให้ adapter/presentation animate เอง

---

## Edge Cases ที่ต้องคิดเผื่อ

- เปิด drawer ซ้อนกัน: focus trap ต้อง stack-safe
- เปลี่ยน orientation มือถือระหว่าง drag
- Body scroll lock ขณะมี scrollbar และ safe-area-inset (iOS notch)
- ผู้ใช้เลื่อนหน้าจอขณะเปิด drawer: ห้ามเลื่อน background
- Portal/Shadow DOM: registerContent ไม่พึ่งโครงสร้าง DOM เดิม
- SSR/No DOM: guard `window/document` ทุกที่
- Keyboard-only user: Enter/Space เปิดจาก trigger, ESC ปิด, Tab cycle
- Nested focusable elements, iframe ภายใน content
- RTL layout สำหรับ drawer ด้านขวา/ซ้าย
- Reduced motion: ปิด transition/animation เมื่อ system ขอ
- Cleanup memory: ทุก `register*` คืนฟังก์ชัน remove listeners เสมอ
- Passive listeners สำหรับ touchmove เพื่อ performance แต่ยังยกเลิกได้ถ้าต้องการ
- ไม่มี inert: fallback เป็น `aria-hidden` + tabIndex management
- Build: ESM/CJS, tree-shake friendly, external peerDeps ชัดเจน

---

## Package Details

### `@uikit/core`

- `drawer.js` — state, events, lifecycle
- `focus-trap.js` — focus boundary, restore focus, ESC handler
- `body-scroll-lock.js` — lock/unlock ที่ไม่ทำ layout shift
- `events.js` — util สำหรับ add/remove listeners แบบปลอดภัย
- `index.js` — export API
- ไม่ใช้ 3rd-party runtime deps
- ขนาดเป้าหมาย: \~3–4 KB gzip

### `@uikit/vanilla`

- helper ผูก core กับ DOM แบบง่ายสุด
- ตัวอย่างการใช้ในเพียว HTML

### `@uikit/react`

- `useDrawer(core)` คืน `{ isOpen, open, close, toggle }`
- ใช้ `useEffect` subscribe/unsubscribe
- `peerDependencies: { react: ">=18" }`
- ขนาด \~1 KB gzip

### `@uikit/svelte`

- `drawerStore(core)` คืน store ที่มี `{ subscribe, open, close, toggle }`
- `peerDependencies: { svelte: ">=4" }`
- ขนาด \~1 KB gzip

### `@uikit/skin-vanilla` (optional)

- CSS vars + class น้อยที่สุดสำหรับ demo
- ขนาด \~1–2 KB gzip

### `@uikit/cli`

- คำสั่ง:

  - `uikit add drawer --framework <vanilla|react|svelte> [--skin vanilla] [--path src/components] [--force]`

- ทำงาน:

  - ตรวจโปรเจ็กต์ ป้องกันทับไฟล์โดยไม่ตั้งใจ
  - ติดตั้งแพ็กเกจจำเป็น (core + adapter + skin ถ้ามี)
  - สร้างไฟล์ตัวอย่างใช้งานได้ทันที
  - idempotent: รันซ้ำไม่พัง โยนคำเตือนถ้าชน

---

## Examples (Minimum)

### `examples/vanilla`

- `index.html` หน้าดียว ใช้ `<script type="module">` import จาก `packages/ui-core/dist`
- มีปุ่ม toggle, drawer div, ผูก `registerDrawerDrag`

### `examples/react`

- Vite minimal
- Component `DrawerDemo.jsx` ใช้ `createDrawer` + `useDrawer` + ref สำหรับ drag plugin

### `examples/svelte`

- Vite minimal
- `DrawerDemo.svelte` ใช้ store + drag plugin

ทุก example ต้อง:

- ทำงานได้ด้วย `npm run dev` ในโฟลเดอร์นั้น
- ลองบนมือถือได้ drag ลื่น เปิดปิดมี focus trap

---

## Build Scripts (root `package.json`)

```json
{
  "scripts": {
    "build": "pnpm -r --filter ./packages/* run build",
    "dev:vanilla": "serve examples/vanilla",
    "dev:react": "pnpm -C examples/react dev",
    "dev:svelte": "pnpm -C examples/svelte dev",
    "size": "size-limit"
  }
}
```

> ใช้ pnpm หรือ npm ก็ได้ แต่ขอให้ scripts ใช้งานง่าย

---

## Testing (เบาแต่ได้ประเด็น)

- ใช้ **Vitest** สำหรับ unit: state, events, scroll-lock
- ใช้ **Playwright** e2e: tab cycle, ESC, nested drawers
- Headless CI: `pnpm build && pnpm -r test`

---

## README (root)

- แนวคิดสั้น ๆ + แผนผังเลเยอร์ (core ↔ adapters ↔ skin)
- Quickstart 3 แบบ: Vanilla, React, Svelte
- ขนาด bundle เป้าหมาย
- คำสั่ง CLI ตัวอย่าง
- ข้อจำกัดและขอบเขต (ไม่ผูก animation lib, ไม่ enforce DOM structure)

---

## License

MIT หรือ Apache-2.0

---

## Acceptance Criteria

- `@uikit/core` ไม่มี runtime deps, ผ่าน build ESM+CJS
- Drawer เปิด/ปิด/drag ได้ ลื่นในมือถือจริง
- a11y หลักทำงาน: ESC, tab trap, focus restore, body scroll lock
- ตัวอย่าง 3 เฟรมเวิร์คทำงานได้
- CLI scaffold ใช้งานได้และปลอดภัย (ไม่ overwrite เงียบ ๆ)
- ขนาดไฟล์ตามงบประมาณ

---

## Roadmap

### Phase 1 (PoC: 1–2 วัน)

- Core: drawer + focus-trap + body-scroll-lock + lifecycle
- Gesture plugin เบา ๆ + ตัวอย่าง drag
- Adapters: vanilla, react, svelte
- CLI: `add drawer` + skin-vanilla
- Examples 3 ตัว และ README รูปเดียวเทียบ cross-framework

### Phase 2 (UX primitives เพิ่ม)

- เพิ่ม **Modal**, **Context Menu**, **Tooltip**, **FocusTrap** แยกเป็น primitive
- ปรับ CLI เป็น `add modal|menu|tooltip`
- เพิ่ม config reduced-motion, RTL hints
- Playwright tests ครอบคลุม nested + portal

### Phase 3 (Dev Experience / Viral)

- Playground หน้าเดียว สลับ framework แบบ live
- One-click export (zip โค้ดตาม framework+skin)
- Offline single-file demo (HTML+JS ไฟล์เดียว)
- ตัววัด perf/size อัตโนมัติ (size-limit)
- เอกสาร **Protocol Spec** 1 หน้า (RFC) สำหรับคนเขียน adapter ใหม่

### Phase 4 (Advanced)

- Command Palette, Date Range Picker (timezone-aware), Virtualized List
- Drag-and-drop cross-framework แบบ core เดียว
- เพิ่ม adapters: Solid, Qwik, Web Components
- Skin ตลาดกลาง: tailwind, css vars pro, glassmorphism pack

---

## Implementation Notes

- เลี่ยงการบังคับ DOM structure เช่น `<Trigger/>`, `<Content/>` ให้อยู่ระดับ helper เท่านั้น
- `register*` ทุกตัวต้องคืน disposer
- ใช้ **passive: true** กับ touchmove แต่ให้ fallback ปิด passive ได้เมื่อจำเป็น
- ตรวจ `document.startViewTransition` ไม่บังคับใช้
- ป้องกัน layout shift ตอน lock scroll โดยคำนวณ scrollbar width แล้วชดเชยผ่าน padding-right ที่ body เฉพาะตอนต้องใช้
- พยายามไม่แตะ style ของผู้ใช้ ยกเว้น data-attr ชั่วคราวหรือ inline style ที่ต้องการจริง ๆ เพื่อ preview drag

---

## Quick Pseudo-code (Core Drawer)

```js
// packages/ui-core/src/drawer.js
export function createDrawer(opts = {}) {
  let isOpen = false;
  const listeners = new Set();
  const life = {
    openStart: new Set(),
    openEnd: new Set(),
    closeStart: new Set(),
    closeEnd: new Set(),
  };
  let lastFocused = null;

  const api = {
    get isOpen() {
      return isOpen;
    },
    getState() {
      return { isOpen };
    },
    open() {
      if (isOpen) return;
      isOpen = true;
      emit(life.openStart);
      notify();
      emitAsync(life.openEnd);
    },
    close() {
      if (!isOpen) return;
      isOpen = false;
      emit(life.closeStart);
      notify();
      emitAsync(life.closeEnd);
    },
    toggle() {
      isOpen ? api.close() : api.open();
    },
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    onOpenStart(fn) {
      life.openStart.add(fn);
      return () => life.openStart.delete(fn);
    },
    onOpenEnd(fn) {
      life.openEnd.add(fn);
      return () => life.openEnd.delete(fn);
    },
    onCloseStart(fn) {
      life.closeStart.add(fn);
      return () => life.closeStart.delete(fn);
    },
    onCloseEnd(fn) {
      life.closeEnd.add(fn);
      return () => life.closeEnd.delete(fn);
    },

    registerTrigger(el) {
      const click = () => api.toggle();
      const key = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          api.toggle();
        }
      };
      el.setAttribute("aria-expanded", String(isOpen));
      const unsub = api.onChange(({ isOpen }) =>
        el.setAttribute("aria-expanded", String(isOpen))
      );
      el.addEventListener("click", click);
      el.addEventListener("keydown", key);
      return () => {
        unsub();
        el.removeEventListener("click", click);
        el.removeEventListener("keydown", key);
      };
    },

    registerContent(el, { trap = true } = {}) {
      const onDocKey = (e) => {
        if (e.key === "Escape") api.close();
      };
      const onOpenStart = () => {
        lastFocused = document.activeElement;
        lockBodyScroll();
        document.addEventListener("keydown", onDocKey);
        if (trap) enableFocusTrap(el);
      };
      const onCloseEnd = () => {
        if (trap) disableFocusTrap(el);
        document.removeEventListener("keydown", onDocKey);
        unlockBodyScroll();
        if (lastFocused && lastFocused.focus) lastFocused.focus();
      };
      const u1 = api.onOpenStart(onOpenStart);
      const u2 = api.onCloseEnd(onCloseEnd);
      return () => {
        u1();
        u2();
      };
    },
  };

  function notify() {
    listeners.forEach((fn) => fn(api.getState()));
  }
  function emit(set) {
    set.forEach((fn) => fn(api.getState()));
  }
  function emitAsync(set) {
    queueMicrotask(() => emit(set));
  }

  return api;
}
```

> `lockBodyScroll`, `enableFocusTrap`, `disableFocusTrap` แยกไฟล์ util ภายใน `ui-core`

---

## CLI Scaffold UX

- `npx uikit add drawer --framework react --skin vanilla`

  - ติดตั้ง `@uikit/core @uikit/react @uikit/skin-vanilla`
  - สร้าง `src/components/DrawerDemo.jsx`
  - แทรกตัวอย่าง minimal พร้อม ref สำหรับ drag plugin
  - ไม่ override ไฟล์ที่มีอยู่ เว้นแต่ใส่ `--force`

---

จบ เรียกใช้ตามนี้แล้วสั่งให้สร้าง repo ตามสเปกนี้ทั้งก้อนได้เลย.
