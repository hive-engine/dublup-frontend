import { Client } from '@hiveio/dhive'

const client = new Client([
  'https://api.hive.blog',
  'https://anyx.io',
  'https://api.openhive.network'
], { failoverThreshold: 0, consoleOnFailover: true })

export * from '@hiveio/dhive'

export const getClient = () => client

export default {
  getClient
}
