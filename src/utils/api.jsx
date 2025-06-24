import { useContext, useEffect, useState } from "react"
import { contextData } from "../ContextApi/Context"

export default function FetchData() {

  const {apidata, setapidata} = useContext(contextData)

    const HandleFetch = async ()=>{
      try {
      const apiresult = await fetch("http://185.193.19.5/server/api/v1/recent-location-by-province?province=Bagamati%20Province")
      const result = await apiresult.json()
      setapidata(result)
      } catch (error) {
        console.error("Error fetching data:", error);
      }

    }
      useEffect (()=>{
       HandleFetch(); 
        const intervalId = setInterval(HandleFetch, 5000); 
    return () => clearInterval(intervalId); 
    },[])
  return null;

}
