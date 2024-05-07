import websdk from 'agora-chat'
import { APPKEY } from './consts'

// eslint-disable-next-line new-cap
const conn = new websdk.connection({
  appKey: APPKEY
})

window.EIM = conn

export default conn
