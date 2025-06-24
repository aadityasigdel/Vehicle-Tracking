import { useEffect, useState } from "react"

export default function FetchData() {

  const [apidata,setapidata] = useState([]);

    const HandleFetch = async ()=>{
      try {
      const apiresult = await fetch("https://mocki.io/v1/5a70996f-a789-4e3e-b7c2-fe76be4fa909")
      const result = await apiresult.json()
      setapidata(result)
      console.log(result)
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
