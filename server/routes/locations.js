const express = require("express");
const router = express.Router();
router.use(express.json());
const axios = require("axios");
const storesData = require('../data/stores');

router.post("/", async (req, res) => {
  const selectedStoresID = req.body.selectedStoresID;
  //console.log(selectedStoresID);
  const result = [];
  for (let selectedStore of selectedStoresID) {
    const searchText = req.body.searchText; // Получаем значение из текстового поля
    // Создаем URL для второго запроса на основе полученных значений
    const apiUrl = `https://grocerytracker.ca/api/pc/search/${selectedStore}/${searchText}`;
    const response = await axios.get(apiUrl);
    result.push([...response.data.results]);
  }
  //const final = result.sort(())
  const flattenedArray = result.reduce((acc, curr) => acc.concat(curr), []);
  const uniqueImageUrls = [
    ...new Set(flattenedArray.map((product) => product.image)),
  ];
  const restt = {};

  flattenedArray.forEach((obj) => {
    const imageUrl = obj.image;

    if (uniqueImageUrls.includes(imageUrl)) {
      if (!restt[imageUrl]) {
        restt[imageUrl] = [];
      }

      const { image, ...rest } = obj;
      restt[imageUrl].push(rest);
    }
  });
 console.log(restt);
  console.log(Object.keys(restt));
  const arrayPhotos = Object.keys(restt);


  const storeName = (id)=>{
    for (const store of storesData) {
      const locations = store.locations;
    
      // Перебираем все расположения внутри магазина
      for (const locationKey in locations) {
        const locationID = locations[locationKey];//цифра
        if (locationID == id)
        return locationKey;
  }
}
}

const final = [];

  arrayPhotos.forEach((photo) => {
    const productsForPhoto = restt[photo];
    const firstName = productsForPhoto[0].name;
    const brand = productsForPhoto[0].brand;
    const products = productsForPhoto.map((product)=>{
      const result = {prices: product.prices,productID:product.code,storeID: product.storeID,store:storeName(product.storeID) }
     return result
    });

    final.push({ photo, firstName,brand, products })
    
});

  console.log(final)
  res.json(final);


  //res.json(Object.keys(restt));
});

module.exports = router;

