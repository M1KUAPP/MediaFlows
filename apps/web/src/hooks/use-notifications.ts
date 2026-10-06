'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { notificationStore, type AppNotification } from '@/lib/notification-store'

const NO_NOTIFICATIONS: AppNotification[] = []

export function useNotifications() {
  // The server snapshot is empty; the client reads localStorage after hydration.
  const notifications = useSyncExternalStore(
    notificationStore.subscribe,
    notificationStore.get,
    () => NO_NOTIFICATIONS
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = useCallback(() => {
    notifications.filter((n) => !n.read).forEach((n) => notificationStore.markAsRead(n.id))
  }, [notifications])

  return { notifications, unreadCount, markAllRead }
}
