import request from '../utils/request'

/*获取依赖数据*/
export const getDependencyData = () => {
  return request({
    url: '/api',//打包路径
    // url:'/api/api',//开发路径
    method: 'get',
  })
}
