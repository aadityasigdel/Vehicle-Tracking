import { useContext, useEffect } from "react";
import { contextData } from "../ContextApi/Context";

export default function FetchData() {

  //stores Api Data
  const { apidata, setapidata } = useContext(contextData);

  //Fetch data from Api and Stors it in apidata
  const HandleFetch = async () => {
    try {
      const apiresult = await fetch("https://6e7d-2407-54c0-1b15-b0e2-598a-b787-9447-4f4b.ngrok-free.app/api/vehicles");
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
