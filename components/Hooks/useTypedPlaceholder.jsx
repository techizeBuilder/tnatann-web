"use client";
import { useEffect, useMemo, useState } from "react";

const TYPE_MS = 80;
const DELETE_MS = 40;
const HOLD_MS = 1500;
const SWAP_MS = 300;

/**
 * Types each word out, holds it, deletes it, then moves to the next one.
 * Returns "" when disabled or when the user prefers reduced motion, so the
 * caller can fall back to a static placeholder.
 */
export const useTypedPlaceholder = (words = [], enabled = true) => {
  const list = useMemo(() => words.filter(Boolean), [words.join("|")]);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (e) => setReducedMotion(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Restart cleanly whenever the word list changes (e.g. categories arrive).
  useEffect(() => {
    setText("");
    setWordIndex(0);
    setIsDeleting(false);
  }, [list]);

  const active = enabled && !reducedMotion && list.length > 0;

  useEffect(() => {
    if (!active) return;

    const word = list[wordIndex % list.length];

    if (!isDeleting) {
      if (text.length < word.length) {
        const id = setTimeout(
          () => setText(word.slice(0, text.length + 1)),
          TYPE_MS
        );
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setIsDeleting(true), HOLD_MS);
      return () => clearTimeout(id);
    }

    if (text.length > 0) {
      const id = setTimeout(
        () => setText(word.slice(0, text.length - 1)),
        DELETE_MS
      );
      return () => clearTimeout(id);
    }

    const id = setTimeout(() => {
      setIsDeleting(false);
      setWordIndex((i) => (i + 1) % list.length);
    }, SWAP_MS);
    return () => clearTimeout(id);
  }, [active, text, isDeleting, wordIndex, list]);

  return active ? text : "";
};

export default useTypedPlaceholder;
