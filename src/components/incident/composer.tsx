import { Check } from 'lucide-react'
import { useEffect, useId, useImperativeHandle, useRef, useState, type Ref } from 'react'
import { RecipientChip } from '@/components/ds/recipient-chip'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getSourceLabel } from '@/domain/constants'
import { getIncidentContacts, getRoute } from '@/domain/lookup'
import { getStopLabel } from '@/domain/route'
import type { Incident, WorkspaceData } from '@/domain/types'
import { pluralize } from '@/lib/pluralize'

export interface ComposerHandle {
  /** Focus the internal note, prefilling it when empty. */
  focusNote: (prefill: string) => void
}

export interface SendReplyInput {
  contactIds: string[]
  reply: string
  note: string
}

interface ComposerProps {
  incident: Incident
  data: WorkspaceData
  ref?: Ref<ComposerHandle>
  onSend?: (input: SendReplyInput) => void
  onAddNote?: (text: string) => void
}

/** Pinned under the timeline: log what happened (internal) and reply to every waiting contact. */
export function Composer({ incident, data, ref, onSend, onAddNote }: ComposerProps) {
  const [note, setNote] = useState('')
  const [reply, setReply] = useState(incident.replyTemplate ?? '')
  const [excludedIds, setExcludedIds] = useState<string[]>([])
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const [focusRequest, setFocusRequest] = useState(0)

  const noteRef = useRef<HTMLTextAreaElement>(null)
  const noteId = useId()
  const replyId = useId()

  useImperativeHandle(ref, () => ({
    focusNote: (prefill: string) => {
      setNote((current) => (current.trim() ? current : prefill))
      setFocusRequest((count) => count + 1)
    },
  }))

  // Focus after the prefill renders, with the cursor at the end so the agent keeps typing.
  useEffect(() => {
    const field = noteRef.current
    if (focusRequest === 0 || !field) return
    field.focus()
    field.setSelectionRange(field.value.length, field.value.length)
  }, [focusRequest])

  function handleSend() {
    onSend?.({ contactIds: selectedIds, reply, note })
    setNote('')
    setExcludedIds([])
    setConfirmation(`Sent to ${pluralize(selectedIds.length, 'contact')} (simulated) · logged to timeline`)
  }

  function handleAddNote() {
    onAddNote?.(note)
    setNote('')
    setConfirmation('Note added to timeline')
  }

  function toggleRecipient(contactId: string) {
    setExcludedIds((current) =>
      current.includes(contactId) ? current.filter((id) => id !== contactId) : [...current, contactId],
    )
  }

  const route = getRoute(data, incident.routeId)
  const recipients = getIncidentContacts(data, incident).filter((contact) => !contact.answered)
  const selectedIds = recipients.filter((contact) => !excludedIds.includes(contact.id)).map((contact) => contact.id)
  const canSend = Boolean(onSend) && selectedIds.length > 0 && reply.trim() !== ''
  const sendLabel =
    recipients.length > 0 ? `Send to ${pluralize(selectedIds.length, 'contact')} (simulated)` : 'Send (simulated)'

  return (
    <div className="flex flex-col gap-2.5 border-t bg-card px-5 pt-3 pb-3.5">
      <div className="flex items-start gap-2.5">
        <label htmlFor={noteId} className="w-18.5 shrink-0 pt-1.75 text-xs font-semibold text-soft-foreground">
          Internal note
        </label>
        <Textarea
          id={noteId}
          ref={noteRef}
          rows={1}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="What happened?"
          className="min-h-8.5 resize-none bg-surface-subtle px-2.5 py-1.75 text-sm focus-visible:bg-card md:text-sm"
        />
      </div>

      <div className="flex items-start gap-2.5">
        <label htmlFor={replyId} className="w-18.5 shrink-0 pt-1.25 text-xs font-semibold text-soft-foreground">
          Reply to
        </label>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {recipients.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {recipients.map((contact) => (
                <RecipientChip
                  key={contact.id}
                  name={contact.senderName ?? contact.phone}
                  detail={getStopLabel(route, contact.linkedStopId) ?? getSourceLabel(contact.sourceRole)}
                  selected={!excludedIds.includes(contact.id)}
                  onToggle={() => toggleRecipient(contact.id)}
                />
              ))}
            </div>
          ) : (
            <p className="pt-1.25 text-xs text-muted-foreground">All contacts answered.</p>
          )}
          <Textarea
            id={replyId}
            rows={2}
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            className="min-h-0 resize-none bg-surface-subtle px-2.5 py-2 text-sm leading-normal focus-visible:bg-card md:text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5 pl-21">
        {confirmation ? (
          <p role="status" className="inline-flex items-center gap-1.5 text-xs font-medium">
            <Check aria-hidden className="size-3.5" />
            {confirmation}
          </p>
        ) : (
          <p className="text-xs text-soft-foreground">Note is internal. Reply goes out by SMS.</p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="md" onClick={handleAddNote} disabled={!onAddNote || !note.trim()}>
            Add note
          </Button>
          <Button size="md" onClick={handleSend} disabled={!canSend} className="font-semibold">
            {sendLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
