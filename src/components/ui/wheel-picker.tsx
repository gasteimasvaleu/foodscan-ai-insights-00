import { useEffect, useMemo, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type WheelOption = string | { label: string; value: string };

interface WheelPickerProps {
  value: string;
  onChange: (value: string) => void;
  options: WheelOption[];
  label?: string;
  itemHeight?: number;
  visibleItems?: number;
  className?: string;
}

export function WheelPicker({
  value,
  onChange,
  options,
  label,
  itemHeight = 40,
  visibleItems = 5,
  className,
}: WheelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const scrollTimeoutRef = useRef<number | null>(null);

  const normalizedOptions = useMemo(
    () =>
      options.map((option) =>
        typeof option === "string"
          ? { label: option, value: option }
          : { label: option.label, value: option.value }
      ),
    [options]
  );

  const selectedIndex = Math.max(
    0,
    normalizedOptions.findIndex((option) => option.value === value)
  );

  const pickerHeight = itemHeight * visibleItems;
  const centerPadding = (pickerHeight - itemHeight) / 2;

  const snapToIndex = (index: number, smooth = true) => {
    const el = containerRef.current;
    if (!el) return;

    const clampedIndex = Math.max(0, Math.min(index, normalizedOptions.length - 1));
    el.scrollTo({
      top: clampedIndex * itemHeight,
      behavior: smooth ? "smooth" : "auto",
    });

    const nextValue = normalizedOptions[clampedIndex]?.value;
    if (nextValue && nextValue !== value) {
      onChange(nextValue);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const targetTop = selectedIndex * itemHeight;
    if (Math.abs(el.scrollTop - targetTop) > 1) {
      el.scrollTo({ top: targetTop, behavior: "auto" });
    }
  }, [selectedIndex, itemHeight]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const nextIndex = Math.round(el.scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(nextIndex, normalizedOptions.length - 1));
    const nextValue = normalizedOptions[clampedIndex]?.value;

    if (nextValue && nextValue !== value) {
      onChange(nextValue);
    }

    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      snapToIndex(clampedIndex, true);
    }, 120);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      snapToIndex(selectedIndex - 1);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      snapToIndex(selectedIndex + 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      snapToIndex(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      snapToIndex(normalizedOptions.length - 1);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium">{label}</p>}

      <div className="relative rounded-xl border border-border bg-muted/20">
        <div
          className="pointer-events-none absolute left-1 right-1 rounded-lg border border-primary/30 bg-background/80"
          style={{
            top: centerPadding,
            height: itemHeight,
          }}
          aria-hidden="true"
        />

        <div
          ref={containerRef}
          role="listbox"
          aria-label={label}
          tabIndex={0}
          className="wheel-picker-scroll overflow-y-auto overscroll-contain touch-pan-y focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
          style={{
            height: pickerHeight,
            scrollSnapType: "y mandatory",
          }}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
        >
          <div style={{ height: centerPadding }} aria-hidden="true" />

          {normalizedOptions.map((option, index) => {
            const isSelected = value === option.value;

            return (
              <button
                key={option.value}
                ref={(el) => (itemRefs.current[index] = el)}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={cn(
                  "w-full px-3 text-center transition-colors",
                  "focus:outline-none focus-visible:text-foreground",
                  isSelected ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
                style={{
                  height: itemHeight,
                  lineHeight: `${itemHeight}px`,
                  scrollSnapAlign: "center",
                }}
                onClick={() => snapToIndex(index)}
              >
                {option.label}
              </button>
            );
          })}

          <div style={{ height: centerPadding }} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}