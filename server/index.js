const express = require('express')
const storesRouter = require('./routes/stores');
const locations = require('./routes/locations');
const cors = require('cors');
const app = express();
const PORT = 8080;

app.use(cors()); 

app.use('/api/stores', storesRouter);
app.use('/api/updateLocation', locations);



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
