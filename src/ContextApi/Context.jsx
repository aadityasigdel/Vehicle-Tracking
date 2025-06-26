import React, { createContext, useState } from "react";

export const contextData = createContext();

export default function ContextProvider({ children }) {
  const [apidata, setapidata] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("Bagamati Province");
  return (
    <>
      <contextData.Provider value={{
        apidata,
        setapidata,
        selectedProvince,
        setSelectedProvince,
      }}>
        {children}
      </contextData.Provider>
    </>
  )
}
