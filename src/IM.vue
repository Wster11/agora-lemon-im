<template>
  <div id="im">
    <div class="imui-center">
      <lemon-imui
        :user="user"
        ref="IMUI"
        :contextmenu="contextmenu"
        :contact-contextmenu="contactContextmenu"
        :theme="theme"
        :hide-menu="hideMenu"
        :hide-menu-avatar="hideMenuAvatar"
        :hide-message-name="hideMessageName"
        :hide-message-time="hideMessageTime"
        @change-menu="handleChangeMenu"
        @change-contact="handleChangeContact"
        @pull-messages="handlePullMessages"
        @message-click="handleMessageClick"
        @menu-avatar-click="handleMenuAvatarClick"
        @send="handleSend"
      >
        <template #cover>
          <div class="cover">
            <i class="lemon-icon-message"></i>
            <p><b> Easemob</b> Chat</p>
          </div>
        </template>
        <template #sidebar-contact-fixedtop>
          <div class="sidebar-input-wrap">
            <Search placeholder="搜索" size="small" />
            <Icon
              type="user-add"
              @click="showAddFriend"
              :style="{
                fontSize: '16px',
                marginLeft: '10px',
                cursor: 'pointer'
              }"
            />
          </div>
        </template>
        <template #message-title="contact">
          <span>{{ contact.displayName }}</span>
          <small
            v-if="contact.isGroup"
            @click="changeDrawer(contact, $refs.IMUI)"
            ><Icon class="more" type="ellipsis" :style="{ fontSize: '16px' }"
          /></small>
          <br />
        </template>
      </lemon-imui>
      <Setting
        ref="setting"
        :user="user"
        @onThemeChange="
          () => {
            this.changeTheme();
          }
        "
        @updateProfile="updateProfile"
        @logout="
          () => {
            this.$emit('logout');
          }
        "
      />
      <AddFriend :IMUI="this.$refs.IMUI" ref="addFriend" />
      <!-- <div class="action">
        <lemon-button @click="changeMenuVisible">切换导航显示</lemon-button>
        <lemon-button @click="changeMessageNameVisible"
          >切换聊天窗口内名字显示</lemon-button
        >
        <lemon-button @click="changeMessageTimeVisible"
          >切换聊天窗口内时间显示</lemon-button
        >
      </div> -->
    </div>
  </div>
