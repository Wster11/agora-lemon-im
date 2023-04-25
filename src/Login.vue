<template>
  <div class="login-wrap">
    <a-form :form="form" @submit="handleSubmit">
      <a-form-item label="用户名">
        <a-input
          placeholder="请输入用户名"
          v-decorator="[
            'user',
            { rules: [{ required: true, message: '请输入用户名!' }] }
          ]"
        />
      </a-form-item>
      <a-form-item label="密码">
        <a-input
          type="password"
          placeholder="请输入登录密码"
          v-decorator="[
            'password',
            {
              rules: [{ required: true, message: '请输入登录密码!' }]
            }
          ]"
        />
      </a-form-item>
      <a-form-item>
        <a-button block type="primary" html-type="submit">
          登录
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
import { Button, Form, Input, message } from 'ant-design-vue'

const ERROR_CODE = {
  noAuth: 'token not assign error',
  loginFailed: 'login failed',
  notLogin: 'not login',
  recallTimeout: 'exceed recall time limit',
  userNotFound: 'user not found',
  invalidPassword: 'invalid password',
  registerUnique: 'duplicate_unique_property_exists',
  sendMsgBlock: 'blocked'
}

export { ERROR_CODE }

export default {
  components: {
    aButton: Button,
    aForm: Form,
    aInput: Input,
    aFormItem: Form.Item
  },
  data () {
    return {
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated' })
    }
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          // 登录服务器
          this.$EIM
            .open({
              user: values.user,
              pwd: values.password
            })
            .then(res => {
              message.success('登录成功')
              window.localStorage.setItem('uid', values.user)
              window.localStorage.setItem('token', res.accessToken)
              this.$emit('login')
            })
            .catch(e => {
              let errInfo
              if (e.data.data) {
                errInfo = JSON.parse(e.data.data)
              }
              if (errInfo.error_description === ERROR_CODE.invalidPassword) {
                message.error('用户名或密码错误')
              } else if (
                errInfo.error_description === ERROR_CODE.userNotFound
              ) {
                message.error('用户不存在')
              } else {
                message.error('登录失败')
              }
            })
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.login-wrap {
  width 400px
  margin 0 auto
  background #fff
  padding 10px 20px
  border-radius: 10px
}
</style>
