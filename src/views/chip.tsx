import { YStack, Text } from '@hanzo/gui'
import { type Brand, inkOn } from '../lib/catalog'

/** The square brand mark used on streaming buttons and in the links editor. */
export function Chip({ brand, size = 34 }: { brand: Brand; size?: number }) {
  return (
    <YStack
      width={size}
      height={size}
      borderRadius={Math.round(size * 0.3)}
      backgroundColor={brand.color}
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={Math.round(size * 0.5)} fontWeight="900" color={inkOn(brand.color)}>
        {brand.mark}
      </Text>
    </YStack>
  )
}
