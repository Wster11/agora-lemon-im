import Vue from 'vue'
import Router from 'vue-router'
import IM from '@/components/im'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'agora lemon im',
      component: IM
    }
  ]
})
