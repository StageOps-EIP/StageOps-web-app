import { useContext } from 'react'
import { DemoDataContext } from '@/contexts/demo-data.context'

export function useDemoData() {
  const context = useContext(DemoDataContext)
  if (!context) throw new Error('useDemoData doit être utilisé dans DemoDataProvider')
  return context
}
