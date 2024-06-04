"use client";
import React, { useRef } from "react";
import Image from "next/image";
import basket from "../../app/images/icon.svg";
import localFont from "next/font/local";
import axios from "axios";
import { useState, useEffect } from "react";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import "../products/products.css";
import generatePDF, { Margin } from "react-to-pdf";
import Spiner from "../spiner";

const options = {
  filename: "test.pdf",
  page: {
    margin:Margin.SMALL,
 },

};

const noir = localFont({
  src: [
    {
      path: "../../app/fonts/NoirPro-Light.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../app/fonts/NoirPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../app/fonts/NoirPro-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

// Retrieve cart dFromata from localStorag
const Cart = () => {
  const [theme, setTheme] = useState([]);
  const [sale, setSale] = useState([]);
  const [data, setData] = useState([]);
  const [special, setSpecial] = useState();
  const [len, setLen] = useState(null);
  const [state, setState] = useState({
    isPaneOpen: false,
    isPaneOpenLeft: false,
  });

  const pdfRef = useRef();

  // useEffect(() => {
  //   const handleStorage = () => {
  //     const stores = localStorage.getItem("stores");
  //     const storesArray = JSON.parse(stores);
  //     setStores(storesArray);
  //     console.log(storesArray);
  //   };

  //   if (typeof window !== 'undefined') {
  //     window.addEventListener('storage', handleStorage);
  //   }
  //   return () => window.removeEventListener('storage', handleStorage);
  // }, []);

  React.useEffect(() => {
    window.addEventListener("storage", () => {
      const theme = JSON.parse(localStorage.getItem("stores"));
      const sale = JSON.parse(localStorage.getItem("cart"));
      const special = JSON.parse(localStorage.getItem("special"));
      console.log(theme);
      console.log(sale);
      console.log(special);
      setTheme(theme);
      setSale(sale);
      setSpecial(special);
      sendDataToBackend(theme, sale);
    });
  }, []);

  React.useEffect(() => {
    if (data && data.length > 0 && data[0].value) {
      const len = data[0].value.length;
      setLen(len);
    }
  }, [data, len]);

  const sendDataToBackend = async (theme, sale) => {
    try {
      // Send the data to the appropriate backend endpoint based on the type
      const response = await axios.post(
        "http://localhost:8080/api/sale/setsale",
        { sale: sale, theme: theme } // Wrap the sale data in an object with the key "sale"
      );
      const responses = response.data;
      console.log(responses);
      const array = await Promise.all(responses);
      const groupBy = (arr, prop) =>
        arr.reduce((acc, item) => {
          const key = item.results.length > 0 ? item.results[0][prop] : null;
          if (key) {
            (acc[key] = acc[key] || []).push(item);
          }
          return acc;
        }, {});

      const func = groupBy(array, "storeID");
      console.log(func);
      console.log(response.data);
      const transformedObject = Object.entries(func).map(([key, value]) => ({
        id: parseInt(key),
        value: value,
      }));
      transformedObject.forEach((item) => {
        // Calculate the sum of prices
        const sum = item.value.reduce((total, currentValue) => {
          // Check if results exist and have a length greater than 0
          if (currentValue.results[0].prices) {
            // Extract the price from the first result and add it to total
            return total + currentValue.results[0].prices.price;
          } else {
            return total;
          }
        }, 0); // Initialize total with 0

        // Add the sum as a new property to the item object
        item.sumOfPrices = sum;
        setData(transformedObject);
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  //Вывод для проверки

  console.log(data);

  const removeStore = (storeId) => {
    // Filter out the store with the given ID from the data array
    const updatedData = data.filter((store) => store.id != storeId);
    // Update the data array with the filtered data
    setData(updatedData);
    const get = JSON.parse(localStorage.getItem("stores"));
    console.log(get);
    const da = get.filter((store) => store != storeId);
    console.log(da);
    const updatedData3 = JSON.parse(localStorage.getItem("storesName"))
    const updatedData4 = updatedData3.filter((store) => store.id != storeId);
    localStorage.setItem("storesName", JSON.stringify(updatedData4));
    if (updatedData.length < 1) {
      localStorage.removeItem("cart");
      localStorage.removeItem("names");
    }
    localStorage.setItem("stores", JSON.stringify(da));
  };

  let title,storesName;
  if(typeof window !== 'undefined'){
    title = JSON.parse(localStorage.getItem("names"));
    storesName = JSON.parse(localStorage.getItem("storesName"));
    }

  const mergedData = data.map((item) => {
    const match = storesName.find((store) => store.id == item.id);
    if (match) {
      return { ...item, store: match.store, location: match.location };
    }
    return item;
  });

  console.log(mergedData);
  let length = 0;
  if (
    mergedData &&
    mergedData.length > 0 &&
    mergedData[0] &&
    mergedData[0].value
  ) {
    length = mergedData[0].value.length;
  }
  let titleLength = 0; // Declare titleLength variable outside of the conditional block and initialize it

  if (title && title.length > 0) {
    titleLength = title.length; // Update titleLength if conditions are met
  }

  console.log(title);
  console.log(titleLength);
  console.log(length);

  const targetRef = useRef();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        marginLeft: "133px",
      }}
    >
      <Image
        alt="shopping"
        src={basket}
        width={40}
        height={40}
        onClick={() => setState({ isPaneOpen: true })}
      />
      <p className={noir.className}>Cart</p>
      {len === null ? <p>(0)</p> : <p>({len})</p>}
      <SlidingPane
        width="90%"
        overlayClassName="overlay"
        className={noir.className}
        isOpen={state.isPaneOpen}
        title="Cart"
        onRequestClose={() => {
          setState({ isPaneOpen: false });
        }}
      >
        {/* <div
          style={{
            display: "flex",
            flexDirection: "row",
            opacity: "100",
            transition: "all .75s ease",
            flexWrap: "wrap",
          }}
        >
          {data.map((store) => (
            <div
              style={{
                paddingRight: "24px",
              }}
              key={store.id}
            >
              <p>Store ID: {store.id}</p>
              <table>
                {store.value.map((item) => {
                  // Check if results array exists and has at least one item
                  if (item.results && item.results.length > 0) {
                    const result = item.results[0]; // Get the first result
                    if (result.name && result.prices) {
                      return (
                        <tr key={result.productId}>
                          {" "}
                          <td>
                            <p>
                              {result.name} <b>${result.prices.price}</b>
                            </p>
                          </td>
                        </tr>
                      );
                    } else if (result.message) {
                      return (
                        <tr key={result.productId}>
                          <td>
                            <p style={{ color: "red" }}>{result.message}</p>
                          </td>
                        </tr>
                      );
                    }
                  }
                  return null; // Return null if no suitable data found
                })}
              </table>
              <p>
                <b>Total price: {parseFloat(store.sumOfPrices.toFixed(2))}$</b>
              </p>
            </div>
          ))}
        </div> */}
        {length === titleLength ? (
          <div
            ref={targetRef}
            style={{
              display: "flex",
              flexDirection: "row",
              opacity: "100",
              transition: "all .75s ease",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                paddingRight: "30px",
              }}
            >
              {mergedData.length === 0 ? (
                "Nothing here yet"
              ) : (
                <>
                  {title ? (
                    <div style={{ marginRight: "24px" }}>
                      <p style={{display:"none"}}>Lalalala</p>
                      <p
                        style={{
                          width: "144px",
                          height: "69px",
                          alignContent: "center",
                        }}
                      >
                        <b>Products</b>
                      </p>
                      <table>
                        {title.map((tit) => (
                          <tr>
                            <td style={{ borderBottom: "1px solid #000" }}>
                              <p>{tit}</p>
                            </td>
                          </tr>
                        ))}
                      </table>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {mergedData.map((store) => (
              <div
                style={{
                  paddingRight: "24px",
                }}
                key={store.id}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      textAlign: "center",
                      width: "144px",
                      height: "69px",
                      alignContent: "center",
                    }}
                  >
                    <b>{store.location}</b>
                  </p>
                  <button
                    style={{
                      outline: "0px",
                      // marginLeft: "20px"
                      fontSize: "21px",
                      fontWeight: "500",
                      lineHeight: "20px",
                      verticalAlign: "middle",
                      color: "red",
                      border: "0px",
                      cursor: "pointer",
                      backgroundColor: "transparent",
                    }}
                    className={noir.className}
                    onClick={() => removeStore(store.id)}
                    title="Delete Store"
                  >
                    X
                  </button>
                </div>
                <table style={{ width: "100%", textAlign: "center" }}>
                  {store.value.map((item) => {
                    // Check if results array exists and has at least one item
                    if (item.results && item.results.length > 0) {
                      const result = item.results[0]; // Get the first result
                      if (result.name && result.prices) {
                        return (
                          <tr key={result.productId}>
                            {" "}
                            <td
                              style={{
                                borderBottom: "1px solid #000",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {" "}
                              <img
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  paddingRight: "20px",
                                }}
                                src={result.image}
                              />
                              <p>${result.prices.price}</p>
                            </td>
                          </tr>
                        );
                      } else if (result.message) {
                        return (
                          <tr
                            style={{ borderBottom: "1px solid #000" }}
                            key={result.productId}
                          >
                            <td style={{ borderBottom: "1px solid #000" }}>
                              <p style={{ color: "red" }}>{result.message}</p>
                            </td>
                          </tr>
                        );
                      }
                    }
                    return null; // Return null if no suitable data found
                  })}
                </table>
                <p style={{ paddingTop: "16px" }}>
                  <b>
                    Total price: {parseFloat(store.sumOfPrices.toFixed(2))}$
                  </b>
                </p>
              </div>
            ))}
          </div>
        ) : (<>
          <Spiner />
          <p>Checking latest prices for you...</p>
          </>
        )}
        {/* <div ref={targetRef}
          style={{
            display: "flex",
            flexDirection: "row",
            opacity: "100",
            transition: "all .75s ease",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              paddingRight: "30px",
            }}
          >
            {mergedData.length === 0 ? (
              "Nothing here yet"
            ) : (
              <>
                {title ? (
                  <div style={{ marginRight: "24px" }}>
                    <p
                      style={{
                        width: "144px",
                        height: "69px",
                        alignContent: "center",
                      }}
                    >
                      <b>Products</b>
                    </p>
                    <p>{title.length}</p>
                    <table>
                      {title.map((tit) => (
                        <tr>
                          <td style={{ borderBottom: "1px solid #000" }}>
                            <p>{tit}</p>
                          </td>
                        </tr>
                      ))}
                    </table>
                  </div>
                ) : null}
              </>
            )}
          </div>

          {mergedData.map((store) => (
            <div
              style={{
                paddingRight: "24px",
              }}
              key={store.id}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    textAlign: "center",
                    width: "144px",
                    height: "69px",
                    alignContent: "center",
                  }}
                >
                  <b>{store.location}</b>
                </p>
                <button
                  style={{
                    outline: "0px",
                    // marginLeft: "20px"
                    fontSize: "21px",
                    fontWeight: "500",
                    lineHeight: "20px",
                    verticalAlign: "middle",
                    color: "red",
                    border: "0px",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                  }}
                  className={noir.className}
                  onClick={() => removeStore(store.id)}
                  title="Delete Store"
                >
                  X
                </button>
              </div>
              <table style={{ width: "100%", textAlign: "center" }}>
                {store.value.map((item) => {
                  // Check if results array exists and has at least one item
                  if (item.results && item.results.length > 0) {
                    const result = item.results[0]; // Get the first result
                    if (result.name && result.prices) {
                      return (
                        <tr key={result.productId}>
                          {" "}
                          <td style={{ borderBottom: "1px solid #000",display: "flex",
    alignItems: "center"}}> <img style={{width:'30px',height:'30px',paddingRight: "20px"}}src={result.image}/>
                            <p>${result.prices.price}</p>
                          </td>
                        </tr>
                      );
                    } else if (result.message) {
                      return (
                        <tr
                          style={{ borderBottom: "1px solid #000" }}
                          key={result.productId}
                        >
                          <td style={{ borderBottom: "1px solid #000" }}>
                            <p style={{ color: "red" }}>{result.message}</p>
                          </td>
                        </tr>
                      );
                    }
                  }
                  return null; // Return null if no suitable data found
                })}
              </table>
              <p style={{ paddingTop: "16px" }}>
                <b>Total price: {parseFloat(store.sumOfPrices.toFixed(2))}$</b>
              </p>
              {store.value.length === title.length ? 'lalala' : 'mimimi' }
                            <p>{store.value.length}</p>
                            <p>{title.length}</p>
            </div>
          ))}
        </div> */}

        {mergedData.length === 0 ? (
          " "
        ) : (
          <button onClick={() => generatePDF(targetRef, options)}>
            Download PDF
          </button>
        )}
      </SlidingPane>
      {/* {data.map((store) => (
        <ul key={store}>
          <li key={store}>{store.value[0].query}</li>
        </ul>
      ))} */}
      {/* <ul>
        {data.map((store) => (
          <li key={store}>
            {store.results.length !== 0
              ? store.results[0].name
              : "Doesnt sell at this store"}
            <p>
              {store.results.length !== 0
                ? store.results[0].prices.price
                : null}
            </p>
          </li>
        ))}
      </ul> */}
    </div>
  );
};

export default Cart;
