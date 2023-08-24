<template>
  <div id="sidebar" v-if="sendMsg">
    <h2>根节点：</h2>
    <!--     <div v-for="(node, idx) in sendMsg" :key="idx">
    {{ node }}
    </div> -->
    <div
      class="node-info"
      v-for="(item, index) in sendMsg.dependencies"
      :key="index"
    >
      <div class="title">{{ item.name }}</div>
      <div class="info">
        version:{{ item.version }} size:{{ item.size }}
        dependencies :
        <div class="info-dependencies">
          <div
            class="info-dependencies-item"
            v-for="(it, index) in item.dependencies"
            :key="index"
          >
            {{ it.name }}
          </div>
        </div>
      </div>
    </div>

    <div class="tree">
      <h2>树形结构关系：</h2>
      <el-tree :data="sendMsg.dependencies" :props="defaultProps" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  sendMsg: {
    type: Object,
  },
})

const defaultProps = {
  children: 'dependencies',
  label: 'name',
}
</script>

<style scoped>
#sidebar {
  position: absolute;
  left: 0;
  top: 0;
  width: 240px;
  /* background-color: gray; */
  border-right: 1px solid gray;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: scroll;
}
.title {
  font-size: 24px;
}
.info-dependencies-item {
  text-indent: 1em;
}
.tree {
  margin-top: 20px;
}
</style>
