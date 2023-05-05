<template>
  <div>
    <Modal
      title="设置"
      :visible="visible"
      :confirm-loading="confirmLoading"
      okText="更新"
      cancelText="取消"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div class="setting-wrap">
        <div>
          <Avatar :size="50" :src="user.avatar" />
          <span> {{ user.displayName }}({{ user.id }})</span>
        </div>
        <Button size="small" type="danger" @click="logout">退出登录</Button>
      </div>
      <Form :form="form">
        <FormItem
          label="昵称"
          :label-col="{ span: 3 }"
          :wrapper-col="{ span: 20 }"
        >
          <Input placeholder="请输入用户昵称" v-decorator="['nickname']" />
        </FormItem>
        <FormItem
          label="头像"
          :label-col="{ span: 3 }"
          :wrapper-col="{ span: 20 }"
        >
          <Input placeholder="请输入用户头像URL" v-decorator="['avatarurl']" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
<script>
import { Modal, Input, Avatar, Button, Form } from 'ant-design-vue'
export default {
  components: {
    Modal,
    Input,
    Avatar,
    Button,
    Form,
    FormItem: Form.Item
  },
  props: {
    user: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this, { name: 'profile' })
    }
  },
  mounted () {},
  methods: {
    showModal () {
      this.visible = true
      setTimeout(() => {
        this.form.setFieldsValue({
          nickname: this.user.displayName,
          avatarurl: this.user.avatar
        })
      }, 0)
    },
    handleOk (e) {
      this.confirmLoading = true
      let dt = this.form.getFieldsValue()
      this.$EIM.updateUserInfo(dt).then(() => {
        this.visible = false
        this.confirmLoading = false
        this.$message.success('个人信息更新成功')
        this.$emit('updateProfile', dt)
      })
    },
    handleCancel (e) {
      console.log('Clicked cancel button')
      this.visible = false
    },
    logout () {
      this.$EIM.close()
      this.$emit('logout')
    }
  }
}
</script>
<style lang="stylus" scoped>
.setting-wrap {
  display flex
  align-items center
  justify-content space-between
}
</style>
