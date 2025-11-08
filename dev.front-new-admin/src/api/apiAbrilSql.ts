import axios from "axios"



export const apiAbrilSql = axios.create({
  baseURL: "http://localhost:3000/api"
})
