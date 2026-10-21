/** "(3) WhatsApp" -> "WhatsApp". Also handles "(99+) WhatsApp". */
export function stripUnreadCount(title: string): string {
  return title.replace(/^\s*\(\d+\+?\)\s*/, '');
}

/** True when a search box value contains an actual query. */
export function hasSearchQuery(value: string | null | undefined): boolean {
  if (!value) return false;
  // Contenteditable search boxes can hold zero-width placeholders.
  return value.replace(/[​-‍﻿]/g, '').trim().length > 0;
}
