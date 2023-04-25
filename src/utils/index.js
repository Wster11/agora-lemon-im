import { CHAT_TYPE } from '../consts'
/**
 * sdk接口获取的会话对象
 * @param {object} eimConversation
 */
const formatConversation = async eimConversation => {
  const {
    unread_num: unReadCount,
    lastMessage,
    channel_id: channelId
  } = eimConversation
  lastMessage.chatType = eimConversation.chatType =
    channelId.indexOf('@conference.easemob.com') > -1
      ? CHAT_TYPE.groupChat
      : CHAT_TYPE.singleChat
  const isGroup = eimConversation.chatType === CHAT_TYPE.groupChat
  const id = getConversationIdByChannelId(channelId)
  let { avatar, displayName } = await getConversationInfo({
    id,
    chatType: eimConversation.chatType
  })

  return {
    id,
    displayName,
    avatar,
    isGroup,
    index: isGroup ? '我的群组' : '单聊',
    chatType: eimConversation.chatType,
    unread: unReadCount,
    lastSendTime: lastMessage.time,
    lastContent: formatLastContent(lastMessage)
  }
}

/**
 * sdk接口获取的联系人id
 * @param {string} id
 */
const formatContact = async id => {
  let { avatar, displayName } = await getConversationInfo({
    id,
    chatType: CHAT_TYPE.singleChat
  })
  return {
    id,
    displayName,
    avatar,
    isGroup: false,
    index: '单聊',
    chatType: CHAT_TYPE.singleChat,
    unread: 0,
    lastSendTime: 0,
    lastContent: ''
  }
}

/**
 * sdk接口获取的群组id
 * @param {string} id
 */
const formatGroup = async id => {
  let { avatar, displayName } = await getConversationInfo({
    id,
    chatType: CHAT_TYPE.groupChat
  })
  return {
    id,
    displayName,
    avatar,
    isGroup: false,
    index: '我的群组',
    chatType: CHAT_TYPE.groupChat,
    unread: 0,
    lastSendTime: 0,
    lastContent: ''
  }
}

/**
 * 获取会话信息
 */
const getConversationInfo = async conversation => {
  let conn = window.EIM
  if (conversation.chatType === CHAT_TYPE.singleChat) {
    let res = await conn.fetchUserInfoById(conversation.id)
    return {
      displayName: res.data[conversation.id].nickname || conversation.id,
      avatar: res.data[conversation.id].avatarurl
    }
  } else if (conversation.chatType === CHAT_TYPE.groupChat) {
    let res = await conn.getGroupInfo({ groupId: conversation.id })
    return {
      displayName: res.data[0].name
    }
  }
}

/**
 * 根据channelId获取会话Id
 */
function getConversationIdByChannelId (id) {
  if (typeof id !== 'string') return ''
  return (
    id.match(/sdk111_(\S*)@|sdk111_(\S*)/)[1] ||
    id.match(/sdk111_(\S*)@|sdk111_(\S*)/)[2]
  )
}

/**
 * 格式化会话列表最后一条消息展示
 */

function formatLastContent (message) {
  let lastContent = ''
  switch (message.type) {
    case 'txt':
      lastContent = message.msg
      break
    default:
      lastContent = `[${message.type}]`
      break
  }
  return lastContent
}

const getTime = () => {
  return new Date().getTime()
}
const generateRandId = () => {
  return Math.random()
    .toString(36)
    .substr(-8)
}
const generateRandWord = () => {
  return Math.random()
    .toString(36)
    .substr(2)
}
const generateMessage = (toContactId = '', fromUser, msgInfo) => {
  const { id, time, msg } = msgInfo
  return {
    id: id,
    status: 'succeed',
    type: 'text',
    sendTime: time,
    content: msg,
    toContactId,
    fromUser
  }
}

function uniqueFunc (arr, uniId) {
  const res = new Map()
  return arr.filter(item => !res.has(item[uniId]) && res.set(item[uniId], 1))
}

export {
  formatConversation,
  formatContact,
  formatGroup,
  getConversationInfo,
  getConversationIdByChannelId,
  uniqueFunc,
  getTime,
  generateRandId,
  generateRandWord,
  generateMessage
}
