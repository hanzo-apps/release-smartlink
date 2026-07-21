import { useIam } from '@hanzo/iam/react'
import { XStack, Text } from '@hanzo/gui'
import type { Release, PlatformLink } from '../lib/catalog'
import { SmartLink } from './smartlink'

/**
 * A sample release so the public page is a complete, designed smart link before
 * anyone signs in (an honest showcase — not the artist's real data). The artist
 * signs in to edit their own release, stored per-org in Base.
 */
const DEMO_RELEASE: Release = {
  title: 'Neon Meridian',
  artist: 'Halcyon Reef',
  release_date: '2026-08-14',
}

const DEMO_LINKS: PlatformLink[] = [
  { platform: 'Spotify', url: 'https://open.spotify.com' },
  { platform: 'Apple Music', url: 'https://music.apple.com' },
  { platform: 'YouTube Music', url: 'https://music.youtube.com' },
  { platform: 'Amazon Music', url: 'https://music.amazon.com' },
  { platform: 'SoundCloud', url: 'https://soundcloud.com' },
  { platform: 'Tidal', url: 'https://tidal.com' },
]

/**
 * Public landing — the fan-facing smart link for a demo release, with an
 * "Artist sign in" affordance that starts the Hanzo PKCE flow. There is no
 * local credential form; Hanzo IAM owns every credential interaction.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()

  const signIn = (
    <XStack position="absolute" top={0} right={0} padding="$4" zIndex={2}>
      <XStack
        alignItems="center"
        gap="$2"
        paddingVertical="$2"
        paddingHorizontal="$3"
        borderRadius="$10"
        borderWidth={1}
        borderColor="rgba(255,255,255,0.16)"
        backgroundColor="rgba(255,255,255,0.06)"
        cursor="pointer"
        hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
        pressStyle={{ scale: 0.97 }}
        onPress={() => login()}
      >
        <Text fontSize={13} fontWeight="700" color="#ffffff">
          {isLoading ? 'Loading…' : 'Artist sign in'}
        </Text>
      </XStack>
    </XStack>
  )

  return <SmartLink release={DEMO_RELEASE} links={DEMO_LINKS} header={signIn} />
}
