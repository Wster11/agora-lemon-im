<template>
  <div class="wrap">
    <lemon-imui ref="IMUI" />
  </div>
</template>

<script>
export default {
  name: 'IM',

  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.wrap{
 width: 100%;
 height: 100vh;
 display: flex;
 align-items: center;
 justify-content: center;
}
</style>
