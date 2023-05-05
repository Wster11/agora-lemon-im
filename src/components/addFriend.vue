<template>
  <div>
    <Modal
      title="添加好友"
      :visible="visible"
      okText="更新"
      cancelText="取消"
      :footer="null"
      @cancel="handleCancel"
    >
      <Form :form="form">
        <FormItem
          label="Id"
          :label-col="{ span: 3 }"
          :wrapper-col="{ span: 20 }"
        >
          <Search
            @search="onSearch"
            placeholder="请输入用户id"
            v-model="userId"
          />
        </FormItem>
      </Form>
      <div v-if="contact" class="contact-wrap">
        <div>
          <Avatar :size="50" :src="contact.avatar" />
          <span> {{ contact.displayName }}({{ contact.id }})</span>
        </div>
        <Tag color="green" v-if="contact.isContact">已添加</Tag>
        <Icon
          v-else
          @click="add"
          type="plus-circle"
          :style="{ fontSize: '16px', cursor: 'pointer' }"
        />
      </div>
    </Modal>
  </div>
</template>
<script>
import { Modal, Input, Avatar, Button, Form, Icon, Tag } from 'ant-design-vue'
import { formatContact, getConversationsInfo } from '../utils'
export default {
  components: {
    Modal,
    Search: Input.Search,
    Avatar,
    Button,
    Form,
    Icon,
    Tag,
    FormItem: Form.Item
  },
  props: {
    IMUI: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      visible: false,
      userId: '',
      form: this.$form.createForm(this, { name: 'add' }),
      contact: null
    }
  },
  mounted () {},
  methods: {
    async onSearch (value) {
      // 是否是联系人
      let isContact = !!this.IMUI.getContacts().find(item => {
        return item.id === value
      })
      const dt = await getConversationsInfo([formatContact(value)])
      dt[0].isContact = isContact
      this.contact = dt[0]
    },

    add () {
      this.$EIM.addContact(this.userId)
      this.$message.success('已发送好友请求')
    },

    showModal () {
      this.visible = true
    },

    handleCancel (e) {
      this.userId = ''
      this.contact = null
      this.visible = false
    }
  }
}
</script>
<style lang="stylus" scoped>
.contact-wrap {
  display flex
  align-items center
  justify-content space-between
  margin 0 10%
}
</style>
