import { useEffect, useState } from 'react'
import { useMutation, type BaseRecord } from '@hanzo/base/react'
import { YStack, XStack, Input, Button, Text, Paragraph, Separator } from '@hanzo/gui'
import { type Release, type PlatformLink, brandFor } from '../lib/catalog'
import { Chip } from './chip'

/** A `release` row. */
export interface ReleaseRecord extends BaseRecord, Release {}
/** A `links` row. */
export interface LinkRecord extends BaseRecord, PlatformLink {}

function Field({
  label,
  value,
  placeholder,
  onChangeText,
}: {
  label: string
  value: string
  placeholder: string
  onChangeText: (v: string) => void
}) {
  return (
    <YStack gap="$1.5">
      <Text fontSize={12} fontWeight="700" opacity={0.55}>
        {label}
      </Text>
      <Input value={value} placeholder={placeholder} onChangeText={onChangeText} />
    </YStack>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <YStack
      gap="$3"
      padding="$4"
      borderRadius="$6"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$background"
    >
      <Text fontSize={15} fontWeight="800">
        {title}
      </Text>
      {children}
    </YStack>
  )
}

/** Edit the release (title/artist/cover/date), creating it the first time. */
function ReleaseForm({ release, onSaved }: { release?: ReleaseRecord; onSaved: () => Promise<void> }) {
  const create = useMutation('release', 'create')
  const update = useMutation('release', 'update')
  const [form, setForm] = useState<Release>({ title: '', artist: '', cover_url: '', release_date: '' })

  useEffect(() => {
    if (release) {
      setForm({
        title: release.title,
        artist: release.artist,
        cover_url: release.cover_url ?? '',
        release_date: release.release_date ?? '',
      })
    }
  }, [release?.id])

  const set = (k: keyof Release) => (v: string) => setForm((f) => ({ ...f, [k]: v }))
  const busy = create.isLoading || update.isLoading
  const ready = form.title.trim().length > 0 && form.artist.trim().length > 0

  async function save() {
    if (!ready || busy) return
    const payload = {
      title: form.title.trim(),
      artist: form.artist.trim(),
      cover_url: form.cover_url?.trim() ?? '',
      release_date: form.release_date?.trim() ?? '',
    }
    if (release) await update.mutate({ id: release.id, ...payload })
    else await create.mutate(payload)
    await onSaved()
  }

  return (
    <Section title="Release">
      <Field label="TITLE" value={form.title} placeholder="Neon Meridian" onChangeText={set('title')} />
      <Field label="ARTIST" value={form.artist} placeholder="Halcyon Reef" onChangeText={set('artist')} />
      <Field
        label="COVER IMAGE URL"
        value={form.cover_url ?? ''}
        placeholder="https://…  (leave blank for a generated cover)"
        onChangeText={set('cover_url')}
      />
      <Field
        label="RELEASE DATE"
        value={form.release_date ?? ''}
        placeholder="2026-08-14"
        onChangeText={set('release_date')}
      />
      {(create.error || update.error) && (
        <Paragraph color="$red10">{(create.error ?? update.error)?.message}</Paragraph>
      )}
      <XStack>
        <Button theme="active" disabled={!ready || busy} onPress={save}>
          {release ? 'Save release' : 'Create release'}
        </Button>
      </XStack>
    </Section>
  )
}

/** One link row: brand mark, editable URL, live click count, save + delete. */
function LinkRow({ link, onChanged }: { link: LinkRecord; onChanged: () => Promise<void> }) {
  const update = useMutation('links', 'update')
  const remove = useMutation('links', 'delete')
  const [url, setUrl] = useState(link.url)
  const dirty = url.trim() !== link.url
  const brand = brandFor(link.platform)

  useEffect(() => setUrl(link.url), [link.url])

  return (
    <YStack gap="$2.5" padding="$3" borderRadius="$5" borderWidth={1} borderColor="$borderColor">
      <XStack alignItems="center" gap="$3">
        <Chip brand={brand} size={30} />
        <Text flex={1} fontSize={15} fontWeight="700">
          {link.platform}
        </Text>
        <XStack
          alignItems="center"
          gap="$1.5"
          paddingVertical="$1"
          paddingHorizontal="$2.5"
          borderRadius="$10"
          backgroundColor="$color4"
        >
          <Text fontSize={12} fontWeight="800">
            ▸ {link.clicks ?? 0}
          </Text>
        </XStack>
      </XStack>
      <XStack gap="$2" alignItems="center">
        <Input flex={1} size="$3" value={url} placeholder="https://…" onChangeText={setUrl} />
        <Button
          size="$3"
          theme="active"
          disabled={!dirty || update.isLoading}
          onPress={async () => {
            await update.mutate({ id: link.id, url: url.trim() })
            await onChanged()
          }}
        >
          Save
        </Button>
        <Button
          size="$3"
          chromeless
          disabled={remove.isLoading}
          onPress={async () => {
            await remove.mutate({ id: link.id })
            await onChanged()
          }}
        >
          Delete
        </Button>
      </XStack>
    </YStack>
  )
}

/** Add + edit + delete the streaming links, and see their click counts. */
function LinksEditor({ links, onChanged }: { links: LinkRecord[]; onChanged: () => Promise<void> }) {
  const create = useMutation('links', 'create')
  const [platform, setPlatform] = useState('')
  const [url, setUrl] = useState('')
  const ready = platform.trim().length > 0 && url.trim().length > 0

  async function add() {
    if (!ready || create.isLoading) return
    await create.mutate({ platform: platform.trim(), url: url.trim(), clicks: 0 })
    setPlatform('')
    setUrl('')
    await onChanged()
  }

  return (
    <Section title="Streaming links">
      {links.length === 0 ? (
        <Paragraph opacity={0.55}>No links yet — add the first platform below.</Paragraph>
      ) : (
        <YStack gap="$2.5">
          {links.map((link) => (
            <LinkRow key={link.id} link={link} onChanged={onChanged} />
          ))}
        </YStack>
      )}

      <Separator />

      <YStack gap="$2">
        <Text fontSize={12} fontWeight="700" opacity={0.55}>
          ADD PLATFORM
        </Text>
        <XStack gap="$2">
          <Input flex={1} value={platform} placeholder="Spotify" onChangeText={setPlatform} />
          <Input flex={2} value={url} placeholder="https://open.spotify.com/…" onChangeText={setUrl} />
        </XStack>
        {create.error ? <Paragraph color="$red10">{create.error.message}</Paragraph> : null}
        <XStack>
          <Button theme="active" disabled={!ready || create.isLoading} onPress={add}>
            Add link
          </Button>
        </XStack>
      </YStack>
    </Section>
  )
}

/**
 * The artist's editor: the single release plus its streaming links. Reads/writes
 * the org-scoped `release` and `links` collections through the IAM-authenticated
 * Base client (wired in providers.tsx).
 */
export function Admin({
  release,
  links,
  refetch,
}: {
  release?: ReleaseRecord
  links: LinkRecord[]
  refetch: () => Promise<void>
}) {
  return (
    <YStack gap="$4">
      <ReleaseForm release={release} onSaved={refetch} />
      {release ? (
        <LinksEditor links={links} onChanged={refetch} />
      ) : (
        <Paragraph opacity={0.55}>Create your release above to start adding streaming links.</Paragraph>
      )}
    </YStack>
  )
}
