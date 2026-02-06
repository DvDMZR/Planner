import { useState, useEffect } from 'react'
import { loadImage } from './imageStore'

/**
 * Hook to resolve an avatarUrl that may be an IndexedDB reference.
 * If the URL starts with "idb://", it loads the actual image data from IndexedDB.
 * Otherwise, returns the URL as-is (e.g. external URL or undefined).
 */
export function useAvatarUrl(avatarUrl: string | undefined): string | undefined {
  const [resolvedUrl, setResolvedUrl] = useState<string | undefined>(
    avatarUrl && !avatarUrl.startsWith('idb://') ? avatarUrl : undefined
  )

  useEffect(() => {
    if (!avatarUrl) {
      setResolvedUrl(undefined)
      return
    }

    if (avatarUrl.startsWith('idb://')) {
      const imageId = avatarUrl.replace('idb://', '')
      loadImage(imageId)
        .then((dataUrl) => setResolvedUrl(dataUrl ?? undefined))
        .catch(() => setResolvedUrl(undefined))
    } else {
      setResolvedUrl(avatarUrl)
    }
  }, [avatarUrl])

  return resolvedUrl
}
