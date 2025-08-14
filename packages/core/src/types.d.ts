/**
 * Universal UI Protocol TypeScript Definitions
 */

export interface BaseState {
  isOpen: boolean;
}

export interface BasePrimitive {
  readonly _type: string;
  readonly _instanceId: string;
  readonly isOpen: boolean;
  
  getState(): BaseState;
  open(): void;
  close(): void;
  toggle(): void;
  
  onChange(fn: (state: BaseState) => void): () => void;
  onOpenStart(fn: (state: BaseState) => void): () => void;
  onOpenEnd(fn: (state: BaseState) => void): () => void;
  onCloseStart(fn: (state: BaseState) => void): () => void;
  onCloseEnd(fn: (state: BaseState) => void): () => void;
  
  registerTrigger(element: HTMLElement, options?: any): () => void;
  registerContent(element: HTMLElement, options?: any): () => void;
}

// Drawer
export interface DrawerOptions {
  initialOpen?: boolean;
  onStateChange?: (state: BaseState) => void;
}

export interface DrawerContentOptions {
  trapFocus?: boolean;
  lockScroll?: boolean;
  closeOnEscape?: boolean;
  autoFocus?: boolean;
}

export interface DrawerInstance extends BasePrimitive {
  _type: 'drawer';
  registerTrigger(element: HTMLElement, options?: any): () => void;
  registerContent(element: HTMLElement, options?: DrawerContentOptions): () => void;
}

export function createDrawer(options?: DrawerOptions, plugins?: Array<(instance: DrawerInstance) => void>): DrawerInstance;

// Modal
export interface ModalOptions {
  initialOpen?: boolean;
  onStateChange?: (state: BaseState) => void;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export interface ModalContentOptions {
  trapFocus?: boolean;
  lockScroll?: boolean;
  autoFocus?: boolean;
  portal?: boolean;
}

export interface ModalInstance extends BasePrimitive {
  _type: 'modal';
  registerTrigger(element: HTMLElement, options?: any): () => void;
  registerContent(element: HTMLElement, options?: ModalContentOptions): () => void;
  registerBackdrop(element: HTMLElement, options?: any): () => void;
}

export function createModal(options?: ModalOptions, plugins?: Array<(instance: ModalInstance) => void>): ModalInstance;

// Tooltip
export interface TooltipOptions {
  initialOpen?: boolean;
  onStateChange?: (state: BaseState) => void;
  delay?: number;
  hideDelay?: number;
}

export interface TooltipTriggerOptions {
  showOnHover?: boolean;
  showOnFocus?: boolean;
  interactive?: boolean;
}

export interface TooltipContentOptions {
  interactive?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

export interface TooltipInstance extends BasePrimitive {
  _type: 'tooltip';
  registerTrigger(element: HTMLElement, options?: TooltipTriggerOptions): () => void;
  registerContent(element: HTMLElement, options?: TooltipContentOptions): () => void;
}

export function createTooltip(options?: TooltipOptions, plugins?: Array<(instance: TooltipInstance) => void>): TooltipInstance;

// Popover
export interface PopoverState extends BaseState {
  triggerElement: HTMLElement | null;
}

export interface PopoverOptions {
  initialOpen?: boolean;
  onStateChange?: (state: PopoverState) => void;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
}

export interface PopoverContentOptions {
  trapFocus?: boolean;
  autoFocus?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

export interface PopoverInstance extends BasePrimitive {
  _type: 'popover';
  getState(): PopoverState;
  open(triggerElement?: HTMLElement): void;
  toggle(triggerElement?: HTMLElement): void;
  registerTrigger(element: HTMLElement, options?: any): () => void;
  registerContent(element: HTMLElement, options?: PopoverContentOptions): () => void;
}

export function createPopover(options?: PopoverOptions, plugins?: Array<(instance: PopoverInstance) => void>): PopoverInstance;

// Menu
export interface MenuState extends BaseState {
  currentIndex: number;
  triggerElement: HTMLElement | null;
}

export interface MenuOptions {
  initialOpen?: boolean;
  onStateChange?: (state: MenuState) => void;
  closeOnSelect?: boolean;
  closeOnEscape?: boolean;
  closeOnClickOutside?: boolean;
}

export interface MenuTriggerOptions {
  triggerOnClick?: boolean;
  triggerOnContextMenu?: boolean;
}

export interface MenuContentOptions {
  trapFocus?: boolean;
  autoFocus?: boolean;
}

export interface MenuItemOptions {
  onSelect?: () => void;
}

export interface MenuInstance extends BasePrimitive {
  _type: 'menu';
  getState(): MenuState;
  open(triggerElement?: HTMLElement, position?: { x: number; y: number }): void;
  toggle(triggerElement?: HTMLElement): void;
  focusNext(): void;
  focusPrevious(): void;
  selectCurrent(): void;
  registerTrigger(element: HTMLElement, options?: MenuTriggerOptions): () => void;
  registerContent(element: HTMLElement, options?: MenuContentOptions): () => void;
  registerItem(element: HTMLElement, options?: MenuItemOptions): () => void;
}

export function createMenu(options?: MenuOptions, plugins?: Array<(instance: MenuInstance) => void>): MenuInstance;

// Utilities
export interface KeyboardHandlerConfig {
  onEscape?: (event: KeyboardEvent) => void;
  onEnter?: (event: KeyboardEvent) => void;
  onSpace?: (event: KeyboardEvent) => void;
  onArrowUp?: (event: KeyboardEvent) => void;
  onArrowDown?: (event: KeyboardEvent) => void;
  onArrowLeft?: (event: KeyboardEvent) => void;
  onArrowRight?: (event: KeyboardEvent) => void;
}

export interface EventSystem {
  onChange(fn: (data: any) => void): () => void;
  onOpenStart(fn: (data: any) => void): () => void;
  onOpenEnd(fn: (data: any) => void): () => void;
  onCloseStart(fn: (data: any) => void): () => void;
  onCloseEnd(fn: (data: any) => void): () => void;
  emit(event: string, data: any): void;
  emitAsync(event: string, data: any): void;
}

export function enableFocusTrap(element: HTMLElement, instance: any): () => void;
export function disableFocusTrap(instance: any): void;
export function focusFirstElement(element: HTMLElement): void;
export function storeFocus(instance: any): void;
export function restoreFocus(instance: any): void;

export function lockBodyScroll(): void;
export function unlockBodyScroll(): void;
export function isScrollLocked(): boolean;
export function resetScrollLock(): void;

export function createEventSystem(): EventSystem;
export function createKeyboardHandler(config?: KeyboardHandlerConfig): (event: KeyboardEvent) => void;