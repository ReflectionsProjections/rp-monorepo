import { Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import type { APIRoutes } from '@app'
import { usePolling } from '@app'
import { AnimatedCounter } from '@app'
import { useMirrorStyles } from '@app/sections/admin/styles/Mirror'
import type { GettablePaths } from '@api/type-wrapper'

type Transformer<T extends GettablePaths> = (
  data: APIRoutes[T]['GET']['response']
) => number

type StatCardProps<T extends GettablePaths> = {
  label: string
  endpoint: T
  transformer: Transformer<T>
  enabled?: boolean
  interval?: number
}

const StatCard = <T extends GettablePaths>({
  label,
  endpoint,
  transformer,
  enabled,
  interval
}: StatCardProps<T>) => {
  const mirrorStyles = useMirrorStyles(true)
  const { data, error, isLoading } = usePolling(
    endpoint,
    enabled ?? true,
    interval
  )

  return (
    <Stat sx={mirrorStyles}>
      <StatLabel>{label}</StatLabel>
      <StatNumber>
        {isLoading || error ? (
          '—'
        ) : (
          <AnimatedCounter
            value={(data !== null ? transformer(data) : 0).toString()}
          />
        )}
      </StatNumber>
    </Stat>
  )
}

export default StatCard
