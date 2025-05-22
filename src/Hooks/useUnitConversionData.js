import { useEffect, useState } from "react";

function useUnitConversionData(unitTypeKey) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/data/unit-conversions.json')
      .then(res => res.json())
      .then(json => {
        if (unitTypeKey && json.unitTypes[unitTypeKey]) {
          setData(json.unitTypes[unitTypeKey]);
        } else {
          setData(json.unitTypes); // If no specific key, return all types
        }
      })
      .catch(err => console.error("Error loading unit data:", err));
  }, [unitTypeKey]);

  return data;
}

export default useUnitConversionData;
