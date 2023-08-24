<template>
  <div></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { getDependencyData } from '../api/index'
const emits = defineEmits(['msg'])
const fetchData = async () => {
  await getDependencyData().then(
    (res) => {
      if (res.status === 200) {
        console.log(res.data)
        emits('msg', res.data)
      }
    },
    (err) => {
      console.error(err)
    },
  )
}
onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped></style>
