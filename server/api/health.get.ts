import { defineApiHandler } from '../lib'

export default defineApiHandler(async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }
})
