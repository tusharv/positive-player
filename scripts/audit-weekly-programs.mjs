import { acceptsProgram } from './program-policy.mjs'
import { readFileSync } from 'node:fs'
import { CHANNELS } from '../src/data/channels.ts'
import { auditCatalog } from './weekly-catalog.mjs'

let failures = 0
for (const channel of CHANNELS) {
  const file = new URL(
    `../src/data/programs/${String(channel.number).padStart(3, '0')}.json`,
    import.meta.url,
  )
  const items = JSON.parse(readFileSync(file, 'utf8'))
  const audit = auditCatalog(items)
  const invalid = items.filter(
    (item) =>
      !/^[a-zA-Z0-9_-]{11}$/.test(item.videoId) ||
      !item.title ||
      !acceptsProgram(channel.name, item) ||
      !Number.isInteger(item.durationSeconds) ||
      item.durationSeconds <= 0,
  ).length
  if (!audit.ready || audit.duplicates || invalid) {
    failures++
    console.log(
      `${channel.number} ${channel.name}: ${(audit.seconds / 3600).toFixed(1)} / 168 hours; ${audit.duplicates} duplicates; ${invalid} invalid entries`,
    )
  }
}
console.log(
  `${CHANNELS.length - failures}/${CHANNELS.length} channels meet the 168-hour unique-ID duration requirement.`,
)
if (failures) process.exitCode = 1
