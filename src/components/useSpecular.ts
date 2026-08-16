"use client";

import { useCallback, useRef } from "react";

/**
 * Restituisce un handler `onPointerMove` che aggiorna le variabili CSS
 * --px / --py sull'elemento, usate da `.glass--specular` per il riflesso.
 *
 * L'elemento arriva da `event.currentTarget`, quindi non serve alcun ref; le
 * scritture sono accorpate in un frame per evitare thrashing di layout.
 */
export function useSpecular<T extends HTMLElement>() {
  const frame = useRef(0);

  return useCallback((event: React.PointerEvent<T>) => {
    if (frame.current) return;

    const node = event.currentTarget;
    const { clientX, clientY } = event;

    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const rect = node.getBoundingClientRect();
      node.style.setProperty(
        "--px",
        `${((clientX - rect.left) / rect.width) * 100}%`,
      );
      node.style.setProperty(
        "--py",
        `${((clientY - rect.top) / rect.height) * 100}%`,
      );
    });
  }, []);
}
