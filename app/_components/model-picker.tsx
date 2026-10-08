"use client";

import { Check, Lock } from "@/app/_vendor/icons";
import { useState } from "react";

import { Group, Panel, Search, SeeAll } from "./menu";
import { ALL_ROWS, MODEL_GROUPS, type ModelRow, TOP_ROWS } from "./models";
import { FONT } from "./type";

/**
 * The model and agent list (`SD-221`), built to the reference's own structure: a search field, a
 * couple of ungrouped rows, then Agents, Text, Image and Video, each folded to a few with a
 * **See all** under it.
 *
 * **The rows are mock data** and say so where they live, in `models.ts`. The dev's call: the UI is
 * being built now and the functionality later, so the list is complete rather than honest-and-empty.
 * Nothing here is checked against a capability or a price.
 *
 * **No third-party marks.** Every tile is a monogram, which is also what the reference does for its
 * own row. Shipping another company's logo into a storefront is a licence question nobody has asked.
 *
 * **Search flattens.** While there is a query the groups and the folds go away, because a reader who
 * typed three letters is looking for one row and not for the shape of the catalogue.
 */

function Cost({ value }: { value: number }) {
  return (
    <span
      className={`${FONT} flex shrink-0 items-center gap-[3px] text-[length:var(--store-body-3)] font-medium text-[var(--store-neutral-100)]`}
    >
      {value}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-[var(--store-primary-40)]">
        <path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" />
      </svg>
      <span className="sr-only">credits</span>
    </span>
  );
}

function Line({
  row,
  selected,
  onSelect,
}: {
  row: ModelRow;
  selected: boolean;
  onSelect: (row: ModelRow) => void;
}) {
  return (
    <button
      type="button"
      title={row.name}
      onClick={() => onSelect(row)}
      aria-pressed={selected}
      className={`${FONT} flex h-[50px] w-full cursor-pointer items-center gap-[10px] rounded-[10px] px-[6px] text-left transition-colors duration-150 hover:bg-[var(--store-primary-10)]`}
    >
      <span
        className={`${FONT} flex size-[36px] shrink-0 items-center justify-center rounded-[8px] bg-[var(--store-neutral-30)] text-[length:var(--store-body-3)] font-semibold text-[var(--store-neutral-100)]`}
      >
        {row.mono}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-[4px]">
          <span className="truncate text-[length:var(--store-body-2)] font-medium leading-[1.4] text-[var(--store-neutral-100)]">
            {row.name}
          </span>
          {row.locked ? (
            <Lock width={12} height={12} aria-label="Paid tier" className="shrink-0 text-[var(--store-neutral-80)]" />
          ) : null}
          {row.badge ? (
            <span
              className={`${FONT} shrink-0 rounded-[12px] bg-[var(--store-primary-10)] px-[6px] text-[length:var(--store-body-4)] font-medium leading-[15px] text-[var(--store-primary-40)]`}
            >
              {row.badge}
            </span>
          ) : null}
        </span>
        {row.note ? (
          <span className="block truncate text-[length:var(--store-body-3)] leading-[1.4] text-[var(--store-neutral-80)]">
            {row.note}
          </span>
        ) : null}
      </span>
      {selected ? (
        <Check width={16} height={16} aria-hidden="true" className="shrink-0 text-[var(--store-primary-40)]" />
      ) : null}
      {row.cost !== undefined ? <Cost value={row.cost} /> : null}
    </button>
  );
}

export function ModelPicker({
  open,
  onClose,
  selected,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selected: string;
  onSelect: (row: ModelRow) => void;
}) {
  const [query, setQuery] = useState("");
  const [unfolded, setUnfolded] = useState<readonly string[]>([]);

  const pick = (row: ModelRow) => {
    onSelect(row);
    onClose();
  };

  const q = query.trim().toLowerCase();
  const hits = q === "" ? [] : ALL_ROWS.filter((r) => `${r.name} ${r.note ?? ""}`.toLowerCase().includes(q));

  return (
    <Panel open={open} onClose={onClose} label="Select AI model" width={400}>
      <Search value={query} onChange={setQuery} placeholder="Search AI model" />

      {q !== "" ? (
        hits.length === 0 ? (
          <p className={`${FONT} px-[8px] py-[16px] text-[length:var(--store-body-2)] text-[var(--store-neutral-80)]`}>
            Nothing matches "{query}".
          </p>
        ) : (
          hits.map((row) => (
            <Line key={row.id} row={row} selected={row.id === selected} onSelect={pick} />
          ))
        )
      ) : (
        <>
          {TOP_ROWS.map((row) => (
            <Line key={row.id} row={row} selected={row.id === selected} onSelect={pick} />
          ))}
          {MODEL_GROUPS.map((group) => {
            const open = unfolded.includes(group.id);
            const fold = group.fold ?? group.rows.length;
            const rows = open ? group.rows : group.rows.slice(0, fold);
            const hidden = group.rows.length - fold;
            return (
              <div key={group.id}>
                <Group>{group.title}</Group>
                {rows.map((row) => (
                  <Line key={row.id} row={row} selected={row.id === selected} onSelect={pick} />
                ))}
                {hidden > 0 ? (
                  <SeeAll
                    open={open}
                    hidden={hidden}
                    onClick={() =>
                      setUnfolded((u) => (u.includes(group.id) ? u.filter((x) => x !== group.id) : [...u, group.id]))
                    }
                  />
                ) : null}
              </div>
            );
          })}
        </>
      )}
    </Panel>
  );
}
