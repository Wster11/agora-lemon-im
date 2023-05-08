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
      <Tabs v-model="activeTab" size="small">
        <TabPane key="1" tab="个人设置">
          <div class="setting-wrap">
            <div>
              <Avatar :size="50" :src="user.avatar" />
              <span> {{ user.displayName }}({{ user.id }})</span>
            </div>
            <Button size="small" type="danger" @click="logout">退出登录</Button>
          </div>
          <br />
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
              <Input
                placeholder="请输入用户头像URL"
                v-decorator="['avatarurl']"
              />
            </FormItem>
          </Form>
        </TabPane>
        <TabPane key="2" tab="系统设置">
          <Form :form="settingForm">
            <FormItem
              label="appKey"
              :label-col="{ span: 3 }"
              :wrapper-col="{ span: 20 }"
            >
              <Input
                placeholder="自定义appKey"
                v-decorator="[
                  'appkey',
                  {
                    rules: [{ required: true, message: '请填写appkey' }],
                    initialValue: appkey
                  }
                ]"
              />
            </FormItem>
            <FormItem
              label="主题"
              :label-col="{ span: 3 }"
              :wrapper-col="{ span: 20 }"
            >
              <RadioGroup v-decorator="['theme', { initialValue: theme, getValueFromEvent:onThemeChange }]">
                <RadioButton value="default">
                  默认
                </RadioButton>
                <RadioButton value="blue">
                  Blue
                </RadioButton>
              </RadioGroup>
            </FormItem>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  </div>
</template>
<script>
import {
  Modal,
  Input,
  Avatar,
  Button,
  Form,
  Tabs,
  Radio
} from 'ant-design-vue'
export default {
  components: {
    Modal,
    Input,
    Avatar,
    Button,
    Form,
    Tabs,
    RadioGroup: Radio.Group,
    RadioButton: Radio.Button,
    FormItem: Form.Item,
    TabPane: Tabs.TabPane
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
      activeTab: '1',
      appkey: localStorage.getItem('appkey'),
      theme: localStorage.getItem('theme') || 'default',
      form: this.$form.createForm(this, { name: 'profile' }),
      settingForm: this.$form.createForm(this, { name: 'sysSetting' })
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
      if (this.activeTab === '1') {
        let dt = this.form.getFieldsValue()
        this.$EIM.updateUserInfo(dt).then(() => {
          this.visible = false
          this.confirmLoading = false
          this.$message.success('个人信息更新成功')
          this.$emit('updateProfile', dt)
        })
      } else {
        this.visible = false
        this.settingForm.validateFields((errors, values) => {
          if (!errors & (this.appkey !== values.appkey)) {
            localStorage.setItem('appkey', values.appkey)
            this.logout()
            window.location.href = '/login'
          }
        })
        this.confirmLoading = false
      }
    },
    handleCancel () {
      this.visible = false
    },
    onThemeChange (e) {
      this.$emit('onThemeChange')
      return e.target.value
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
