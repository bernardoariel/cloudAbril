import axios from 'axios';

const backendApi = axios.create({
  baseURL: "http://vps-5487155-x.dattaweb.com:3000/api"
})

export  default backendApi