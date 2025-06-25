import { useContext, useEffect } from "react"
import { contextData } from "../ContextApi/Context"

export default function FetchData() {

  //stores Api Data
  const { apidata, setapidata } = useContext(contextData);

  //Fetch data from Api and Stors it in apidata
  const HandleFetch = async () => {
    try {
      const apiresult = await fetch("http://localhost:5000/api/vehicles")
      const result = await apiresult.json()
      setapidata(result)
    } catch (error) {
      console.error("Error fetching data:", error);
    }

  }

  //Runs every 5sec to update data from API
  useEffect(() => {
    HandleFetch();
    const intervalId = setInterval(HandleFetch, 5000);
    return () => clearInterval(intervalId);
  }, [])
  return null;

}