</template>
<script>
import packageData from '../package.json'
import EmojiData from './database/emoji'
import { Icon, Modal, Input, Divider } from 'ant-design-vue'
import Setting from './components/setting'
import AddFriend from './components/addFriend.vue'
import {
  formatConversation,
  formatContact,
  formatGroup,
  getTime,
  generateRandId,
  generateMessage,
  getConversationsInfo,
  uniqueFunc,
  formatImFile
} from './utils/index'
import websdk from 'easemob-websdk'
import { CHAT_TYPE } from './consts'
export default {
  name: 'app',
  components: {
    Icon,
    Setting,
    Search: Input.Search,
    AddFriend,
    Divider
  },
  data () {
    return {
      historyMessageCursor: {},
      theme: 'default',
      currentGroupInfo: {},
      contactContextmenu: [
        {
          text: '删除该聊天',
          click: (e, instance, hide) => {
            const { IMUI, contact } = instance
            this.$EIM
              .deleteConversation({
                channel: contact.id,
                chatType: contact.chatType,
                deleteRoam: true
              })
              .then(() => {
                IMUI.updateContact({
                  id: contact.id,
                  lastContent: null
                })
                if (IMUI.currentContactId === contact.id) {
                  IMUI.changeContact(null)
                }
                hide()
              })
          }
        },
        {
          visible: instance => {
            return instance.contact.chatType === 'singleChat'
          },
          click: (e, instance, hide) => {
            const { IMUI, contact } = instance
            console.log(contact, 'contact')
            this.$EIM.deleteContact(contact.id)
            IMUI.removeContact(contact.id)
            if (IMUI.currentContactId === contact.id) IMUI.changeContact(null)
            this.$EIM.deleteConversation({
              channel: contact.id,
              chatType: contact.chatType,
              deleteRoam: true
            })
            hide()
          },
          color: 'red',
          text: '删除好友'
        }
      ],
      contextmenu: [
        {
          click: (e, instance, hide) => {
            const { IMUI, message } = instance
            const data = {
              id: generateRandId(),
              type: 'event',
              // 使用 jsx 时 click必须使用箭头函数（使上下文停留在vue内）
              content: (
                <div>
                  <span>
                    你撤回了一条消息{' '}
                    <span
                      v-show={message.type === 'text'}
                      style="color:#333;cursor:pointer"
                      content={message.content}
                      on-click={e => {
                        IMUI.setEditorValue(e.target.getAttribute('content'))
                      }}
                    >
                      重新编辑
                    </span>
                  </span>
                </div>
              ),

              toContactId: message.toContactId,
              sendTime: getTime()
            }
            let currentContact = IMUI.getCurrentContact()
            this.$EIM
              .recallMessage({
                mid: message.id,
                to: message.toContactId,
                chatType: currentContact.chatType
              })
              .then(() => {
                IMUI.removeMessage(message.id)
                IMUI.appendMessage(data, true)
              })
              .catch(e => {
                if (e.message === 'exceed recall time limit') {
                  this.$message.error('已超过撤回时间')
                }
              })
            hide()
          },
          visible: instance => {
            return instance.message.fromUser.id === this.user.id
          },
          text: '撤回消息'
        },
        {
          visible: instance => {
            return instance.message.fromUser.id !== this.user.id
          },
          text: '举报'
        },
        {
          text: '转发'
        },
        {
          click: (e, instance, hide) => {
            const { message } = instance
            this.$copyText(message.content)
          },
          visible: instance => {
            return instance.message.type === 'text'
          },
          text: '复制文字'
        },
        {
          visible: instance => {
            return instance.message.type === 'image'
          },
          click: (e, instance, hide) => {
            window.open(instance.message.content)
            hide()
          },
          text: '下载图片'
        },
        {
          visible: instance => {
            return instance.message.type === 'file'
          },
          click: (e, instance, hide) => {
            window.open(instance.message.content)
            hide()
          },
          text: '下载文件'
        },
        {
          click: (e, instance, hide) => {
            const { IMUI, message } = instance
            let currentContact = IMUI.getCurrentContact()
            if (message.status === 'succeed') {
              this.$EIM.removeHistoryMessages({
                targetId: message.toContactId,
                chatType: currentContact.chatType,
                messageIds: [message.id]
              })
            }
            IMUI.removeMessage(message.id)
            hide()
          },
          color: 'red',
          text: '删除'
        }
      ],
      packageData,
      hideMenuAvatar: false,
      hideMenu: false,
      hideMessageName: false,
      hideMessageTime: true,
      user: {}
    }
  },
  mounted () {
    this.initIMEvent()
    this.initIM()
    const { IMUI } = this.$refs
    IMUI.setLastContentRender('event', message => {
      return `[自定义通知内容]`
    })

    IMUI.initMenus([
      {
        name: 'messages'
      },
      {
        name: 'contacts'
      },
      {
        name: 'custom1',
        title: '自定义按钮1',
        unread: 0,
        render: menu => {
          return <i class="lemon-icon-attah" />
        },
        renderContainer: () => {
          return (
            <div class="article">
              <ul>
                <li class="article-item">
                  <h2>人民日报谈网红带货：产品真的值得买吗？</h2>
                </li>
                <li class="article-item">
                  甘肃夏河县发生5.7级地震 暂未接到人员伤亡报告
                </li>
                <li class="article-item">
                  北方多地风力仍强沙尘相伴,东北内蒙古等地迎雨雪
                </li>
                <li class="article-item">
                  英货车案：越南警方采集疑死者家属DNA作比对
                </li>
                <li class="article-item">
                  知名连锁咖啡店的蛋糕吃出活虫 曝光内幕太震惊
                </li>
              </ul>
            </div>
          )
        },
        isBottom: true
      },
      {
        name: 'setting',
        title: '设置',
        click: () => {
          this.$refs.setting.showModal()
        },
        render: menu => {
          return <icon type="setting" />
        },
        isBottom: true
      }
    ])

    IMUI.initEditorTools([
      {
        name: 'emoji'
      },
      {
        name: 'uploadFile'
      },
      {
        name: 'uploadImage'
      }
    ])
    IMUI.initEmoji(EmojiData)

    IMUI.setLastContentRender('voice', message => {
      return <span>[语音]</span>
    })
  },
  methods: {
    // 添加好友
    showAddFriend () {
      this.$refs.addFriend.showModal()
    },
    initIMEvent () {
      this.$EIM.addEventHandler('messageEvent', {
        onTextMessage: msg => {
          let current = this.$refs.IMUI.findContact(msg.from) || {}
          let isGroup = msg.chatType === CHAT_TYPE.groupChat
          let msgFrom = {
            id: msg.from,
            displayName: current.displayName || msg.from,
            avatar: current.avatar || ''
          }

          let lemonMsg = generateMessage(
            isGroup ? msg.to : msg.from === this.$EIM.user ? msg.to : msg.from,
            msgFrom,
            msg
          )
          this.$refs.IMUI.appendMessage(lemonMsg)
        },
        onImageMessage: msg => {
          let current = this.$refs.IMUI.findContact(msg.from) || {}
          let isGroup = msg.chatType === CHAT_TYPE.groupChat
          let msgFrom = {
            id: msg.from,
            displayName: current.displayName || msg.from,
            avatar: current.avatar || ''
          }

          let lemonMsg = generateMessage(
            isGroup ? msg.to : msg.from === this.$EIM.user ? msg.to : msg.from,
            msgFrom,
            msg
          )
          this.$refs.IMUI.appendMessage(lemonMsg)
        },
        onFileMessage: msg => {
          let current = this.$refs.IMUI.findContact(msg.from) || {}
          let isGroup = msg.chatType === CHAT_TYPE.groupChat
          let msgFrom = {
            id: msg.from,
            displayName: current.displayName || msg.from,
            avatar: current.avatar || ''
          }

          let lemonMsg = generateMessage(
            isGroup ? msg.to : msg.from === this.$EIM.user ? msg.to : msg.from,
            msgFrom,
            msg
          )
          this.$refs.IMUI.appendMessage(lemonMsg)
        },
        onRecallMessage: msg => {
          const data = {
            id: generateRandId(),
            type: 'event',
            // 使用 jsx 时 click必须使用箭头函数（使上下文停留在vue内）
            content: (
              <div>
                <span>{msg.from}撤回了一条消息</span>
              </div>
            ),
            toContactId: msg.to,
            sendTime: getTime()
          }
          this.$refs.IMUI.removeMessage(msg.mid)
          this.$refs.IMUI.appendMessage(data, true)
        }
      })

      this.$EIM.addEventHandler('contactEvent', {
        onContactInvited: msg => {
          // 收到好友邀请
          Modal.confirm({
            title: `${msg.from}请求添加您为好友`,
            content: msg.status,
            okText: '接受',
            cancelText: '拒绝',
            onOk: async () => {
              this.$EIM.acceptContactInvite(msg.from)
              let fromContact = await getConversationsInfo([
                formatContact(msg.from)
              ])
              this.$refs.IMUI.initContacts([
                ...this.$refs.IMUI.contacts,
                ...fromContact
              ])
            },
            onCancel: () => {
              this.$EIM.declineInvitation(msg.from)
            }
          })
        },
        onContactAgreed: async msg => {
          const { from } = msg
          let fromContact = await getConversationsInfo([formatContact(from)])
          this.$refs.IMUI.initContacts([
            ...this.$refs.IMUI.getContacts(),
            ...fromContact
          ])
          this.$message.success(`${from}已同意您的好友请求`)
        },
        onContactRefuse: msg => {
          this.$message.info(`${msg.from}拒绝了您的好友请求`)
        }
      })
    },
    initIM () {
      let id = this.$EIM.user
      this.$EIM.fetchUserInfoById(id).then(res => {
        this.user = {
          id,
          displayName: res.data[id].nickname,
          avatar: res.data[id].avatarurl
        }
      })
      this.getConversationList()
    },
    async getConversationList () {
      const { IMUI } = this.$refs
      let res = await this.$EIM.getConversationlist()
      let conversation = await Promise.all(
        res.data &&
          res.data.channel_infos.map(async item => {
            let dt = await formatConversation(item)
            return dt
          })
      )

      let contactsRes = await this.$EIM.getContacts()
      let contacts = contactsRes.data.map(item => {
        return formatContact(item)
      })

      let groupRes = await this.$EIM.getJoinedGroups({
        pageNum: 0,
        pageSize: 100
      })
      let groups = groupRes.data.map(item => {
        return formatGroup(item.groupid)
      })

      let uniqueConversations = uniqueFunc(
        [...conversation, ...contacts, ...groups],
        'id'
      )

      IMUI.initContacts(uniqueConversations)
      IMUI.initContacts(await getConversationsInfo(uniqueConversations))
    },

    changeTheme () {
      this.theme = this.theme === 'default' ? 'blue' : 'default'
      localStorage.setItem('theme', this.theme)
    },
    scrollToTop () {
      document.body.scrollIntoView()
    },
    handleMenuAvatarClick () {
      console.log('Event:menu-avatar-click')
    },
    handleMessageClick (e, key, message, instance) {
      console.log('点击了消息', e, key, message)

      if (key === 'status') {
        instance.updateMessage({
          id: message.id,
          status: 'going'
        })
        this.$EIM
          .send(message.failedMsg)
          .then(() => {
            instance.updateMessage({
              id: message.id,
              status: 'succeed'
            })
          })
          .catch(() => {
            instance.updateMessage({
              id: message.id,
              status: 'failed'
            })
          })
      }
    },
    changeMenuAvatarVisible () {
      this.hideMenuAvatar = !this.hideMenuAvatar
    },
    changeMenuVisible () {
      this.hideMenu = !this.hideMenu
    },
    changeMessageNameVisible () {
      this.hideMessageName = !this.hideMessageName
    },
    changeMessageTimeVisible () {
      this.hideMessageTime = !this.hideMessageTime
    },

    appendEventMessage () {
      const { IMUI } = this.$refs
      const message = {
        id: generateRandId(),
        type: 'event',
        content: (
          <span>
            邀请你加入群聊{' '}
            <span
              style="color:#333;cursor:pointer"
              on-click={() => alert('OK')}
            >
              接受
            </span>
          </span>
        ),
        toContactId: 'contact-3',
        sendTime: getTime()
      }
      IMUI.appendMessage(message, true)
    },
    changeDrawer (contact, instance) {
      instance.changeDrawer({
        offsetY: 53,
        height: 523,
        position: 'rightInside',
        render: () => {
          if (!this.$refs.IMUI.drawerVisible) return false
          let members = this.currentGroupInfo.affiliations.map(item => {
            return {
              id: item.member || item.owner,
              isAdmin: !!item.owner
            }
          })
          return (
            <div class="drawer-content">
              <br />
              <div class="group-member-info-wrap">
                {members.map(item => {
                  let contactInfo = this.$refs.IMUI.findContact(item.id)
                  let src = ''
                  let displayName = ''
                  if (contactInfo) {
                    src = contactInfo.avatar
                    displayName = contactInfo.displayName
                  } else {
                    let memberInfo = this.currentGroupInfo.groupMembersInfo.find(
                      member => member.id === item.id
                    )
                    src = memberInfo.avatar
                    displayName = memberInfo.displayName
                  }
                  return (
                    <div class="member-item-wrap">
                      <lemon-avatar src={src}></lemon-avatar>
                      <div class="member-name">{displayName}</div>
                    </div>
                  )
                })}
              </div>
              <Divider />
              <p> 群组名称：</p>
              <p>{this.currentGroupInfo.name}</p>
              <Divider />
              <p> 群组详情：</p>
              <p>{this.currentGroupInfo.description}</p>
            </div>
          )
        }
      })
    },
    handleChangeContact (contact, instance) {
      console.log('Event:change-contact')
      instance.updateContact({
        id: contact.id,
        unread: 0
      })
      if (contact.isGroup) {
        this.$EIM
          .getGroupInfo({
            groupId: contact.id
          })
          .then(res => {
            this.currentGroupInfo = res.data[0]
            let contacts = this.$refs.IMUI.getContacts()
            let contactIds = contacts.map(item => item.id)
            let memberIds = this.currentGroupInfo.affiliations.map(
              item => item.member || item.owner
            )
            let noContactsIds = memberIds.filter(id => {
              return !contactIds.includes(id)
            })

            getConversationsInfo(
              noContactsIds.map(id => {
                return formatContact(id)
              })
            ).then(res => {
              this.$set(this.currentGroupInfo, 'groupMembersInfo', res)
            })
          })
      }
      instance.closeDrawer()
    },
    handleSend (message, next, file) {
      const { IMUI } = this.$refs
      let toContact = IMUI.getCurrentContact()
      let msg
      switch (message.type) {
        case 'text':
          msg = {
            chatType: toContact.chatType,
            type: 'txt',
            to: message.toContactId,
            msg: message.content
          }
          break
        case 'image':
          msg = {
            chatType: toContact.chatType,
            type: 'img',
            to: message.toContactId,
            file: formatImFile(file),
            onFileUploadError: function () {
              // 消息上传失败
              console.log('onFileUploadError')
            },
            onFileUploadProgress: function (progress) {
              // 上传进度的回调
              console.log(progress)
            },
            onFileUploadComplete: function () {
              // 消息上传成功
              console.log('onFileUploadComplete')
            }
          }
          break
        case 'file':
          console.log(file, 'file', message)
          msg = {
            chatType: toContact.chatType,
            type: 'file',
            to: message.toContactId,
            file: formatImFile(file),
            onFileUploadError: function () {
              // 消息上传失败
              console.log('onFileUploadError')
            },
            onFileUploadProgress: function (progress) {
              // 上传进度的回调
              console.log(progress)
            },
            onFileUploadComplete: function () {
              // 消息上传成功
              console.log('onFileUploadComplete')
            }
          }
          break
        default:
          break
      }
      let sdkMsg = websdk.message.create(msg)
      this.$EIM
        .send(sdkMsg)
        .then(res => {
          message.id = res.serverMsgId
          next()
        })
        .catch(() => {
          message.failedMsg = sdkMsg
          next({ status: 'failed' })
        })
    },
    handlePullMessages (contact, next, instance) {
      next()
      if (contact.id) {
        let cursor = this.historyMessageCursor[contact.id]
        if (cursor !== false) {
          this.$EIM
            .getHistoryMessages({
              chatType: contact.chatType,
              targetId: contact.id,
              pageSize: 20,
              cursor
            })
            .then(res => {
              this.$set(
                this.historyMessageCursor,
                contact.id,
                res.cursor || false
              )
              let msgs = res.messages
                .map(msg => {
                  let current =
                    msg.from === this.user.id
                      ? this.user
                      : instance.findContact(msg.from) || {}
                  let msgFrom = {
                    id: msg.from,
                    displayName: current.displayName || msg.from,
                    avatar: current.avatar || ''
                  }
                  return generateMessage(
                    instance.currentContactId,
                    msgFrom,
                    msg
                  )
                })
                .reverse()
              let isEnd = false
              if (msgs.length < 20) {
                isEnd = true
              }
              if (!res.cursor) {
                isEnd = true
              }

              next(msgs, isEnd)
            })
        }
      }
    },
    handleChangeMenu () {
      console.log('Event:change-menu')
    },
    openCustomContainer () {},
    updateProfile (dt) {
      const { nickname, avatarurl } = dt
      this.$refs.IMUI.updateContact({
        id: this.user.id,
        displayName: nickname,
        avatar: avatarurl
      })
      this.user = {
        id: this.user.id,
        displayName: nickname,
        avatar: avatarurl
      }
    }
  }
}
</script>

