"use client";

import { useDomain } from "./domain-store";
import { Masonry } from "./masonry";
import { domainCards, GALLERY_CARDS } from "./screen-cards";

/**
 * The home gallery's wall, filtered by the domain chips in `Search` (2026-10-08). With no domain
 * chosen it is the usual 36; with one, that domain's own screens. `key` restarts the masonry's
 * reveal so the change reads as a new set rather than cards shuffling in place.
 */
export function GalleryWall() {
  const domain = useDomain();
  const cards = domain ? domainCards(domain) : GALLERY_CARDS;
  return <Masonry key={domain ?? "all"} cards={cards} />;
}
