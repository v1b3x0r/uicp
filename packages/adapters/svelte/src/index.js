/**
 * @uip/adapter-svelte – Svelte adapter (generic, scalable)
 * Pattern: one generic factory + per-primitive aliases
 */

import { writable } from 'svelte/store'

// --- import core creators (มีอะไรก็ import อันนั้น) ---
import {
  createDrawer,
  createModal,
  createTooltip,
  createPopover,
  createMenu,
} from '@uip/core'

// ---------------------------
// Generic store (เขียนครั้งเดียว)
// ---------------------------
/**
 * Create a Svelte store that mirrors a UIP primitive using modern API.
 * @param {Object} primitive - UIPrimitive instance  
 * @returns {Object} Svelte store + pass-through methods
 */
export function createPrimitiveStore(primitive) {
  if (!primitive) throw new Error('UIP primitive required')
  if (!primitive._type) throw new Error('Invalid UIP primitive - missing _type')

  // Get initial state using modern API
  const { subscribe, set } = writable(primitive.get())
  
  // Subscribe to state changes using modern event system
  const unsub = primitive.on('valueChange', () => {
    set(primitive.get());
  })

  return {
    subscribe,
    ...primitive,
    destroy: () => {
      unsub()
      primitive.destroy?.()
    },
  }
}

// ---------------------------
// Generic actions (เขียนครั้งเดียว)
// ---------------------------
function warnNoop(name) {
  console.warn(`${name}: invalid or unavailable instance`)
  return { destroy: () => {} }
}

/**
 * Create a Svelte action bound to a core method that takes (node, options?)
 * e.g. registerTrigger, registerContent
 * @param {('registerTrigger'|'registerContent')} method
 * @param {boolean} passOptions - pass params.options to method
 */
function createAction(method, passOptions = false) {
  return (node, params) => {
    // Support both old (params.drawer) and new (params) format
    let primitive = params?.drawer || params?.primitive || params
    if (!primitive?.[method]) return warnNoop(method)

    let dispose = passOptions
      ? primitive[method](node, params?.options || {})
      : primitive[method](node)

    return {
      update(newParams) {
        const next = newParams?.drawer || newParams?.primitive || newParams
        if (next === primitive) return
        dispose()
        primitive = next
        if (!primitive?.[method]) return warnNoop(method)
        dispose = passOptions
          ? primitive[method](node, newParams?.options || {})
          : primitive[method](node)
      },
      destroy() {
        dispose()
      },
    }
  }
}

/**
 * Create a Svelte action for auto-scan style APIs (if the core exposes it).
 * SSR-safe; no-op if unavailable.
 */
function createScanAction() {
  return (node, params) => {
    if (typeof document === 'undefined') return warnNoop('scan')
    let primitive = params?.drawer || params?.primitive || params
    if (!primitive?.autoScan) return warnNoop('scan')

    let dispose = primitive.autoScan(node)
    return {
      update(newParams) {
        const next = newParams?.drawer || newParams?.primitive || newParams
        if (next === primitive) return
        dispose()
        primitive = next
        if (!primitive?.autoScan) return warnNoop('scan')
        dispose = primitive.autoScan(node)
      },
      destroy() {
        dispose()
      },
    }
  }
}

// ---------------------------
// Drawer aliases
// ---------------------------
/** @param {Object} [options] @param {Array} [plugins] */
export function createDrawerStore(options = {}, plugins = []) {
  return createPrimitiveStore(createDrawer(options, plugins))
}
export const drawerTrigger = createAction('registerTrigger', false)
export const drawerContent = createAction('registerContent', true)
export const drawerScan = createScanAction()

// ---------------------------
// Modal aliases
// ---------------------------
/** @param {Object} [options] @param {Array} [plugins] */
export function createModalStore(options = {}, plugins = []) {
  return createPrimitiveStore(createModal(options, plugins))
}
export const modalTrigger = createAction('registerTrigger', false)
export const modalContent = createAction('registerContent', true)
export const modalScan = createScanAction()

// ---------------------------
// Tooltip aliases
// ---------------------------
/** @param {Object} [options] @param {Array} [plugins] */
export function createTooltipStore(options = {}, plugins = []) {
  return createPrimitiveStore(createTooltip(options, plugins))
}
export const tooltipTrigger = createAction('registerTrigger', false)
export const tooltipContent = createAction('registerContent', true)
export const tooltipScan = createScanAction()

// ---------------------------
// Popover aliases
// ---------------------------
/** @param {Object} [options] @param {Array} [plugins] */
export function createPopoverStore(options = {}, plugins = []) {
  return createPrimitiveStore(createPopover(options, plugins))
}
export const popoverTrigger = createAction('registerTrigger', false)
export const popoverContent = createAction('registerContent', true)
export const popoverScan = createScanAction()

// ---------------------------
// Menu (Context/Menu) aliases
// ---------------------------
/** @param {Object} [options] @param {Array} [plugins] */
export function createMenuStore(options = {}, plugins = []) {
  return createPrimitiveStore(createMenu(options, plugins))
}
export const menuTrigger = createAction('registerTrigger', false)
export const menuContent = createAction('registerContent', true)
export const menuScan = createScanAction()

// Optional: re-export core creators for convenience
export {
  createDrawer,
  createModal,
  createTooltip,
  createPopover,
  createMenu,
} from '@uip/core'
