/**
 * IndexedDB-based image store for externalizing image data from localStorage.
 *
 * Images (e.g. employee avatars) are stored in IndexedDB which supports
 * gigabytes of data, instead of localStorage which is limited to ~5-10MB.
 * Only lightweight reference IDs are kept in the zustand state.
 */

const DB_NAME = 'planner-images'
const DB_VERSION = 1
const STORE_NAME = 'images'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Save an image (base64 data URL) to IndexedDB.
 * Returns a reference key that can be stored in the zustand state.
 */
export async function saveImage(id: string, dataUrl: string): Promise<string> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put({ id, dataUrl })
    tx.oncomplete = () => resolve(id)
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Load an image data URL from IndexedDB by its reference key.
 * Returns null if the image is not found.
 */
export async function loadImage(id: string): Promise<string | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(id)
    request.onsuccess = () => {
      const result = request.result
      resolve(result ? result.dataUrl : null)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Delete an image from IndexedDB.
 */
export async function deleteImage(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Check if a string is an inline base64 data URL (not an external reference).
 */
export function isBase64DataUrl(value: string | undefined): boolean {
  if (!value) return false
  return value.startsWith('data:image/')
}

/**
 * Generate a unique image reference ID for an employee avatar.
 */
export function generateImageId(employeeId: string): string {
  return `avatar-${employeeId}`
}
