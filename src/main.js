// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
// import router from './router'
import LemonIMUI from 'lemon-imui'
import 'lemon-imui/dist/index.css'
import conn from './initim'

Vue.config.productionTip = false
Vue.use(LemonIMUI)
Vue.prototype.$EIM = conn
new Vue({
  render: (h) => h(App)
}).$mount('#app')
