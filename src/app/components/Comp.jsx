"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Comp from "../app/components/comp";

const StoreSelector = () => {
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedLocationValue, setSelectedLocationValue] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocationsObject, setSelectedLocationsObject] = useState(null); // Новое состояние для locationsObject
  const [availableStores, setAvailableStores] = useState([]);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [responseData, setResponseData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/stores")
      .then((response) => {
        setAvailableStores(response.data);
      })
      .catch((error) => {
        setError("Error fetching available stores");
        console.error("Error fetching available stores:", error);
      });
  }, []);

  const handleStoreChange = async (selectedStore) => {
    setSelectedStore(selectedStore);
    setSelectedLocation(null);
    setSelectedLocationValue(null);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/stores/${selectedStore}`
      );

      if (response.status === 200) {
        const locationsObject = response.data.locations;
        const locationsArray = Object.keys(locationsObject);
        setLocations(locationsArray);
        // Сохраняем locationsObject в состоянии
        setSelectedLocationsObject(locationsObject);
      } else {
        setError(
          `Error fetching locations. Server returned: ${response.status}`
        );
        console.error(
          "Error fetching locations. Server returned:",
          response.status
        );
      }
    } catch (error) {
      setError(`Error fetching locations: ${error.message}`);
      console.error("Error fetching locations:", error.message);
    }
  };

  const handleLocationChange = async (selectedLocation) => {
    const newSelectedLocationValue = selectedLocationsObject[selectedLocation];
  
    // Обновляем состояние
    setSelectedLocationValue(newSelectedLocationValue);
    setSelectedLocation(selectedLocation);
  
    try {
      const response = await axios.post("http://localhost:8080/api/updateLocation", {
        selectedLocationValue: newSelectedLocationValue,
        searchText: searchText,
      });
  
      console.log("Данные успешно отправлены на бэкенд", response.data);
  
      const responseData = response.data.secondApiResponse.results;
      setResponseData(responseData);
    } catch (error) {
      console.error("Ошибка при отправке данных на бэкенд", error);
      // Добавьте обработку ошибки, если необходимо
    }
  };
  

  // const handleLocationChange = async (selectedLocation) => {
  //   const newSelectedLocationValue = selectedLocationsObject[selectedLocation];

  //   // Обновляем состояние
  //   setSelectedLocationValue(newSelectedLocationValue);
  //   setSelectedLocation(selectedLocation);

  //   try {
  //     // Отправляем данные на бэкенд
  //     const response = await axios.post(
  //       "http://localhost:8080/api/updateLocation",
  //       {
  //         selectedLocationValue: newSelectedLocationValue,
  //         searchText: searchText,
  //       }
  //     );

  //     console.log("Данные успешно отправлены на бэкенд", response.data);

  //     const responseData = response.data.secondApiResponse.results;
  //     setResponseData(responseData);
  //     console.log(responseData);
  //   } catch (error) {
  //     console.error("Ошибка при отправке данных на бэкенд", error);
  //     // Здесь вы можете обработать ошибку, если это необходимо
  //   }
  // };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  useEffect(() => {
    // Фильтрация данных на основе введенного текста
    const filteredData = responseData.filter(item =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setResponseData(filteredData);
  }, [searchText, responseData]);

  return (
    <div>
            <label>Search:</label>
      <input type="text" value={searchText} onChange={handleSearchChange} />
      <label>Select Store:</label>
      <select onChange={(e) => handleStoreChange(e.target.value)}>
        <option value="">Select...</option>
        {availableStores.map((store) => (
          <option key={store} value={store}>
            {store}
          </option>
        ))}
      </select>

      {selectedStore && (
        <>
          <label>Select Location:</label>
          <select onChange={(e) => handleLocationChange(e.target.value)}>
            <option value="">Select...</option>
            {locations.length > 0 ? (
              locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No locations available
              </option>
            )}
          </select>
        </>
      )}

      {selectedStore && selectedLocation && (
        <p>
          You selected {selectedLocation} at {selectedStore}.
        </p>
      )}

      <div>
        {responseData.map((item) => (
          <div key={item}>
            <h3>{item.name}</h3>
            <img src={item.image} alt={item.name} />
            <p>{item.prices.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreSelector;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { validateHeaderValue } from 'http';

// const StoreSelector = () => {
//   const [selectedStore, setSelectedStore] = useState(null);
//   const [selectedLocation, setSelectedLocation] = useState(null);
//   const [locations, setLocations] = useState([]);
//   const [availableStores, setAvailableStores] = useState([]);
//   const [storeLocation, setStoreLocation] = useState([]); // Добавили состояние для хранения значения магазина

//   useEffect(() => {
//     axios.get('http://localhost:8080/api/stores')
//       .then(response => {
//         setAvailableStores(response.data);
//       })
//       .catch(error => {
//         console.error('Error fetching available stores:', error);
//       });
//   }, []);

//   const handleStoreChange = async (store) => {
//     setSelectedStore(store);
//     setSelectedLocation(null);

//     try {
//       // Запрос к серверу для получения данных о расположениях выбранного магазина
//       const response = await axios.get(`http://localhost:8080/api/stores/${store}`);

//       if (response.status === 200) {
//         const locationsArray = Object.entries(response.data.locations);
//         //const locationsArray = Object.keys(response.data.locations);
//         setLocations(locationsArray);
//         console.log(locationsArray);
//       } else {
//         console.error('Error fetching locations. Server returned:', response.status);
//       }
//     } catch (error) {
//       console.error('Error fetching locations:', error.message);
//     }
//   };

//   // const handleStoreChange = async (store) => {
//   //   setSelectedStore(store);
//   //   setSelectedLocation(null);

//   //   try {
//   //     const response = await axios.get(`http://localhost:8080/api/stores/${store}`);
//   //     console.log(response.data);
//   //     // Обработка данных, например, установка состояний
//   //   } catch (error) {
//   //     console.error('Error fetching data:', error);
//   //   }
//   // };

//   return (
//     <div>
//       <label>Select Store:</label>
//       <select onChange={(e) => handleStoreChange(e.target.value)}>
//         <option value="">Select...</option>
//         {availableStores.map((store) => (
//           <option key={store} value={store}>
//             {store}
//           </option>
//         ))}
//       </select>

//       {selectedStore && (
//         <>
//           <label>Select Location:</label>
//           <select onChange={(e) => setSelectedLocation(e.target.value)}>
//             <option value="">Select...</option>
//             {locations.length > 0 ? (
//               locations.map((location) => (
//                 <option key={location} value={location}>
//                   {location}
//                 </option>

//               ))
//             ) : (
//               <option value="" disabled>
//                 No locations available
//               </option>
//             )}
//           </select>
//         </>
//       )}

//       {selectedStore && selectedLocation && (
//         <p>
//           You selected {selectedLocation} at {selectedStore}.
//         </p>
//       )}
//     </div>
//   );
// };

// export default StoreSelector;
