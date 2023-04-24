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
    unread: unReadCount,
    lastSendTime: lastMessage.time,
    lastContent: formatLastContent(lastMessage)
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
    id.match(/support_(\S*)@|support_(\S*)/)[1] ||
    id.match(/support_(\S*)@|support_(\S*)/)[2]
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

export {
  formatConversation,
  getConversationInfo,
  getConversationIdByChannelId
}
