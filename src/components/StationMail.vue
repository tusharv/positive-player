<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  ACCESS_BLOCKERS,
  githubIssueUrl,
  parseFeedback,
  type FeedbackField,
  type FeedbackKind,
  type FeedbackNote,
} from '../lib/feedback'

const route = useRoute()

function queryText(key: string, max = 80): string {
  const value = route.query[key]
  const text = Array.isArray(value) ? value[0] : value
  if (typeof text !== 'string') return ''
  return text.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max)
}

const programme = ref(queryText('programme', 120))
const initialKind = route.query.kind
const kind = ref<FeedbackKind | ''>(
  initialKind === 'access' || initialKind === 'channel'
    ? initialKind
    : programme.value
      ? 'channel'
      : '',
)
const blockerQuery = queryText('blocker', 20)
const blocker = ref(ACCESS_BLOCKERS.some((item) => item.id === blockerQuery) ? blockerQuery : '')
const channel = ref(queryText('channel'))
const language = ref('')
const link = ref('')
const place = ref('')
const message = ref('')
const name = ref('')
const email = ref('')
const trap = ref('')
const sending = ref(false)
const error = ref('')
const fieldErrors = ref<Partial<Record<FeedbackField, string>>>({})
const receipt = ref<{ note: FeedbackNote; url?: string } | null>(null)

const draft = computed(() => ({
  kind: kind.value,
  blocker: blocker.value,
  channel: channel.value,
  programme: programme.value,
  language: language.value,
  link: link.value,
  place: place.value,
  message: message.value,
  name: name.value,
  email: email.value,
  pp_leave_blank: trap.value,
  locale: typeof navigator === 'undefined' ? '' : navigator.language,
  timezone: typeof Intl === 'undefined' ? '' : Intl.DateTimeFormat().resolvedOptions().timeZone,
  page: route.path,
}))

const receiptRows = computed(() => {
  const note = receipt.value?.note
  if (!note) return []
  const rows: { label: string; value: string; href?: string }[] = []
  if (note.kind === 'channel' && note.programme) {
    rows.push({ label: 'Channel or programme', value: note.programme })
  }
  if (note.language) rows.push({ label: 'Language', value: note.language })
  if (note.blocker) {
    rows.push({
      label: 'What got in the way',
      value: ACCESS_BLOCKERS.find((item) => item.id === note.blocker)?.label ?? note.blocker,
    })
  }
  if (note.channel) rows.push({ label: 'Channel', value: note.channel })
  if (note.link) rows.push({ label: 'Link', value: note.link, href: note.link })
  if (note.place) rows.push({ label: 'Watching from', value: note.place })
  rows.push({
    label: note.kind === 'channel' ? 'Why this should be on the dial' : 'What happened',
    value: note.message,
  })
  if (note.name) rows.push({ label: 'Name', value: note.name })
  if (note.email) rows.push({ label: 'Email', value: note.email })
  return rows
})

function invalid(field: FeedbackField) {
  return Boolean(fieldErrors.value[field])
}

watch([kind, programme, message, link, email, blocker], () => {
  if (!Object.keys(fieldErrors.value).length) return
  const parsed = parseFeedback(draft.value)
  fieldErrors.value = parsed.ok
    ? {}
    : Object.fromEntries(parsed.fields.map((item) => [item.field, item.message]))
})

function another() {
  receipt.value = null
  error.value = ''
  fieldErrors.value = {}
  message.value = ''
  programme.value = ''
  link.value = ''
  channel.value = ''
}

