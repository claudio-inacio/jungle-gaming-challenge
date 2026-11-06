import { useQuery } from '@tanstack/react-query'
import { sessionQuery } from '../api/session'
import { tokenStorage } from './token-storage'

export function useSessionRestoring() {
  const storedToken = tokenStorage.get()

  const query = useQuery({
    ...sessionQuery(),
    enabled: Boolean(storedToken),
  })

  return Boolean(storedToken) && query.isLoading
}
