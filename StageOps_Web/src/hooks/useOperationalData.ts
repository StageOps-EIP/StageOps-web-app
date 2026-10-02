import { useContext } from 'react'
import { OperationalDataContext } from '@/contexts/operational-data.context'

export function useOperationalData() {
  const context = useContext(OperationalDataContext)
  if (!context) {
    throw new Error('useOperationalData doit être utilisé dans OperationalDataProvider')
  }
  return context
}
