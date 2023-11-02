<script setup lang="ts">
const props = defineProps({
  sendMsg: {
    type: Object,
  },
  sendNode: {
    type: Object
  }
})

const defaultProps = {
  children: 'dependencies',
  label: 'name',
}
</script>
<template>
  <div id="sidebar" v-if="sendMsg">
    <h2>项目依赖：</h2>
    <div class="nodes-info" v-for="(item, index) in sendMsg" :key="index">
      <div class="title">{{ item }}</div>
    </div>

    <!--   <div class="tree">
      <h2>树形结构关系：</h2>
      <el-tree 
      highlight-current
      :data="sendMsg.dependencies" 
      :props="defaultProps" 
     class="tree"/>
    </div> -->
    <div class="node-info" v-if="sendNode && sendNode.name">
      <h2>
        当前依赖项:
      </h2>
      <div class="info">
        <span>{{ sendNode.name }}</span>

        <span>
          version: {{ sendNode.version }}
        </span>
        <span v-if="sendNode.size">
          size: {{ sendNode.size }}
        </span>
      </div>
    </div>
  </div>
</template>

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
  background-color: #222;
  color: lavender;
}

.title {
  font-size: 18px;
}

.title:hover {
  color: #a685c4;
}

.info-dependencies-item {
  text-indent: 1em;
}

.tree {
  background-color: #222;
}

.node-info {
  padding-top: 10px;

}

.node-info .info {
  display: flex;
  flex-direction: column;
  margin-top: 5px;
  font-size: 18px;
}

:deep .el-tree-node__content:hover {
  background-color: #222;
}

:deep .el-tree .is-current .el-tree-node__content {
  background-color: #444;
}

:deep .el-tree-node__label {
  color: aliceblue;
}
</style>
