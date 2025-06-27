import { useContext, useEffect } from "react";
import { contextData } from "../ContextApi/Context";

export default function FetchData() {



  const {selectedProvince,setSelectedProvince} = useContext(contextData);

  //stores Api Data
  const { apidata, setapidata } = useContext(contextData);

    

  //Fetch data from Api and Stors it in apidata
  const HandleFetch = async () => {
    try {
      const apiresult = await fetch(`https://667a-2407-54c0-1b15-bd46-2c66-922c-a958-4699.ngrok-free.app/api/v1/recent-location-by-province?province=${encodeURIComponent(selectedProvince)}`, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });

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
