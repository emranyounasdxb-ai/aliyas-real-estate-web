'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from './brand-icons';
import './branded-select.css';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  searchTerms?: readonly string[];
};
type Props = {
  options: SelectOption[];
  'aria-label': string;
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
};

/** One select-only combobox for filters, forms and comparison controls. */
export function BrandedSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  required,
  disabled,
  name,
  id,
  'aria-label': label,
}: Props) {
  const uid = useId();
  const controlId = id ?? `${uid}-control`;
  const listId = `${uid}-list`;
  const [local, setLocal] = useState(defaultValue ?? options[0]?.value ?? '');
  const current = value ?? local;
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === current),
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selectedIndex);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<CSSProperties>({
    left: 0,
    top: 0,
    width: 0,
    maxHeight: 320,
  });
  const root = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const mirror = useRef<HTMLSelectElement>(null);
  const search = useRef({ text: '', time: 0 });

  useEffect(() => {
    const form = mirror.current?.form;
    const reset = () => {
      setLocal(defaultValue ?? options[0]?.value ?? '');
      setOpen(false);
    };
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  }, [defaultValue, options]);

  function show(index = selectedIndex) {
    if (disabled) return;
    setHost(trigger.current?.closest('dialog') ?? document.body);
    setActive(index);
    setOpen(true);
  }
  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    setLocal(option.value);
    onValueChange?.(option.value);
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }
  function move(direction: number) {
    let index = active;
    for (let i = 0; i < options.length; i++) {
      index = (index + direction + options.length) % options.length;
      if (!options[index].disabled) {
        setActive(index);
        break;
      }
    }
  }
  function keyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Home' || event.key === 'End') {
        const indices = options.map((_, i) => i).filter((i) => !options[i].disabled);
        const index = event.key === 'Home' ? indices[0] : indices.at(-1);
        if (index !== undefined) {
          if (!open) show(index);
          else setActive(index);
        }
      } else if (!open) show();
      else if (event.key === 'Enter' || event.key === ' ') choose(active);
      else move(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      search.current.text =
        (now - search.current.time < 700 ? search.current.text : '') + event.key.toLowerCase();
      search.current.time = now;
      const term = search.current.text;
      const index = options.findIndex(
        (option) =>
          !option.disabled &&
          [option.label, ...(option.searchTerms ?? [])].some((text) =>
            text.toLowerCase().startsWith(term),
          ),
      );
      if (index >= 0) {
        if (!open) show(index);
        else setActive(index);
      }
    }
  }

  useLayoutEffect(() => {
    if (!open || !list.current) return;
    const element = list.current;
    element.showPopover();
    const place = () => {
      if (!trigger.current) return;
      const box = trigger.current.getBoundingClientRect();
      const viewport = window.visualViewport;
      const topEdge = viewport?.offsetTop ?? 0;
      const bottomEdge = topEdge + (viewport?.height ?? innerHeight);
      const width = Math.min(Math.max(box.width, 256), innerWidth - 32);
      const below = bottomEdge - box.bottom - 16;
      const above = box.top - topEdge - 16;
      const menuHeight = options.length * 48 + Math.max(options.length - 1, 0) * 4 + 16;
      const upwards = below < Math.min(menuHeight, 260) && above > below;
      const maxHeight = Math.min(336, Math.max(96, upwards ? above : below));
      setPosition({
        left: Math.max(16, Math.min(box.left, innerWidth - width - 16)),
        top: upwards ? 'auto' : box.bottom + 8,
        bottom: upwards ? innerHeight - box.top + 8 : 'auto',
        width,
        maxHeight,
      });
    };
    place();
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!root.current?.contains(target) && !element.contains(target)) setOpen(false);
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape, true);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    window.visualViewport?.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      if (element.matches(':popover-open')) element.hidePopover();
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape, true);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      window.visualViewport?.removeEventListener('resize', schedule);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (open)
      list.current
        ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
        ?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [active, open]);

  return (
    <span className="brand-select" ref={root}>
      <button
        ref={trigger}
        id={controlId}
        type="button"
        className="brand-select-trigger"
        role="combobox"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-required={required}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={keyDown}
        onBlur={(event) => {
          if (!list.current?.contains(event.relatedTarget)) setOpen(false);
        }}
      >
        <span>
          {options.find((option) => option.value === current)?.label ?? options[0]?.label}
        </span>
        <ChevronDown size={16} />
      </button>
      <select
        ref={mirror}
        className="brand-select-mirror"
        aria-hidden="true"
        tabIndex={-1}
        name={name}
        value={current}
        required={required}
        disabled={disabled}
        onChange={(event) => {
          setLocal(event.target.value);
          onValueChange?.(event.target.value);
        }}
        onInvalid={(event) => {
          event.preventDefault();
          trigger.current?.focus();
          show();
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {open &&
        host &&
        createPortal(
          <div
            ref={list}
            popover="manual"
            id={listId}
            className="brand-select-menu"
            role="listbox"
            aria-label={label}
            style={position}
            data-lenis-prevent
          >
            {options.map((option, index) => (
              <div
                key={option.value}
                id={`${listId}-${index}`}
                data-index={index}
                role="option"
                aria-selected={option.value === current}
                aria-disabled={option.disabled || undefined}
                data-active={index === active || undefined}
                className="brand-select-option"
                onPointerDown={(event) => event.preventDefault()}
                onPointerMove={(event) => {
                  if (event.pointerType === 'mouse' && !option.disabled) setActive(index);
                }}
                onClick={() => choose(index)}
              >
                <span>{option.label}</span>
                {option.value === current && <Check size={16} />}
              </div>
            ))}
          </div>,
          host,
        )}
    </span>
  );
}
