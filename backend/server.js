const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Optional
const yahooFinance = require('yahoo-finance2').default;



const app = express();

// Enable CORS (if needed)
app.use(cors());


async function getAvgVolume(symbol) {
    try {
        yahooFinance.suppressNotices['yahooSurvey'];
        const result = await yahooFinance.quote(symbol);
        return({
            avgVol3Month: result.averageDailyVolume3Month,
            avgVol10Day: result.averageDailyVolume10Day
        });

    } catch (error) {
      console.error('Error:', error);
    }
  }



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
    const avgVol = await getAvgVolume(queries.ticker);
      

    const transformedData = {
        Symbol: yahooData.meta.symbol,
        Name: yahooData.meta.longName,
        avgVol3Month: avgVol.avgVol3Month,
        avgVol10Day: avgVol.avgVol10Day,
        volToday: yahooData.meta.regularMarketVolume,
        volRatio3Month: yahooData.meta.regularMarketVolume/avgVol.avgVol3Month,
        volRatio10Day: yahooData.meta.regularMarketVolume/avgVol.avgVol10Day
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
