import axios from 'axios'
import { attachInterceptors } from './interceptors'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

attachInterceptors(api)

export default api
