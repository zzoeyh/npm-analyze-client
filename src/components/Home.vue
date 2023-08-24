<script setup lang="ts">
import graph from './Graph.vue'
import sidebar from './SideBar.vue'
import { ref } from 'vue'

interface IMsg {
  name: string
  value?: number
  children?: Array<any>
}
const sendMsg = ref<{}>()
const getMsg = (msg: IMsg) => {
  sendMsg.value = msg
  console.log(sendMsg.value)
}
</script>

<template>
  <div id="home">
    <sidebar :sendMsg="sendMsg"></sidebar>
    <graph @msg="getMsg" />
    <!-- <test @msg="getMsg" /> -->
  </div>
</template>

<style scoped>
#home {
  background-color: #888;
  height: 100%;
}
.read-the-docs {
  color: #888;
}
</style>
