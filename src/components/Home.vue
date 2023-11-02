<script setup lang="ts">
import sidebar from './SideBar.vue'
import ForceGraph from './ForceGraph.vue';
import { ref } from 'vue'

interface IMsg {
  name: string
  value?: number
  children?: Array<any>
}
const sendMsg = ref<{}>()
const sendNode = ref<{}>()
const getMsg = (msg: IMsg) => {
  sendMsg.value = msg
  console.log(sendMsg.value)
}

const getNode = (node) => {
  sendNode.value = node
  console.log(sendNode.value)
}
</script>

<template>
  <div id="home">
    <sidebar :sendMsg="sendMsg" :sendNode="sendNode"></sidebar>
    <ForceGraph @msg="getMsg" @node="getNode" />
  </div>
</template>

<style scoped>
#home {
  background-color: #222;
  height: 100%;
  color-scheme: dark
}

.read-the-docs {
  color: #888;
}

button {
  position: absolute;
}
</style>
