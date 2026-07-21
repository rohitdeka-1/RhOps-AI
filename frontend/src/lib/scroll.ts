/**
 * Smoothly scroll to an element matching the given hash selector
 * (e.g. "#pricing"). No-op if the element doesn't exist.
 */
export const scrollToHash = (hash: string) => {
  const el = document.querySelector(hash);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};
