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
      <Avatar :src="user.avatar" />
    </Modal>
  </div>
</template>
<script>
import { Modal, Input, Avatar } from 'ant-design-vue'
export default {
  components: {
    Modal,
    Input,
    Avatar
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
      ModalText: 'Content of the modal',
      visible: false,
      confirmLoading: false
    }
  },
  mounted () {
    console.log(this, 'useeerr')
  },
  methods: {
    showModal () {
      this.visible = true
    },
    handleOk (e) {
      this.ModalText = 'The modal will be closed after two seconds'
      this.confirmLoading = true
      setTimeout(() => {
        this.visible = false
        this.confirmLoading = false
      }, 2000)
    },
    handleCancel (e) {
      console.log('Clicked cancel button')
      this.visible = false
    }
  }
}
</script>
