import React, { createContext, useState } from "react";

export const contextData = createContext();

export default function ContextProvider({ children }) {
  const [apidata, setapidata] = useState([]);
  return (
    <>
        <contextData.Provider value={{apidata,setapidata}}>
          {children}
        </contextData.Provider>
    </>
  )
}
