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
 * Create a Svelte store that mirrors a UIP core primitive.
 * @param {Object} core - core primitive instance
 * @returns {Object} Svelte store + pass-through methods
 */
export function createPrimitiveStore(core) {
  if (!core) throw new Error('core primitive required')

  const { subscribe, set } = writable(core.getState())
  const unsub = core.onChange(set)

  return {
    subscribe,
    ...core,
    destroy: () => {
      unsub()
      core.destroy?.()
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
    let core = params?.drawer || params
    if (!core?.[method]) return warnNoop(method)

    let dispose = passOptions
      ? core[method](node, params?.options || {})
      : core[method](node)

    return {
      update(newParams) {
        const next = newParams?.drawer || newParams
        if (next === core) return
        dispose()
        core = next
        dispose = passOptions
          ? core[method](node, newParams?.options || {})
          : core[method](node)
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
    let core = params?.drawer || params
    if (!core?.autoScan) return warnNoop('scan')

    let dispose = core.autoScan(node)
    return {
      update(newParams) {
        const next = newParams?.drawer || newParams
        if (next === core) return
        dispose()
        core = next
        dispose = core.autoScan(node)
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
