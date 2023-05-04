<template>
  <div class="login-wrap">
    <Form :form="form" @submit="handleSubmit">
      <FormItem label="用户名">
        <Input
          placeholder="请输入用户名"
          v-decorator="[
            'user',
            { rules: [{ required: true, message: '请输入用户名!' }] }
          ]"
        />
      </FormItem>
      <FormItem label="密码">
        <Input
          type="password"
          placeholder="请输入登录密码"
          v-decorator="[
            'password',
            {
              rules: [{ required: true, message: '请输入登录密码!' }]
            }
          ]"
        />
      </FormItem>
      <FormItem>
        <Button block type="primary" html-type="submit">
          登录
        </Button>
      </FormItem>
    </Form>
  </div>
</template>
<script>
import { Button, Form, Input } from 'ant-design-vue'

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
    Button: Button,
    Form: Form,
    Input: Input,
    FormItem: Form.Item
  },
  data () {
    return {
      form: this.$form.createForm(this, {name: 'login'})
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
              this.$message.success('登录成功')
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
                this.$message.error('用户名或密码错误')
              } else if (
                errInfo.error_description === ERROR_CODE.userNotFound
              ) {
                this.$message.error('用户不存在')
              } else {
                this.$message.error('登录失败')
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
