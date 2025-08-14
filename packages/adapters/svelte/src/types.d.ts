/**
 * Svelte Adapter TypeScript Definitions
 */

import type { Writable } from 'svelte/store';
import type { 
  DrawerInstance, DrawerOptions,
  ModalInstance, ModalOptions,
  TooltipInstance, TooltipOptions,
  PopoverInstance, PopoverOptions,
  MenuInstance, MenuOptions,
  BaseState
} from '@uip/core';

export interface PrimitiveStore<T extends BaseState = BaseState> extends Writable<T> {
  open(): void;
  close(): void;
  toggle(): void;
  destroy(): void;
}

export interface SvelteActionResult {
  destroy(): void;
}

// Store creators
export function createPrimitiveStore<T extends any>(core: T): PrimitiveStore<ReturnType<T['getState']>>;

export function createDrawerStore(options?: DrawerOptions, plugins?: Array<(instance: DrawerInstance) => void>): PrimitiveStore<BaseState>;
export function createModalStore(options?: ModalOptions, plugins?: Array<(instance: ModalInstance) => void>): PrimitiveStore<BaseState>;
export function createTooltipStore(options?: TooltipOptions, plugins?: Array<(instance: TooltipInstance) => void>): PrimitiveStore<BaseState>;
export function createPopoverStore(options?: PopoverOptions, plugins?: Array<(instance: PopoverInstance) => void>): PrimitiveStore<BaseState>;
export function createMenuStore(options?: MenuOptions, plugins?: Array<(instance: MenuInstance) => void>): PrimitiveStore<BaseState>;

// Svelte actions
export function drawerTrigger(node: HTMLElement, drawer: DrawerInstance): SvelteActionResult;
export function drawerContent(node: HTMLElement, drawer: DrawerInstance): SvelteActionResult;

export function modalTrigger(node: HTMLElement, modal: ModalInstance): SvelteActionResult;
export function modalContent(node: HTMLElement, modal: ModalInstance): SvelteActionResult;

export function tooltipTrigger(node: HTMLElement, tooltip: TooltipInstance): SvelteActionResult;
export function tooltipContent(node: HTMLElement, tooltip: TooltipInstance): SvelteActionResult;

export function popoverTrigger(node: HTMLElement, popover: PopoverInstance): SvelteActionResult;
export function popoverContent(node: HTMLElement, popover: PopoverInstance): SvelteActionResult;

export function menuTrigger(node: HTMLElement, menu: MenuInstance): SvelteActionResult;
export function menuContent(node: HTMLElement, menu: MenuInstance): SvelteActionResult;

// Re-exports from core
export {
  createDrawer,
  createModal,
  createTooltip,
  createPopover,
  createMenu
} from '@uip/core';