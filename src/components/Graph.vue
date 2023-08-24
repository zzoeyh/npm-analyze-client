<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted } from 'vue'
import { getDependencyData } from '../api/index'
import { rename } from '../utils/rename'
const emits = defineEmits(['msg'])
let msg = []
//只写了普通依赖的情况
interface INode{
  name:string
  s:number
  size:string
  version:string
}
interface ITree{
  name:string
  s:number
  size:string
  version:string
  children:Array<INode>
}

let dependenciesData:Array<ITree> = []
let devDependenciesData = []

let actualDependenciesData:Array<ITree>= []
//用来判断是drag事件还是click事件
let beginX = 0
let beginY = 0
let moveX = 0
let moveY = 0
const fetchData = async () => {
  await getDependencyData().then((res) => {
    emits('msg', res.data)
    dependenciesData = res.data.dependencies.map(rename)
    actualDependenciesData = dependenciesData.map((item) => ({
      ...item,
      children: [],
    }))
    devDependenciesData = res.data.devDependencies
    init(actualDependenciesData)
  })
}
// 延迟添加节点实现不会一次性弹出整个svg的效果
const addChildWithDelay = (parentIdx:number, child:INode, index:number) => {
  setTimeout(
    () => {
      actualDependenciesData[parentIdx].children.push(child)
      update(actualDependenciesData)
    },
    (index + 1) * 1000,
  )
}
onMounted(async () => {
  await fetchData()
  dependenciesData.forEach((item, idx) => {
   console.log(item)
   if(item.children){
    item.children.forEach((i, index) => {
      addChildWithDelay(idx, i, index)
    })
   }
 
  })

  // 热更新
  const socket = new WebSocket(`ws://${window.location.host}`, 'npa-cli')
  socket.addEventListener('message', async (event) => {
    const message = JSON.parse(event.data)
    if (message.type === 'update') {
      // const updatedFilePath = message.path
      // console.log(`收到更新消息`)
      location.reload()
    }
  })

})


function createNodes(svg, nodesData, linksData, simulation) {
  const links = svg
    .append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(linksData)
    .join('line')
  const nodes = svg
    .append('g')
    .attr('class', 'my-class')
    .selectAll('circle')
    .data(nodesData)
    .join('circle')
    .attr('fill', (d) => (d.children ? 'white' : 'lightgreen'))
    .attr('stroke', (d) => (d.children ? 'black' : 'lightgreen'))
    .attr('r', (d) => (d.children ? 8 : 5))
    .call(drag(simulation))

  const labels = svg
    .append('g')
    .attr('class', 'my-class')
    .selectAll('text')
    .data(nodesData)
    .join('text')
    .attr('style', 'font-family: arial; ;')
    .text((d) => d.data.name)
    .call(drag(simulation))

  simulation.on('tick', () => {
    links
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)

    nodes.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
    labels.attr('x', (d) => d.x).attr('y', (d) => d.y)
  })

  return { links, nodes, labels }
}


//增加拖拽功能
const drag = (simulation) => {
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
      msg = d.data
      //在此处发起请求获取单个节点详细信息
      console.log(msg)
      emits('msg', msg)
    }
    moveX = 0
    moveY = 0
  }

  return d3
    .drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
}

function init(data) {
  const height = 680
  const width = 900
  function zoomed ({transform}) {
        let g = d3.selectAll('g')
        g.attr("transform", transform);
      }
  const svg = d3
    .select('.container')
    .append('svg')
    //设置展示到画板中间
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    svg.call(d3.zoom()
        .extent([[-width / 2, -height / 2], [width, height]])
        .scaleExtent([0.5, 100])
        .on("zoom", zoomed));

  data.forEach((element) => {
    const root = d3.hierarchy(element)
    const links = root.links()
    const nodes = root.descendants()
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
          //设置距离
          .distance(100)
          //设置聚合，越小越分散
          .strength(0.5),
      )
      //设置边距
      //设置超出拉扯距离，越小越不会超出画布
      .force('charge', d3.forceManyBody().strength(-800))
      .force('x', d3.forceX())
      .force('y', d3.forceY())
    createNodes(svg, nodes, links, simulation)
  })

  // invalidation.then(() => simulation.stop());
  return svg.node()
}
function update(data) {
  d3.select('.container').selectAll('*').remove()
  const height = 680
  const width = 900
  function zoomed ({transform}) {
        let g = d3.selectAll('g')
        g.attr("transform", transform);
      }


  const svg = d3
    .select('.container')
    .append('svg')
    //设置展示到画板中间
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    svg.call(d3.zoom()
        .extent([[-width / 2, -height / 2], [width, height]])
        .scaleExtent([0.5, 100])
        .on("zoom", zoomed));
  
  data.forEach((element) => {
    const root = d3.hierarchy(element)
    const links = root.links()
    const nodes = root.descendants()
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
          //设置距离
          .distance(100)
          //设置聚合，越小越分散
          .strength(0.5),
      )
      //设置边距
      //设置超出拉扯距离，越小越不会超出画布
      .force('charge', d3.forceManyBody().strength(-800))
    createNodes(svg, nodes, links, simulation)

    simulation.nodes(nodes)
    simulation.force('link').links(links)
    simulation.alpha(1).restart()
  })

  // return svg.node()
}
</script>

<template>
  <div id="graph">
    <div class="container" ></div>
  </div>
</template>

<style>
#graph {
  position: absolute;
  top: 0;
  left: 240px;
  right: 0px;
  bottom: 0;
  height: 100%;
  overflow: hidden;
}
.container {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  height: 100%;
  width: 100%;
  background-color: #fff;
  padding: 20px;
  box-sizing: border-box;
  /* background-color: pink; */
  overflow: hidden;
}
.my-class {
  font-size: 12px;
}
.my-class:hover {
  cursor: pointer;
}
</style>
