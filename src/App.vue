<template>
  <div id="app">
    <div class="wrap" v-if="isShowApp">
      <IM v-if="showIM" @logout="onLogout"></IM>
      <Login v-else @login="onLogin"></Login>
    </div>
  </div>
</template>

<script>
import IM from './IM.vue'
import Login from './Login.vue'
const imToken = localStorage.getItem('token')
const imUid = localStorage.getItem('uid')
export default {
  components: {
    IM,
    Login
  },
  data () {
    return {
      isShowApp: false,
      showIM: false
    }
  },
  methods: {
    loginByToken () {
      if (imToken && imUid) {
        this.$EIM
          .open({
            accessToken: imToken,
            user: imUid
          })
          .then(() => {
            this.showIM = true
          })
          .finally(() => {
            this.isShowApp = true
          })
      } else {
        this.isShowApp = true
      }
    },
    onLogin () {
      this.showIM = true
    },
    onLogout () {
      this.showIM = false
      localStorage.removeItem('token')
      localStorage.removeItem('uid')
    }
  },
  mounted () {
    this.loginByToken()
  }
}
</script>

<style lang="stylus">
#app{
  width 100%
  height 100%
  background #fafafa
  display flex
  align-items center
}
.wrap {
  margin 0 auto
}
</style>
