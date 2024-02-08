"use client";
import React, { Component, useState, useEffect } from "react";
import axios from "axios";
import localFont from "next/font/local";
import { Carattere, Lora } from "next/font/google";
import { Playfair } from "next/font/google";
import "./DraggableSticky.css";
import basket from "./images/icon.png";
import Image from "next/image.js";
import basket from "./images/basket.png";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import "./cart.css"
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import dynamic from 'next/dynamic'
import Header from "../components/header";
// const Header = dynamic(()=>import("./Header"),{ssr:false})

const noir = localFont({
  src: [
    {
      path: "./fonts/NoirPro-Light.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/NoirPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NoirPro-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

// const noir_b = localFont({ src: "./fonts/NoirPro-Bold.ttf" });
// const noir = localFont({ src: "./fonts/NoirPro-Regular.ttf" });
// const noir_l = localFont({ src: "./fonts/NoirPro-Light.ttf" });
const lora = Lora({
  weight: ["700"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
});

const play = Playfair({
  weight: ["500"],
  style: ["normal"],
  subsets: ["latin"],
  display: "swap",
});

const StoreSelector = () => {
  const [availableStores, setAvailableStores] = useState([]); //тут весь список магазинов
  const [selectedStore, setSelectedStore] = useState(null); //выбранный магазин из списка
  const [locations, setLocations] = useState([]); //массив из всех локаций выбранного магазина
  const [selectedLocation, setSelectedLocation] = useState(null); //выбранная локация магазина
  const [searchText, setSearchText] = useState(null); //то,что вбивается в поиск
  const [selectedLocationValue, setSelectedLocationValue] = useState(null); // номер магазина
  const [selectedLocationsObject, setSelectedLocationsObject] = useState(null); // {"Maxi Gatineau":8388,"Maxi Buckingham":8389,"Maxi Maniwaki":8624}
  const [responseData, setResponseData] = useState([]); //ответ с бэка
  const [selectedStores, setSelectedStores] = useState([]); //весь список магазинов
  const [selectedStoresID, setSelectedStoresID] = useState([]);
  const [selectedAll, setSelectedAll] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartTrigger, setCartTrigger] = useState({});
  const [hideNonMatching, setHideNonMatching] = useState(false);
  const [error, setError] = useState();
  const [isAnimating, setIsAnimating] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const [state, setState] = useState({
    isPaneOpen: false,
    isPaneOpenLeft: false,
  });

  useEffect(() => {
    console.log(document.title);
  }, []);

  function toggle() {
    setIsOpen((isOpen) => !isOpen);
  }

  useEffect(() => {
    const getFromCart = async (newCart) => {
      if (!Array.isArray(newCart)) {
        return [];
      }

      for (let i = 0; i < newCart.length; ++i) {
        const shop = newCart[i];

        for (let j = 0; j < shop.items.length; ++j) {
          shop.items[j].price = await getItemPriceForStore(
            shop.items[j].id,
            shop.storeID
          );
        }

        shop.sum = shop.items.reduce((prev, curr) => prev + curr.price, 0);
      }

      // console.log(newCart);
      setCart(newCart);
    };

    getFromCart(cart);
  }, [cartTrigger]);

  useEffect(() => {
    axios
      .get("https://shoppp.azurewebsites.net/api/stores")
      .then((response) => {
        setAvailableStores(response.data);
      })
      .catch((error) => {
        setError("Error fetching available stores");
        console.error("Error fetching available stores:", error);
      });
  }, []); //получаем список магазинов

  const handleStoreChange = async (selectedStore) => {
    setSelectedStore(selectedStore); //сюда кладем выбранный из списка магазин (из массива выбираем один из)
    try {
      const response = await axios.get(
        `https://shoppp.azurewebsites.net/api/stores/${selectedStore}`
      );

      if (response.status === 200) {
        const locationsObject = response.data.locations; //сюда приходят все локации выбранного магазина в формате Maxi Lon:3456
        const locationsArray = Object.keys(locationsObject); // сюда берутся только имена магазинов (ключи)
        setLocations(locationsArray); //сюда кладутся все локации выбранного магазина
        setSelectedLocationsObject(locationsObject); //сюда кладутся пришедшие с бека данные вида {"Maxi Gatineau":8388,"Maxi Buckingham":8389,"Maxi Maniwaki":8624}}
        //console.log(selectedLocationsObject);
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

  const handleSearchChange = (event) => {
    //тут ищем продукт
    setSearchText(event.target.value);
  };

  const handleLocationChange = async (selectedLocation) => {
    //выбираем локацию из списка
    const newSelectedLocationValue = selectedLocationsObject[selectedLocation]; //извлекаем их объекта значение, связанное с ключом selectedLocation
    setSelectedLocationValue(newSelectedLocationValue); //тут теперь хранится value(цифра) выбранной локации
    setSelectedLocation(selectedLocation); //тут только имя локации
  };

  const handleButtonClick = async () => {
    try {
      const response = await axios.post(
        "https://shoppp.azurewebsites.net/api/updateLocation",
        {
          selectedStoresID: selectedStoresID,
          searchText: searchText,
        }
      );
      console.log("Данные успешно отправлены на бэкенд", response.data);
      const responseData = response.data;
      setResponseData(responseData);
      console.log(responseData);
    } catch (error) {
      console.error("Ошибка при отправке данных на бэкенд", error);
    }
  };

  const handleAddStore = () => {
    if (!selectedStores.includes(selectedLocation)) {
      setSelectedStores([...selectedStores, selectedLocation]); //кладем выбранные локации в массив
      const newSelectedLocationValue =
        selectedLocationsObject[selectedLocation]; //извлекаем их объекта значение, связанное с ключом selectedLocation
      const newStoreLocationObject = {
        store: selectedStore,
        location: selectedLocation,
      };
      setSelectedAll((prevSelectedAll) => [
        ...prevSelectedAll,
        newStoreLocationObject,
      ]);
      setSelectedLocationValue(newSelectedLocationValue); //сюда кладем номер каждого магазина
      setSelectedStoresID([...selectedStoresID, newSelectedLocationValue]); //получаем массив из номеров магазинов
    }
  };

  const handleAddToCart = async (product) => {
    if (!product) {
      console.error("Invalid product");
      return;
    }

    try {
      const updatedCart = cart.map((shop) => ({ ...shop }));

      for (const item of product.products) {
        const storeIndex = updatedCart.findIndex(
          (store) => store.storeID === item.storeID
        );

        if (storeIndex === -1) {
          updatedCart.push({
            storeID: item.storeID,
            storeName: item.store,
            items: [
              {
                name: product.firstName,
                id: item.productID,
              },
            ],
          });
        } else {
          updatedCart[storeIndex].items.push({
            name: product.firstName,
            id: item.productID,
          });
        }
      }

      for (const shop of updatedCart) {
        for (const item of shop.items) {
          item.price = await getItemPriceForStore(item.id, shop.storeID);
        }

        shop.sum = shop.items.reduce((prev, curr) => prev + curr.price, 0);
      }
      const maxItemsLength = Math.max(
        ...updatedCart.map((store) => store.items.length)
      );

      // Дополняем каждый массив items до максимальной длины
      updatedCart.forEach((store) => {
        const itemsCount = store.items.length;

        // Добавляем недостающие элементы
        for (let i = itemsCount; i < maxItemsLength; i++) {
          const newItem = {
            name: "Doesnt sell at this store",
            id: null, // или используйте уникальный идентификатор
            price: 0, // или установите другое значение по умолчанию
          };

          store.items.push(newItem);
        }
      });

      // Теперь у вас есть массив cartData, в котором все массивы items имеют одинаковую длину
      console.log(updatedCart);

      setCart(updatedCart);
      saveCartData(updatedCart);
      setCartTrigger({});
      setIsAnimating(true);  
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Handle errors appropriately
    }
  }; //works

  setTimeout(() => {
    setIsAnimating(false);
  }, "200"); 

  const clearData = () => {
    const zeroPriceIndexes = [];

    cart.forEach((store) => {
      store.items.forEach((item, itemIndex) => {
        if (item.price === 0) {
          zeroPriceIndexes.push(itemIndex);
        }
      });
    });
    console.log(zeroPriceIndexes);
  };

  clearData();

  const saveCartData = (cartData) => {
    localStorage.setItem("cart", JSON.stringify(cartData));
  };

  const loadCartData = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
      console.log(cart);
    }
  };

  //console.log("cart", cart);

  async function getItemPriceForStore(productId, storeId) {
    if (productId == null) {
      const pr = 0;
      return pr;
    } else {
      const response = await axios.get(
        `https://grocerytracker.ca/api/pc/${storeId}/${productId}`
      );
      const price = response.data;
      const value = price.filter((item) => storeId == item.storeID);

      //console.log('value',value);
      const pr = value[0].prices[value[0].prices.length - 1].price;
      return pr;
    }
  }

  return (
    <div>
      <Header />
      <div style={{ marginLeft: "80px", marginRight: "80px" }}>
        <h1 style={{ textAlign: "center" }} className={noir.className}>
          Find a product
        </h1>
        <div>
          <label
            style={{ paddingRight: "8px", fontSize: "18px" }}
            className={noir.className}
          >
            Search:
          </label>
          <input
            className={noir.className}
            placeholder="Search for..."
            style={{
              padding: "0.375rem 2.25rem 0.375rem 0.75rem",
              fontSize: "1rem",
              fontWeight: "400",
              lineHeight: "1.5",
              color: "#212529",
              backgroundColor: "#fff",
              border: "1px solid #ced4da",
              borderRadius: "0.25rem",
              transition:
                "border-color .15s ease-in-out,box-shadow .15s ease-in-out",
              width: "120px",
            }}
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            required
          />

          <button
            className={noir.className}
            disabled={searchText === null || selectedLocation === null}
            onClick={handleButtonClick}
          >
            Search
          </button>

          <label
            style={{
              paddingRight: "8px",
              fontSize: "18px",
              paddingLeft: "24px",
            }}
            className={noir.className}
          >
            Select Store:
          </label>
          <select
            className={noir.className}
            style={{
              height: "38px",
              padding: "0.375rem 2.25rem 0.375rem 0.75rem",
              fontSize: "1rem",
              fontWeight: "400",
              lineHeight: "1.5",
              color: "#212529",
              backgroundColor: "#fff",
              border: "1px solid #ced4da",
              borderRadius: "0.25rem",
              transition:
                "border-color .15s ease-in-out,box-shadow .15s ease-in-out",
            }}
            onChange={(e) => handleStoreChange(e.target.value)}
          >
            <option className={noir.className} value="">
              Select...
            </option>
            {availableStores.map((store) => (
              <option className={noir.className} key={store} value={store}>
                {store}
              </option>
            ))}
          </select>

          {selectedStore && (
            <>
              <label
                style={{
                  paddingRight: "8px",
                  fontSize: "18px",
                  paddingLeft: "24px",
                }}
                className={noir.className}
              >
                Select Location:
              </label>
              <select
                className={noir.className}
                style={{
                  height: "38px",
                  padding: "0.375rem 0.25rem 0.375rem 0.75rem",
                  fontSize: "1rem",
                  fontWeight: "400",
                  lineHeight: "1.5",
                  color: "#212529",
                  backgroundColor: "#fff",
                  border: "1px solid #ced4da",
                  borderRadius: "0.25rem",
                  transition:
                    "border-color .15s ease-in-out,box-shadow .15s ease-in-out",
                }}
                onChange={(e) => handleLocationChange(e.target.value)}
              >
                <option value="">Select...</option>
                {locations.length > 0 ? (
                  locations.map((location, index) => (
                    <option
                      className={noir.className}
                      key={index}
                      value={location}
                    >
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
          <button
            disabled={selectedLocation === null}
            className={noir.className}
            onClick={handleAddStore}
          >
            Add Store
          </button>
        </div>

        {selectedStore && selectedLocation && (
          <p className={noir.className}>
            You selected <b>{selectedLocation}</b> at <b>{selectedStore}</b>.
          </p>
        )}
        <div>
          <h3 className={noir.className}>Selected Stores:</h3>
          <ul>
            {selectedAll.map((store, index) => (
              <li className={noir.className} key={index}>
                {store.store} : {store.location}
              </li>
            ))}
          </ul>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {responseData.map((item, index) => (
            <div
              style={{
                width: "480px",
                boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginRight: "20px",
              }}
              key={index}
            >
              <div>
                <p
                  className={noir.className}
                  style={{
                    fontSize: "20px",
                    maxWidth: "350px",
                    paddingTop: "20px",
                    height: "56px",
                  }}
                >
                  {item.firstName}
                </p>
                {/* <p>{item.brand}</p> */}
              </div>
              <Zoom>
                <img
                  style={{
                    width: "120px",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  src={item.photo}
                  alt={`Photo of ${item.firstName}`}
                />
              </Zoom>
              <div
                className={noir.className}
                style={{
                  marginBottom: "20px",
                  fontWeight: "normal",
                  color: "grey",
                  fontSize: "14px",
                }}
              >
                {item.products[0].prices.size == ""
                  ? "$" +
                    (item.products[0].prices.unitPriceValue * 10).toFixed(2) +
                    " / 1" +
                    " " +
                    "kg"
                  : item.products[0].prices.size}
              </div>
              <button onClick={() => handleAddToCart(item)}>Add to Cart</button>
              <div style={{ display: "flex", paddingBottom: "20px" }}>
                <div style={{ paddingRight: "20px", flexDirection: "row" }}>
                  {item.products.map((store, index) => (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                      key={index}
                    >
                      <p
                        className={noir.className}
                        style={{ paddingRight: "12px", maxWidth: "250px" }}
                        key={index}
                      >
                        {store.store}
                      </p>
                      {store.prices.priceType == "SPECIAL" ? (
                        <p
                          className={noir.className}
                          style={{ fontWeight: "700", color: "red" }}
                        >
                          {"$" +
                            "" +
                            store.prices.price.toFixed(2) +
                            " " +
                            store.prices.unit}
                        </p>
                      ) : (
                        <p
                          className={noir.className}
                          style={{ fontWeight: "700" }}
                        >
                          {"$" +
                            "" +
                            store.prices.price +
                            " " +
                            store.prices.unit}
                        </p>
                      )}
                      {store.prices.wasPrice && (
                        <s style={{ marginRight: "10px", marginBottom: "5px" }}>
                          ({store.prices.wasPrice})
                        </s>
                      )}
                      {store.prices.notes && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            marginLeft: "4px",
                            fontSize: "12px",
                            border: "1px solid red",
                            padding: "4px",
                            marginLeft: "12px",
                          }}
                        >
                          <p
                            className={noir.className}
                            style={{
                              display: "flex",
                              margin: "2px",
                              fontWeight: "700",
                              fontSize: "12px",
                            }}
                          >
                            {store.prices.notes}
                          </p>
                          <p
                            className={noir.className}
                            style={{ margin: "0px", color: "gray" }}
                          >
                            {store.prices.endDate
                              ? "ENDS" +
                                " " +
                                new Date(
                                  store.prices.endDate
                                ).toLocaleDateString("en-US", {
                                  month: "2-digit",
                                  day: "2-digit",
                                })
                              : ""}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {cart.length != 0 && (
        <div
          style={{
            position: "sticky",
            rigth: "50",
            bottom: "0",
            float: "right",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Image
            alt="shopping"
            src={basket}
            width={120}
            height={120}
            onClick={() => setState({ isPaneOpen: true })}
            className={`animated-image ${isAnimating ? "tilt-shaking" : ""}`}
          />
          <button
            className={noir.className}
            style={{
              outline: "0",
              cursor: "pointer",
              padding: "5px 16px",
              fontSize: "14px",
              fontWeight: "500",
              lineHeight: "20px",
              verticalAlign: "middle",
              border: "1px solid",
              borderRadius: " 6px",
              color: " #24292e",
              backgroundColor: "#fafbfc",
              borderColor: "#1b1f2326",
              boxShadow:
                "rgba(27, 31, 35, 0.04) 0px 1px 0px 0px, rgba(255, 255, 255, 0.25) 0px 1px 0px 0px inset",
              transition: "0.2s cubic-bezier(0.3, 0, 0.5, 1)",
            }}
            onClick={() => setState({ isPaneOpen: true })}
          >
            Show Cart
          </button>
          <div
            style={{
              //position: "sticky",
              height: "40px",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
            }}
          >
          </div>
        </div>
      )} 
       <SlidingPane
        className="some-custom-class"
        overlayClassName="some-custom-overlay-class"
        isOpen={state.isPaneOpen}
        title="Cart"
        onRequestClose={() => {
          // triggered on "<" on left top click or on outside click
          setState({ isPaneOpen: false });
        }}
      >
<div style={{ display: "flex", flexDirection: "row",opacity:'100',transition:"all .75s ease"}}>
        {cart.map((store, storeIndex) => (
          <div key={storeIndex}>
            <h3>{store.storeName}</h3>
            <ol>
              {store.items.map((item, itemIndex) => (
               <>
               <li key={itemIndex}>{item.name + " " + "$" + item.price}</li>
                </>
              ))}
            </ol>
            <p><b>Total price:</b> {store.sum}</p>
          </div>
        ))}
      </div>
      </SlidingPane>
    </div>
  );
};

export default StoreSelector;
