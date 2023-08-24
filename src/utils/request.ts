import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios'

axios.defaults.headers.common['retry'] = 3 //重试请求次数
axios.defaults.headers.common['retryDelay'] = 1000 //重试请求间隔时间
const service:AxiosInstance = axios.create({
  timeout: 10000,
})

service.interceptors.request.use(
  (config) => {
    return config
  },
  (error:AxiosError) => {
    console.log(error)
    return Promise.reject()
  }
)
service.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response
    } else {
      return Promise.reject(response);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
)

export default service
