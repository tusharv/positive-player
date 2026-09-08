import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RemoteConnection, remoteErrors, type ConnectionStatus } from '../lib/remoteConnection'
import { isCommand, type TvSnapshot } from '../lib/remoteProtocol'
import { useTvStore } from '../stores/tv'

export function useTvRemote() {
  const tv = useTvStore()
  const status = ref<ConnectionStatus>('idle')
  const paired = ref(false)
  const remoteOnline = ref(false)
  const code = ref('')
  const invite = ref('')
  const expiresAt = ref(0)
  const error = ref('')
  const snapshot = computed<TvSnapshot>(() => ({
    poweredOn: tv.poweredOn,
    channelNumber: tv.channelNumber,
    volume: tv.volume.volume,
    muted: tv.volume.muted,
    interruption: tv.interruption,
  }))
  const connection = new RemoteConnection('host', {
    status: (next) => {
      status.value = next
      if (next !== 'connected') remoteOnline.value = false
    },
    message: (message) => {
      if (message.type === 'session') {
        code.value = typeof message.code === 'string' ? message.code : ''
        invite.value = typeof message.invite === 'string' ? message.invite : ''
        expiresAt.value = Number(message.expiresAt) || 0
        error.value = ''
        connection.send({ type: 'state', state: snapshot.value })
      }
      if (message.type === 'presence') {
        paired.value = message.paired === true
        remoteOnline.value = message.remoteOnline === true
        if (paired.value) {
          invite.value = ''
          code.value = ''
        }
      }
      if (message.type === 'command' && isCommand(message.command) && tv.poweredOn) {
        const command = message.command
        switch (command.action) {
          case 'channelStep':
            tv.channelStep(command.value)
            break
          case 'volumeStep':
            tv.volumeStep(command.value)
            break
          case 'digit':
            tv.typeDigit(command.value)
            break
          case 'mute':
            tv.muteToggle()
            break
        }
      }
      if (message.type === 'ended' || message.type === 'error') {
        error.value =
          message.type === 'ended'
            ? 'Remote disconnected.'
            : (remoteErrors[String(message.code)] ?? 'Unable to connect. Please try again.')
        paired.value = false
        remoteOnline.value = false
        code.value = ''
        invite.value = ''
      }
    },
  })
  watch(snapshot, (state) => connection.send({ type: 'state', state }))
  onMounted(() => {
    if (connection.canResume) connection.start()
  })
  onBeforeUnmount(() => connection.destroy())
  function connect() {
    error.value = ''
    connection.end()
    paired.value = false
    code.value = ''
    invite.value = ''
    connection.start()
  }
  function disconnect() {
    connection.end()
    paired.value = false
    remoteOnline.value = false
    code.value = ''
    invite.value = ''
    error.value = ''
  }
  return { status, paired, remoteOnline, code, invite, expiresAt, error, connect, disconnect }
}
