import { useSyncExternalStore } from 'react'

let isOpen = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return isOpen
}

function getServerSnapshot() {
  return false
}

export function openMobileFilterSheet() {
  isOpen = true
  emit()
}

export function closeMobileFilterSheet() {
  isOpen = false
  emit()
}

export function toggleMobileFilterSheet() {
  isOpen = !isOpen
  emit()
}

export function useMobileFilterSheetOpen(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
