// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import LemonIMUI from 'lemon-imui'
import 'lemon-imui/dist/index.css'
import conn from './initim'
import VueClipboard from 'vue-clipboard2'
import { message, Modal } from 'ant-design-vue'

Vue.config.productionTip = false
Vue.use(LemonIMUI)
Vue.use(VueClipboard)
Vue.use(Modal)
Vue.prototype.$EIM = conn
Vue.prototype.$message = message

/* eslint-disable no-new */
new Vue({
  render: h => h(App)
}).$mount('#app')
// new Vue({
//   el: '#app',
//   router,
//   components: { App },
//   template: '<App/>'
// })