async function submit() {
  error.value = ''
  const parsed = parseFeedback(draft.value)
  if (!parsed.ok) {
    fieldErrors.value = Object.fromEntries(parsed.fields.map((item) => [item.field, item.message]))
    error.value = parsed.error
    await nextTick()
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }
  fieldErrors.value = {}
  if (parsed.spam) {
    receipt.value = null
    return
  }
  sending.value = true
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(draft.value),
    })
    const payload = (await response.json().catch(() => null)) as {
      error?: string
      url?: string
    } | null
    if (!response.ok) {
      error.value =
        payload?.error || 'The station could not take that note. Try again in a moment.'
      return
    }
    receipt.value = { note: parsed.note, url: githubIssueUrl(payload?.url) }
  } catch {
    error.value = 'The station could not take that note. Check your connection and try again.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <form class="station-mail" novalidate @submit.prevent="submit">
    <div v-if="receipt" class="received" role="status">
      <strong>Thank you for your feedback.</strong>
      <p>The station has your note. Here is what you sent.</p>
      <dl class="receipt">
        <div v-for="row in receiptRows" :key="row.label">
          <dt>{{ row.label }}</dt>
          <dd>
            <a v-if="row.href" :href="row.href" target="_blank" rel="noopener noreferrer">{{
              row.value
            }}</a>
            <template v-else>{{ row.value }}</template>
          </dd>
        </div>
      </dl>
      <a
        v-if="receipt.url"
        class="issue-link"
        :href="receipt.url"
        target="_blank"
        rel="noopener noreferrer"
        >Read your note on GitHub ↗</a>
      <button class="submit" type="button" @click="another">Send another</button>
    </div>
    <template v-else>
      <fieldset class="kinds" :class="{ invalid: invalid('kind') }" :aria-invalid="invalid('kind')">
        <legend>What are you sending?</legend>
        <label class="kind">
          <input v-model="kind" type="radio" name="kind" value="access" required />
          <span>
            <strong>The picture won't come in</strong>
            <small>Playback, a country block, a page that never loads.</small>
          </span>
        </label>
        <label class="kind">
          <input v-model="kind" type="radio" name="kind" value="channel" />
          <span>
            <strong>Request a channel</strong>
            <small>A show, a language, or something you wish was on.</small>
          </span>
        </label>
        <p v-if="fieldErrors.kind" class="field-error">{{ fieldErrors.kind }}</p>
      </fieldset>

      <div v-if="kind" class="fields">
        <label v-if="kind === 'access'" :class="{ invalid: invalid('blocker') }">
          What got in the way
          <select v-model="blocker" :aria-invalid="invalid('blocker')">
            <option value="">Choose one, if you can tell</option>
            <option v-for="item in ACCESS_BLOCKERS" :key="item.id" :value="item.id">
              {{ item.label }}
            </option>
          </select>
          <span v-if="fieldErrors.blocker" class="field-error">{{ fieldErrors.blocker }}</span>
        </label>
        <label v-if="kind === 'access'">
          Channel, if you were on one
          <input v-model="channel" type="text" maxlength="80" autocomplete="off" />
        </label>
        <label v-if="kind === 'channel'" :class="{ invalid: invalid('programme') }">
          <span class="ask">Channel or programme <span class="req">Required</span></span>
          <input
            v-model="programme"
            type="text"
            maxlength="120"
            autocomplete="off"
            required
            :aria-invalid="invalid('programme')"
            :aria-describedby="invalid('programme') ? 'programme-error' : undefined"
          />
          <span v-if="fieldErrors.programme" id="programme-error" class="field-error">{{
            fieldErrors.programme
          }}</span>
        </label>
        <div v-if="kind === 'channel'" class="row">
          <label>
            Language
            <input v-model="language" type="text" maxlength="60" autocomplete="off" />
          </label>
          <label :class="{ invalid: invalid('link') }">
            A link, if you have one
            <input
              v-model="link"
              type="url"
              inputmode="url"
              maxlength="300"
              placeholder="https://"
              autocomplete="off"
              :aria-invalid="invalid('link')"
            />
            <span v-if="fieldErrors.link" class="field-error">{{ fieldErrors.link }}</span>
          </label>
        </div>
        <label v-else :class="{ invalid: invalid('link') }">
          A link, if a certain video failed
          <input
            v-model="link"
            type="url"
            inputmode="url"
            maxlength="300"
            placeholder="https://"
            autocomplete="off"
            :aria-invalid="invalid('link')"
          />
          <span v-if="fieldErrors.link" class="field-error">{{ fieldErrors.link }}</span>
        </label>
        <label>
          Where are you watching from?
          <input
            v-model="place"
            type="text"
            maxlength="80"
            autocomplete="country-name"
            placeholder="Country or city"
          />
        </label>
        <label :class="{ invalid: invalid('message') }">
          <span class="ask">
            {{ kind === 'channel' ? 'Why this should be on the dial' : 'What happened' }}
            <span class="req">Required</span>
          </span>
          <textarea
            v-model="message"
            maxlength="2000"
            required
            rows="5"
            :aria-invalid="invalid('message')"
            :aria-describedby="invalid('message') ? 'message-error' : undefined"
          />
          <span v-if="fieldErrors.message" id="message-error" class="field-error">{{
            fieldErrors.message
          }}</span>
        </label>
        <div class="row">
          <label>
            What should we call you?
            <input v-model="name" type="text" maxlength="80" autocomplete="name" />
          </label>
          <label :class="{ invalid: invalid('email') }">
            Email, if you want a reply
            <input
              v-model="email"
              type="email"
              maxlength="120"
              autocomplete="email"
              :aria-invalid="invalid('email')"
            />
            <span v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
          </label>
        </div>
        <div class="trap" aria-hidden="true">
          <label>
            Leave blank
            <input
              v-model="trap"
              type="text"
              name="pp_leave_blank"
              tabindex="-1"
              autocomplete="off"
            />
          </label>
        </div>
        <p class="fine">
          A channel or programme name and the note are required. Your language, time zone, and the
          page you sent this from are included so a far-away playback problem is easier to place.
          The note is stored as a GitHub issue. If that repository is public, the note is public
          too — leave the email blank if you would rather not have it written down.
        </p>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <button class="submit" type="submit" :disabled="sending">
          {{ sending ? 'Sending…' : 'Send the signal' }}
        </button>
      </div>
      <p v-else class="fine">Pick one. The rest of the card appears after that.</p>
      <a
        class="fallback"
        href="https://github.com/tusharv/positive-player/issues"
        target="_blank"
        rel="noopener noreferrer"
        >Prefer GitHub? Leave a note there ↗</a>
    </template>
  </form>
</template>

<style scoped>
.station-mail {
  position: relative;
  display: grid;
  gap: 16px;
  min-width: 0;
}
.kinds {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 0;
  padding: 0;
  border: 0;
}
legend {
  grid-column: 1 / -1;
  padding: 0;
  font:
    11px/1.6 'IBM Plex Mono',
    monospace;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--blue, #183b9b);
}
.kind {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: start;
  margin: 0;
  padding: 14px;
  background: #fffdf6;
  border: 3px ridge #b9bfd0;
  cursor: pointer;
}
.kind:focus-within {
  outline: 2px solid var(--blue, #183b9b);
  outline-offset: 2px;
}
.kind:has(input:checked) {
  background: var(--blue, #183b9b);
  color: #fffdf5;
  border-style: inset;
}
.kind strong {
  display: block;
  font-size: 16px;
  letter-spacing: -0.03em;
}
.kind small {
  display: block;
  margin-top: 4px;
  color: var(--muted, #586078);
  font-size: 13px;
  line-height: 1.45;
}
.kind:has(input:checked) small {
  color: #e2e8f8;
}
.fields,
.row {
  display: grid;
  gap: 14px;
}
.row {
  grid-template-columns: 1fr 1fr;
}
.fields > label,
.row > label,
.trap label {
  display: grid;
  gap: 6px;
  font:
    11px/1.4 'IBM Plex Mono',
    monospace;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.ask {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}
.req {
  color: #8c2f2f;
}
label.invalid,
.kinds.invalid {
  color: #8c2f2f;
}
label.invalid input,
label.invalid textarea,
label.invalid select {
  border-color: #8c2f2f;
  background: #fff4f2;
  box-shadow: 0 0 0 2px #8c2f2f;
}
.kinds.invalid {
  outline: 2px solid #8c2f2f;
  outline-offset: 4px;
}
.kinds .field-error {
  grid-column: 1 / -1;
}
.field-error {
  color: #8c2f2f;
  font:
    13px/1.4 Arial,
    Helvetica,
    sans-serif;
  letter-spacing: 0;
  text-transform: none;
}
input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 3px inset #f4f1e8;
  background: #fff;
  color: var(--ink, #182645);
  font:
    16px/1.5 Arial,
    Helvetica,
    sans-serif;
  letter-spacing: 0;
  text-transform: none;
}
textarea {
  min-height: 130px;
  resize: vertical;
}
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid var(--blue, #183b9b);
  outline-offset: 2px;
}
.trap {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.fine,
.error,
.received p,
.fallback {
  margin: 0;
  color: var(--muted, #586078);
  font-size: 13px;
  line-height: 1.6;
  letter-spacing: 0;
  text-transform: none;
}
.error {
  color: #8c2f2f;
}
.submit {
  justify-self: start;
  cursor: pointer;
  padding: 14px 20px;
  background: #e5e5e5;
  border: 3px outset #fff;
  box-shadow: 3px 3px 0 #0b225e;
  color: var(--ink, #182645);
  font:
    12px/1.4 'IBM Plex Mono',
    monospace;
}
.submit:hover {
  background: #fffdf5;
}
.submit:active {
  border-style: inset;
  box-shadow: none;
}
.submit:disabled {
  cursor: wait;
  opacity: 0.7;
}
.submit:focus-visible {
  outline: 2px solid var(--blue, #183b9b);
  outline-offset: 3px;
}
.fallback {
  justify-self: start;
  color: var(--blue, #183b9b);
}
.received {
  display: grid;
  gap: 14px;
  min-width: 0;
}
.received strong {
  display: block;
  font-size: clamp(28px, 4vw, 40px);
  letter-spacing: -0.045em;
}
.receipt {
  display: grid;
  gap: 14px;
  margin: 8px 0 4px;
  padding: 18px;
  background: #fffdf6;
  border: 3px ridge #b9bfd0;
}
.receipt dt {
  font:
    11px/1.4 'IBM Plex Mono',
    monospace;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--blue, #183b9b);
}
.receipt dd {
  margin: 4px 0 0;
  color: var(--ink, #182645);
  font:
    16px/1.5 Arial,
    Helvetica,
    sans-serif;
  letter-spacing: 0;
  text-transform: none;
  white-space: pre-wrap;
}
.issue-link {
  justify-self: start;
  color: var(--blue, #183b9b);
  font-size: 15px;
}
@media (max-width: 700px) {
  .kinds,
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
