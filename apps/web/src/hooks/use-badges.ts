'use client'

import { useSyncExternalStore } from 'react'
import { badgeStore } from '@/lib/badge-store'

/**
 * Subscribes to the live badge store and returns the current map of
 * { [elementId]: value }. Populated by the SignalR `UpdateBadge` event.
 */
export function useBadges(): Record<string, string> {
  return useSyncExternalStore(badgeStore.subscribe, badgeStore.get, badgeStore.get)
}
