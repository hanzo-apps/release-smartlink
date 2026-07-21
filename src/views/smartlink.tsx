import type { ReactNode } from 'react'
import { YStack, XStack, H1, Paragraph, Text, Image } from '@hanzo/gui'
import { LinearGradient } from '@hanzo/gui/linear-gradient'
import { type Release, type PlatformLink, brandFor, paletteFor, inkOn } from '../lib/catalog'
import { Chip } from './chip'

const INK = '#07070b'

/** Artist monogram for the vinyl label (first letters of up to two words). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '♪'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/**
 * Designed artwork when a release has no `cover_url`: a stylized vinyl record —
 * a stable title-derived gradient with concentric grooves and a monogram label.
 * Scales with the cover (percentage insets), so it never clips on mobile.
 */
function ArtGradient({ release, palette }: { release: Release; palette: [string, string, string] }) {
  const accent = palette[2]
  return (
    <LinearGradient
      fullscreen
      colors={palette}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      alignItems="center"
      justifyContent="center"
    >
      <YStack position="absolute" top="6%" left="6%" right="6%" bottom="6%" borderRadius={9999} backgroundColor="rgba(0,0,0,0.34)" />
      <YStack position="absolute" top="15%" left="15%" right="15%" bottom="15%" borderRadius={9999} borderWidth={1} borderColor="rgba(255,255,255,0.12)" />
      <YStack position="absolute" top="24%" left="24%" right="24%" bottom="24%" borderRadius={9999} borderWidth={1} borderColor="rgba(255,255,255,0.09)" />
      <YStack position="absolute" top="33%" left="33%" right="33%" bottom="33%" borderRadius={9999} borderWidth={1} borderColor="rgba(255,255,255,0.07)" />
      <YStack width="30%" aspectRatio={1} borderRadius={9999} alignItems="center" justifyContent="center" backgroundColor={accent}>
        <Text fontSize={22} fontWeight="900" letterSpacing={1} color={inkOn(accent)}>
          {initials(release.artist)}
        </Text>
      </YStack>
    </LinearGradient>
  )
}

/** The centered square cover — real artwork if provided, else designed gradient. */
function Cover({ release, palette }: { release: Release; palette: [string, string, string] }) {
  return (
    <YStack
      position="relative"
      width="100%"
      maxWidth={330}
      aspectRatio={1}
      borderRadius="$9"
      overflow="hidden"
      borderWidth={1}
      borderColor="rgba(255,255,255,0.1)"
      shadowColor="#000000"
      shadowRadius={44}
      shadowOpacity={0.55}
      shadowOffset={{ width: 0, height: 26 }}
    >
      {release.cover_url ? (
        <Image src={release.cover_url} width="100%" height="100%" objectFit="cover" />
      ) : (
        <ArtGradient release={release} palette={palette} />
      )}
    </YStack>
  )
}

/** The blurred, color-bled backdrop: a scaled cover wash under a dark scrim. */
function Backdrop({ release, palette }: { release: Release; palette: [string, string, string] }) {
  return (
    <YStack position="absolute" top={0} left={0} right={0} bottom={0} overflow="hidden">
      {release.cover_url ? (
        <Image
          src={release.cover_url}
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          width="100%"
          height="100%"
          objectFit="cover"
          opacity={0.5}
        />
      ) : (
        <LinearGradient
          fullscreen
          colors={palette}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          opacity={0.6}
        />
      )}
      <YStack position="absolute" top={0} left={0} right={0} bottom={0} backgroundColor="rgba(7,7,12,0.6)" />
      <LinearGradient
        fullscreen
        colors={['rgba(7,7,12,0)', 'rgba(7,7,12,0.94)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
    </YStack>
  )
}

/** One full-width streaming button — brand chip, service name, PLAY affordance. */
function PlatformButton({ link, onPress }: { link: PlatformLink; onPress: () => void }) {
  const brand = brandFor(link.platform)
  return (
    <XStack
      width="100%"
      alignItems="center"
      gap="$3"
      paddingVertical="$3"
      paddingHorizontal="$4"
      borderRadius="$12"
      borderWidth={1}
      borderColor="rgba(255,255,255,0.1)"
      backgroundColor="rgba(255,255,255,0.05)"
      cursor="pointer"
      hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.11)', borderColor: 'rgba(255,255,255,0.22)' }}
      pressStyle={{ scale: 0.985, backgroundColor: 'rgba(255,255,255,0.14)' }}
      onPress={onPress}
    >
      <Chip brand={brand} />
      <Text flex={1} fontSize={16} fontWeight="700" color="#ffffff">
        {link.platform}
      </Text>
      <Text fontSize={12} fontWeight="800" letterSpacing={2} color="rgba(255,255,255,0.55)">
        PLAY
      </Text>
    </XStack>
  )
}

function outLabel(date?: string): string | null {
  if (!date) return null
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim())
  // Parse a plain YYYY-MM-DD as a LOCAL date (not UTC) so it never shows the
  // day before in timezones behind UTC.
  const d = iso ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])) : new Date(date)
  if (Number.isNaN(d.getTime())) return date
  return `OUT ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}`
}

export interface SmartLinkProps {
  release: Release
  links: PlatformLink[]
  /** Side effect on button tap (e.g. track a click). The link still opens. */
  onOpen?: (link: PlatformLink) => void
  /** Optional overlay slot (e.g. an artist sign-in affordance). */
  header?: ReactNode
}

/**
 * The fan-facing smart link: one vinyl-centric fold — backdrop, cover, title,
 * and a stack of streaming buttons. Presentational and shared by the public
 * landing (demo release) and the signed-in live preview (the artist's release).
 */
export function SmartLink({ release, links, onOpen, header }: SmartLinkProps) {
  const palette = paletteFor(release.title || release.artist || 'dropmark')
  const out = outLabel(release.release_date)

  function open(link: PlatformLink) {
    onOpen?.(link)
    if (typeof window !== 'undefined' && link.url) {
      window.open(link.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <YStack
      position="relative"
      flex={1}
      width="100%"
      minHeight="100%"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      backgroundColor={INK}
      paddingVertical="$9"
      paddingHorizontal="$4"
    >
      <Backdrop release={release} palette={palette} />
      {header}
      <YStack width="100%" maxWidth={430} alignItems="center" gap="$6" zIndex={1}>
        <Cover release={release} palette={palette} />

        <YStack alignItems="center" gap="$2" width="100%">
          <Text fontSize={11} fontWeight="800" letterSpacing={3} color="rgba(255,255,255,0.5)">
            NEW RELEASE
          </Text>
          <H1 fontSize={30} lineHeight={34} fontWeight="900" textAlign="center" color="#ffffff">
            {release.title}
          </H1>
          <Paragraph fontSize={17} fontWeight="600" color="rgba(255,255,255,0.82)">
            {release.artist}
          </Paragraph>
          {out ? (
            <Text fontSize={12} fontWeight="800" letterSpacing={2} color="rgba(255,255,255,0.5)">
              {out}
            </Text>
          ) : null}
        </YStack>

        {links.length === 0 ? (
          <Paragraph opacity={0.5} textAlign="center">
            Streaming links coming soon.
          </Paragraph>
        ) : (
          <YStack width="100%" gap="$3">
            {links.map((link, i) => (
              <PlatformButton key={link.url + i} link={link} onPress={() => open(link)} />
            ))}
          </YStack>
        )}

        <Text fontSize={12} fontWeight="700" letterSpacing={2} color="rgba(255,255,255,0.32)">
          DROPMARK
        </Text>
      </YStack>
    </YStack>
  )
}
