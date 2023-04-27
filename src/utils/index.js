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

  return {
    id,
    isGroup,
    index: isGroup ? '我的群组' : '单聊',
    chatType: eimConversation.chatType,
    displayName: id,
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
  return {
    id,
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
  return {
    id,
    isGroup: false,
    index: '我的群组',
    chatType: CHAT_TYPE.groupChat,
    unread: 0,
    lastSendTime: 0,
    lastContent: ''
  }
}

/**
 * 批量获取用户属性
 */

const getUsersInfo = async conversations => {
  let conn = window.EIM
  let res =
    (await conn.fetchUserInfoById(
      conversations.map(item => {
        return item.id
      })
    )) || {}
  return res.data
}

/**
 * 批量获取群组信息
 */

const getGroupsInfo = async conversations => {
  let conn = window.EIM
  let res =
    (await conn.getGroupInfo({
      groupId: conversations.map(item => {
        return item.id
      })
    })) || {}
  return res.data
}

/**
 * 获取会话列表
 */
const getConversationsInfo = async conversations => {
  let userList = conversations.filter(item => {
    return !item.isGroup
  })

  let groupList = conversations.filter(item => {
    return item.isGroup
  })
  let userInfos = await getUsersInfo(userList)
  let grousInfo = await getGroupsInfo(groupList)

  userList.forEach(item => {
    let info = userInfos[item.id] || {}
    item.displayName = info.nickname || item.id
    item.avatar = info.avatarurl || ''
  })

  groupList.forEach(groupItem => {
    let info = grousInfo.find(item => {
      return groupItem.id === item.id
    })
    groupItem.displayName = info.name || groupItem.id
    groupItem.avatar = info.avatarurl || ''
  })

  return [...userList, ...groupList]
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
  let lemonMsg
  lemonMsg = {
    id: id,
    status: 'succeed',
    type: 'text',
    sendTime: time,
    content: msg || msgInfo.type,
    toContactId,
    fromUser
  }
  switch (msgInfo.type) {
    case 'txt':
      lemonMsg = {
        ...lemonMsg,
        type: 'text',
        content: msg
      }
      break
    case 'img':
      lemonMsg = {
        ...lemonMsg,
        type: 'image',
        content: msgInfo.thumb || msgInfo.url
      }
      break

    default:
      lemonMsg = {
        ...lemonMsg,
        type: 'text',
        content: `[${msgInfo.type}]`
      }
      break
  }
  return lemonMsg
}

function uniqueFunc (arr, uniId) {
  const res = new Map()
  return arr.filter(item => !res.has(item[uniId]) && res.set(item[uniId], 1))
}

// 格式化file文件
const formatImFile = file => {
  return {
    filename: file.name,
    filetype: file.type.split('/')[1],
    data: file
  }
}

export {
  formatConversation,
  getUsersInfo,
  formatContact,
  formatGroup,
  getGroupsInfo,
  getConversationIdByChannelId,
  getConversationsInfo,
  uniqueFunc,
  getTime,
  generateRandId,
  generateRandWord,
  generateMessage,
  formatImFile
}
