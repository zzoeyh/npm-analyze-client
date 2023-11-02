<script setup lang="ts">
import * as d3 from 'd3'
import {getDependencyData} from '../api/index'
import {onMounted, ref} from 'vue'

import type {TabsPaneContext} from 'element-plus'
import miserables from '../mock/mock2.json'

const activeName = ref('first')

const handleClick = (tab: TabsPaneContext) => {
  let name = tab.props.name
  if (name === 'first') {
    d3.select('.container').selectAll('*').remove()
    msg.value = data.top
    emits('msg', msg.value)
    emits('node', {})
    go(data, 'container')
  } else {
    d3.select('.devContainer').selectAll('*').remove()
    msg.value = devData.top
    emits('msg', msg.value)
    emits('node', {})
    go(devData, 'devContainer')
  }
}

const emits = defineEmits(['msg', 'node'])
interface Dependency {
  id: string
  name: string
  version: string
  size: string
  s: number
  group: number
}

interface Arrow {
  source: string
  target: string
  value: number
}
interface DependenciesData {
  points: Dependency[]
  arrows: Arrow[]
  top: string[]
}
let beginX = 0
let beginY = 0
let moveX = 0
let moveY = 0

let data = {} as DependenciesData
let devData = {} as DependenciesData
let msg = ref<string[]>([])
onMounted(() => {
  data = miserables.dependencies
  console.log(data)
  msg.value = data.top
  emits('msg', msg.value)
  go(data, 'container')
  // await getDependencyData().then((res) => {
  //   data = res.data.dependencies;
  //   devData = res.data.devDependencies
  //   msg.value = data.top
  //   emits("msg", msg.value);
  //   go(data, 'container');
  // });

  const socket = new WebSocket(`ws://${window.location.host}`, 'npa-cli')
  socket.addEventListener('message', async (event) => {
    const message = JSON.parse(event.data)
    if (message.type === 'update') {
      const updatedFilePath = message.path
      location.reload()
    }
  })
})

let transformData = {}
function go(data, container) {
  const height = 680
  const width = 900
  const color = d3.scaleOrdinal(d3.schemeCategory10)
  const strokeWidth = 1.5
  let graph = data
  //缩放函数
  const zoomed = ({transform}) => {
    let g = d3.selectAll('g')
    g.attr('transform', transform)
    transformData = transform
    updateNode(node)
  }
  const simulation = d3
    .forceSimulation(graph.points)
    .force('charge', d3.forceManyBody().strength(-400))
    .force('x', d3.forceX())
    .force('y', d3.forceY())
    .force(
      'link',
      d3
        .forceLink(graph.arrows)
        .id(function (d) {
          return d.id
        })
        .distance(50)
        .strength(1),
    )
    .on('tick', ticked)

  const svg = d3
    .select('.' + container)
    .append('svg')
    //设置展示到画板中间
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .call(
      d3
        .zoom()
        .extent([
          [-width / 2, -height / 2],
          [width, height],
        ])
        .scaleExtent([0.5, 100])
        .on('zoom', zoomed),
    )

  const link = svg
    .append('g')
    .selectAll('g')
    .data(graph.arrows)
    .enter()
    .append('line')
    .attr('stroke', 'gray')
    .attr('stroke-width', strokeWidth)

  const node = svg
    .append('g')
    .selectAll('g')
    .data(graph.points)
    .enter()
    .append('g')
    .attr('cursor', 'pointer')

  node
    .append('circle')
    .attr('r', 5)
    .attr('fill', function (d) {
      return color(d.group)
    })
  node.call(
    d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended),
  )
  node
    .append('text')
    .text(function (d) {
      return d.name
    })
    .attr('x', 6)
    .attr('y', 3)
    .style('fill', 'white')

  node.append('title').text(function (d) {
    return d.version
  })

  function ticked() {
    node.call(updateNode)
    link.call(updateLink)
  }

  function fixna(x) {
    if (isFinite(x)) return x
    return 0
  }

  function updateLink(link) {
    link
      .attr('x1', function (d) {
        return fixna(d.source.x)
      })
      .attr('y1', function (d) {
        return fixna(d.source.y)
      })
      .attr('x2', function (d) {
        return fixna(d.target.x)
      })
      .attr('y2', function (d) {
        return fixna(d.target.y)
      })
  }

  function updateNode(node) {
    node.attr('transform', function (d) {
      return 'translate(' + fixna(d.x) + ',' + fixna(d.y) + ')'
    })
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
    beginX = d.x
    beginY = d.y
  }

  function dragged(event, d) {
    d.fx = event.x
    d.fy = event.y
    moveX = event.x - beginX
    moveY = event.y - beginY
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
    if (moveX == 0 && moveY == 0) {
      //在此处发起请求获取单个节点详细信息
      // node.attr("fill", function(d) { return color(d.group); });
      // var clicked = d3.select();
      // clicked.attr("fill","orange");
      emits('node', d)
    }
    moveX = 0
    moveY = 0
  }
}

let initscale = 1 //初始时缩放倍数

let inittransform = [0, 0] //初始时标签移动大小

let tx = 0
let ty = 0

let zx = 0
let zy = 0

const increase = () => {
  let svg = d3.select('.container').select('svg')
  initscale = initscale - 0.1
  zx = 110 - 110 * initscale
  zy = 100 - 100 * initscale

  let tran = {x: zx + tx, y: zy + ty, k: initscale}
  svg
    .selectAll('g')
    .attr('transform', `translate(${tran.x},${tran.y}),scale(${tran.k})`)
}

const decrease = () => {
  let svg = d3.select('.container').select('svg')
  initscale = initscale + 0.1
  zx = 110 - 110 * initscale
  zy = 100 - 100 * initscale
  let tran = {x: zx + tx, y: zy + ty, k: initscale}
  svg
    .selectAll('g')
    .attr('transform', `translate(${tran.x},${tran.y}),scale(${tran.k})`)
}
</script>
<template>
  <div id="graph">
    <el-tabs v-model="activeName" class="tabs" @tab-click="handleClick">
      <el-tab-pane label="dependencies" name="first">
        <div class="container"></div>
      </el-tab-pane>
      <el-tab-pane label="devDependencies" name="second">
        <div class="devContainer"></div>
      </el-tab-pane>
    </el-tabs>
    <!--  <el-button-group class="buttons">
      <el-button @click="decrease">-</el-button>
      <el-button @click="increase">+</el-button>
    </el-button-group> -->
  </div>
</template>

<style scoped>
#graph {
  position: absolute;
  top: 0;
  left: 240px;
  right: 0px;
  bottom: 0;
  height: 100%;
  overflow: hidden;
}

.tabs {
  height: 100%;
  background-color: #222;
  color: #fff !important;
  --el-color-primary: #a687cf;
  --el-text-color-primary: #e6e6fa;
}

:deep .el-tabs__nav {
  padding-left: 20px;
}

:deep .el-tabs__active-bar {
  padding-left: 20px;
}

.tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
  height: 100%;
}

.container {
  position: relative;
  height: 100%;
  width: 100%;
  background-color: #222;
  padding: 20px;
  box-sizing: border-box;
  /* background-color: pink; */
  overflow: hidden;
}

button {
  position: absolute;
}

.buttons {
  position: absolute;
  bottom: 30px;
  left: 20px;
}
</style>
