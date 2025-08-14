# UIKit Svelte 5 Demo

## Quick Start

```bash
# ที่ root project
npm install

# รัน demo
cd examples/svelte5
npm run dev
```

## Import Resolution

ใช้ direct relative imports เพื่อความเรียบง่าย:

```javascript
import { drawerStore, createDrawerReactive } from '../../../../packages/ui-svelte/dist/index.js';
```

## Svelte 5 Patterns

- **Store Pattern**: ใช้ `drawerStore()` สำหรับ legacy
- **Runes Pattern**: ใช้ `createDrawerReactive()` + `$state` wrap

## Components

- `DrawerDemo.svelte` - Hybrid demo (stores + runes)
- `DrawerRunesDemo.svelte` - Pure runes demo