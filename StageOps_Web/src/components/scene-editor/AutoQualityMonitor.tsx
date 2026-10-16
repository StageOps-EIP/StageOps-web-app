import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { createAutoQualityState, sampleAutoQuality } from './auto-quality'
import type { AutoQualityState } from './auto-quality'

export function AutoQualityMonitor({
  active,
  onChange,
}: {
  active: boolean
  onChange: (quality: Pick<AutoQualityState, 'tier' | 'lowResolution'>) => void
}) {
  const sample = useRef(createAutoQualityState())
  useFrame((_, delta) => {
    const previous = sample.current
    sample.current = sampleAutoQuality(previous, delta, active)
    if (
      sample.current.tier !== previous.tier ||
      sample.current.lowResolution !== previous.lowResolution
    ) {
      onChange({ tier: sample.current.tier, lowResolution: sample.current.lowResolution })
    }
  })
  return null
}
