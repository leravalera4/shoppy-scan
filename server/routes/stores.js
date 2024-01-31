const express = require('express');
const router = express.Router();
const storesData = require('../data/stores');

router.get('/', (req, res) => {
  const availableStores = storesData.map(store => store.name);
  res.json(availableStores);
});

router.get('/:store', (req, res) => {
    console.log('Handling request for /api/stores/:store');
    const storeName = req.params.store;
    const selectedStoreData = storesData.find(data => data.name === storeName);
  
    if (selectedStoreData) {
      res.json({ locations: selectedStoreData.locations });
    } else {
      res.status(404).json({ error: 'Store not found' });
    }
  });
  
module.exports = router;
