"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SearchSelectOption = {
    value: string;
    label: string;
    hint?: string;
};

type SearchSelectProps = {
    name?: string;
    value: string;
    onChange: (value: string) => void;
    options: SearchSelectOption[];
    placeholder?: string;
    className?: string;
};

export function SearchSelect({
    name,
    value,
    onChange,
    options,
    placeholder,
    className,
}: SearchSelectProps) {
    const t = useTranslations("common");
    const listId = useId();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [highlight, setHighlight] = useState(0);
    const selected = options.find((option) => option.value === value);

    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        if (!normalized) return options;

        return options.filter((option) =>
            `${option.label} ${option.hint ?? ""}`.toLowerCase().includes(normalized),
        );
    }, [options, query]);

    useEffect(() => {
        if (!open) return;

        const active = document.getElementById(listId)?.querySelector('[data-active="true"]');

        active?.scrollIntoView({ block: "nearest" });
    }, [highlight, open, filtered, listId]);

    function select(next: string) {
        onChange(next);
        setOpen(false);
    }

    function handleKeyDown(event: React.KeyboardEvent) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlight((current) => Math.min(current + 1, filtered.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlight((current) => Math.max(current - 1, 0));
        } else if (event.key === "Enter") {
            event.preventDefault();

            const option = filtered[highlight];
            if (option) select(option.value);
        }
    }

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);

                if (next) {
                    setQuery("");
                    setHighlight(0);
                }
            }}
        >
            {name && <input type="hidden" name={name} value={value} />}

            <PopoverTrigger
                className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-left text-sm focus-visible:ring-2 focus-visible:ring-ring/50 outline-none",
                    className,
                )}
            >
                <span className={cn("truncate", !selected && "text-muted-foreground")}>
                    {selected?.label ?? placeholder}
                </span>
                <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-[var(--anchor-width)] gap-0 overflow-hidden p-0"
            >
                <div className="border-b p-2">
                    <input
                        autoFocus
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setHighlight(0);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={t("search")}
                        className="w-full rounded-md border bg-background px-2 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-ring/50 outline-none"
                    />
                </div>

                <div id={listId} role="listbox" className="max-h-72 overflow-y-auto p-1">
                    {filtered.length === 0 && (
                        <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                            {t("noResults")}
                        </p>
                    )}

                    {filtered.map((option, index) => (
                        <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={option.value === value}
                            data-active={index === highlight}
                            onMouseEnter={() => setHighlight(index)}
                            onClick={() => select(option.value)}
                            className={cn(
                                "flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm",
                                index === highlight && "bg-muted",
                            )}
                        >
                            <span className="min-w-0 truncate">{option.label}</span>

                            <span className="flex shrink-0 items-center gap-2">
                                {option.hint && (
                                    <span className="text-xs text-muted-foreground">
                                        {option.hint}
                                    </span>
                                )}
                                {option.value === value && <Check className="size-3.5" />}
                            </span>
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