<style lang="stylus">
.lemon-editor__emoji-item {
  width 30px!important;
  padding 4px!important;
}

.lemon-message-text .lemon-message__content img {
  padding 2px;
  width 20px;
  height 20px;
}
::selection{background:#000;color:#fff;}
body
  font-family "Microsoft YaHei"
  background #f6f6f6 !important
#im
  padding-bottom 100px
  .scroll-top
    cursor pointer
    position fixed
    bottom 40px
    left 50%
    border-radius 50%
    background #fff
    font-size 18px
    overflow hidden
    width 40px
    height 40px
    line-height 40px
    user-select none
    text-align center
    transform rotate(-45deg) translateX(-50%)
    box-shadow 0 0 30px rgba(0,0,0,0.1);
    &:hover
      font-size 22px
a
  color #0c5ed9
  text-decoration none
  font-size 12px
.action
  margin-top 20px
  .lemon-button
    margin-right 10px
    margin-bottom 10px
.link
  font-size 14px
  margin-top 15px
  a
    display inline-block
    margin 0 5px
    text-decoration none
    background #ffba00
    border-radius 4px
    padding 5px 10px
    color rgba(0,0,0,0.8)
.logo
  position relative
  display inline-block
  margin 60px auto
  user-select none
.logo-text
  font-size 38px
.logo-sub
  font-size 18px
  color #999
  font-weight 300
.logo-badge
  position absolute
  top -10px
  left 230px
  background #000
  border-radius 16px
  color #f9f9f9
  font-size 12px
  padding 4px 8px
.title
  font-size 24px
  line-height 26px
  border-left 1px solid #ffba00
  padding-left 15px
  margin-bottom 15px
  margin-top 30px
  user-select none
.table
  width 100%
  border-radius 10px
  background #fff
  border-collapse collapse
  tr
    cursor pointer
  tr:not(.table-head):hover
    background #ffba00 !important
  tr:nth-of-type(even)
    background #f9f9f9
  th
    user-select none
    color #999
  td,
  th
    text-align left
    padding 10px 15px
    font-size 14px
    font-weight normal
.imui-center
  margin-bottom 60px
  .lemon-wrapper
    border:1px solid #ddd;
    margin: 0 auto;
  .lemon-drawer
    border-left:0;
    background: #fff
.drawer-content
  padding 15px
.more
  font-size 12px
  line-height 24px
  height 24px
  position absolute
  top 14px
  right 14px
  cursor pointer
  user-select none
  color #191919
  display inline-block
  &:active
    color: darkgray
.bar
  text-align center
  line-height 30px
  background #fff
  margin 15px
  color #666
  user-select none
  font-size 12px
.cover
  text-align center
  user-select none
  position absolute
  top 50%
  left 50%
  transform translate(-50%,-50%)
  i
    font-size 84px
    color #e6e6e6
  p
    font-size 18px
    color #ddd
    line-height 50px
.article-item
  line-height 34px
  cursor pointer
  &:hover
    text-decoration underline
    color #318efd
pre
  background #fff
  border-radius 8px
  padding 15px
.lemon-simple .lemon-container{
  z-index:5
}
.lemon-simple .lemon-drawer{
  z-index:4
}
.sidebar-input-wrap {
  display: flex
  align-items: center
  padding: 10px
}
.lemon-container__title {
  border-bottom: 1px solid #e0e0e0
}
.group-member-info-wrap {
  display flex
  flex-flow: row wrap;
}

.member-item-wrap {
  text-align: center
  margin: 0 10px 10px 10px
}

.member-name{
  margin-top: 6px
  max-width: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
