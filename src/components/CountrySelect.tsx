"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { COUNTRIES, searchCountries, type Country } from "@/lib/countries";
import { ChevronIcon, SearchIcon } from "./Icons";

type Props = {
  value: Country;
  onChange: (country: Country) => void;
};

/**
 * Selettore di prefisso internazionale: combobox accessibile con ricerca per
 * nome, codice ISO o prefisso. Nessuna libreria, gestione tastiera inclusa.
 */
export default function CountrySelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const results = useMemo(() => searchCountries(query), [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const openMenu = () => {
    setQuery("");
    const index = COUNTRIES.findIndex((c) => c.iso === value.iso);
    setActive(index < 0 ? 0 : index);
    setOpen(true);
  };

  // Chiude il menu su click esterno o Escape.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  // All'apertura porta il focus sul campo di ricerca (solo DOM, nessuno stato).
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // Mantiene visibile l'elemento evidenziato durante la navigazione da tastiera.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const select = (country: Country) => {
    onChange(country);
    close();
  };

  const onSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const country = results[active];
      if (country) select(country);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? close() : openMenu())}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`Prefisso internazionale: ${value.name} +${value.dial}`}
        className="field flex items-center gap-2 !py-3 text-left"
      >
        <span className="text-lg leading-none">{value.flag}</span>
        <span className="font-mono text-sm">+{value.dial}</span>
        <ChevronIcon
          className={`ml-auto h-4 w-4 text-white/50 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="glass glass--overlay pop absolute z-30 mt-2 w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-[var(--radius-md)] p-2">
          <div className="relative mb-2">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onSearchKeyDown}
              placeholder="Cerca paese o prefisso"
              aria-label="Cerca paese o prefisso"
              className="field !py-2.5 !pl-9 text-sm"
            />
          </div>

          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Elenco dei paesi"
            className="scroll-glass max-h-64 overflow-y-auto"
          >
            {results.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-white/50">
                Nessun paese trovato
              </li>
            )}

            {results.map((country, index) => {
              const selected = country.iso === value.iso;
              return (
                <li key={country.iso}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    data-index={index}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => select(country)}
                    className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-left text-sm transition-colors ${
                      index === active ? "bg-white/12" : "hover:bg-white/8"
                    } ${selected ? "text-white" : "text-white/75"}`}
                  >
                    <span className="text-base leading-none">{country.flag}</span>
                    <span className="truncate">{country.name}</span>
                    <span className="ml-auto font-mono text-xs text-white/50">
                      +{country.dial}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
