import axios from 'axios';

const backendApi = axios.create({
  baseURL: "http://localhost:3000/api/"
})

export  default backendApi