// Composer validation: why Send is disabled, in plain words.

/** Reason Send is disabled, or null when the reply can go out. The internal note is optional. */
export function getSendBlocker(waitingCount: number, recipientCount: number, reply: string): string | null {
  if (waitingCount === 0) return 'No contacts waiting'
  if (recipientCount === 0) return 'Add at least one recipient'
  if (reply.trim() === '') return 'Write a reply'
  return null
}
