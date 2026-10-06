'use client'

import { useSyncExternalStore } from 'react'
import { PageHeader } from '@/components/shared/page-header'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const noSubscription = () => () => {}

export function DashboardGreeting({ name }: { name: string }) {
  // The server snapshot avoids a hydration mismatch; the client shows the
  // time-based greeting.
  const greeting = useSyncExternalStore(noSubscription, getGreeting, () => 'Welcome back')

  return <PageHeader title={`${greeting}, ${name}`} description="Here's your workspace at a glance." />
}
