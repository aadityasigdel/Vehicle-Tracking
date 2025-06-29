import { useContext, useEffect } from "react";
import { contextData } from "../ContextApi/Context";

export default function FetchData() {


  //stores Api Data
  const {selectedProvince,setSelectedProvince, apidata, setapidata} = useContext(contextData);



  //Fetch data from Api and Stors it in apidata
  const HandleFetch = async () => {
    try {
      const apiresult = await fetch(`https://api.mytufan.com/api/v1/recent-location-by-province?province=${encodeURIComponent(selectedProvince)}`);

      console.log("Status Code:", apiresult.status);
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
  }, [selectedProvince])
  return null;

}
