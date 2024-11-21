const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Optional

const app = express();

// Enable CORS (if needed)
app.use(cors());

// Backend API to fetch data from Yahoo Finance
app.get('/api/finance', async (req, res) => {
  try {
    queries = req.query;
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${queries.ticker}`, {
      params: {
        range: '1d',
        interval: '5m',
        region: 'US',
        lang: 'en-US',
      },
    });

    const yahooData = response.data.chart.result[0];
    const volDay = yahooData.indicators.quote[0].volume

    console.log(volDay);

    const totalVol = (Array.isArray(volDay) ? volDay : []).reduce((accumulator, currentValue) => {
        currentValue = currentValue || 0; // Default to 0 if falsy
        return accumulator + currentValue;
      }, 0);
      

    const transformedData = {
        Symbol: yahooData.meta.symbol,
        Name: yahooData.meta.longName,
        avgVol: yahooData.meta.regularMarketVolume,
        totalVol: totalVol,
        volRatio: totalVol/yahooData.meta.regularMarketVolume


    }
    console.log(transformedData)
    // Send the fetched data to the frontend
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
