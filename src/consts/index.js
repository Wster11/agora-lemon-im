const CHAT_TYPE = {
  singleChat: 'singleChat',
  groupChat: 'groupChat'
}

const APPKEY = localStorage.getItem('appkey') || '1100210909041073#demo'

const appName = APPKEY.split('#')[1]

const channelIdRegex = new RegExp(`${appName}_(\\S*)@|${appName}_(\\S*)`) // 使用构造函数创建正则表达式

export { CHAT_TYPE, APPKEY, channelIdRegex }
