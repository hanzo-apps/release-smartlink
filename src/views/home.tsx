import { useIam } from '@hanzo/iam/react'
import { useQuery, useMutation } from '@hanzo/base/react'
import { YStack, XStack, Text, Paragraph, Button, Spinner, ScrollView, useMedia } from '@hanzo/gui'
import type { PlatformLink } from '../lib/catalog'
import { SmartLink } from './smartlink'
import { Admin, type ReleaseRecord, type LinkRecord } from './admin'

/**
 * Signed-in shell for the artist: a live preview of the fan-facing smart link
 * next to the editor. Owns the org-scoped `release`/`links` queries and forwards
 * a click tracker into the preview so taps bump the real counts shown in Admin.
 */
export function Home() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'you'
  const media = useMedia()

  const releaseQ = useQuery<ReleaseRecord>('release', { sort: '-created', realtime: false })
  const linksQ = useQuery<LinkRecord>('links', { sort: 'created', realtime: false })
  const release = releaseQ.data[0]
  const links = linksQ.data
  const track = useMutation('links', 'update')

  async function refetch() {
    await Promise.all([releaseQ.refetch(), linksQ.refetch()])
  }

  function onOpen(link: PlatformLink) {
    const rec = links.find((l) => l.url === link.url && l.platform === link.platform)
    if (rec) track.mutate({ id: rec.id, clicks: (rec.clicks ?? 0) + 1 }).then(refetch)
  }

  const loading = releaseQ.isLoading && releaseQ.data.length === 0

  const preview = (
    <YStack
      width="100%"
      borderRadius="$8"
      overflow="hidden"
      borderWidth={1}
      borderColor="$borderColor"
      minHeight={520}
    >
      {release ? (
        <SmartLink release={release} links={links} onOpen={onOpen} />
      ) : (
        <YStack flex={1} minHeight={520} alignItems="center" justifyContent="center" padding="$6" backgroundColor="#07070b" gap="$2">
          <Text fontSize={15} fontWeight="800" color="#ffffff">
            Your smart link previews here
          </Text>
          <Paragraph textAlign="center" color="rgba(255,255,255,0.55)">
            Add your release details and it appears live, exactly as fans will see it.
          </Paragraph>
        </YStack>
      )}
    </YStack>
  )

  const editor = (
    <YStack width="100%" gap="$4">
      <YStack gap="$1">
        <Text fontSize={13} fontWeight="800" opacity={0.55}>
          EDIT
        </Text>
        <Paragraph opacity={0.6}>
          Fans see the page; you see the clicks. Changes save to Base, scoped to your org.
        </Paragraph>
      </YStack>
      <Admin release={release} links={links} refetch={refetch} />
    </YStack>
  )

  return (
    <ScrollView flex={1} backgroundColor="$background">
      <YStack minHeight="100vh" backgroundColor="$background">
        <XStack
          alignItems="center"
          justifyContent="space-between"
          padding="$4"
          borderBottomWidth={1}
          borderColor="$borderColor"
        >
          <XStack alignItems="center" gap="$2">
            <Text fontSize={20} fontWeight="900" letterSpacing={0.5}>
              Dropmark
            </Text>
            <Text fontSize={12} fontWeight="700" opacity={0.4}>
              SMART LINK
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$3">
            <Paragraph fontSize={13} opacity={0.6}>
              {who}
            </Paragraph>
            <Button size="$3" onPress={() => logout()}>
              Sign out
            </Button>
          </XStack>
        </XStack>

        {loading ? (
          <YStack flex={1} minHeight={480} alignItems="center" justifyContent="center">
            <Spinner size="large" />
          </YStack>
        ) : (
          <XStack
            padding="$4"
            gap="$5"
            width="100%"
            maxWidth={1080}
            alignSelf="center"
            flexDirection={media.gtMd ? 'row' : 'column-reverse'}
            alignItems="flex-start"
          >
            <YStack flex={1} width="100%">
              {editor}
            </YStack>
            <YStack width="100%" maxWidth={media.gtMd ? 400 : undefined} flexShrink={0} alignSelf={media.gtMd ? 'auto' : 'center'}>
              {preview}
            </YStack>
          </XStack>
        )}
      </YStack>
    </ScrollView>
  )
}
