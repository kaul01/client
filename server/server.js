const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const {response} = require("express");
const config = require('./config');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/stockCryptoDB')
    .then(() => {
        console.log('MongoDB connected...');
    })

const stockSchema = new mongoose.Schema({
    symbol: String,
    price: Number,
    timestamp: { type: Date, default: Date.now }
});

const Stock = mongoose.model('Stock', stockSchema);

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const symbols = ['ETH', 'BTC', 'USDT', 'BNB', 'SOL'];

const dbEntry = async (data) => {
    const stockData = {
        symbol: data.name,
        price: data.rate, // Adjust based on the API response structure
    };
    const stock = new Stock(stockData);
    await stock.save();
    io.emit('stockData', stockData);
}
const fetchStockData = async () => {
    try {
        const responses = await Promise.all(symbols.map(symbol =>
            axios.post(`https://api.livecoinwatch.com/coins/single`, {
                "currency":"USD",
                "code": symbol,
                "meta":true
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': config.secretKey
                }
            }).then(res => dbEntry(res.data))
        ));

    } catch (error) {
        console.error('Error fetching stock data:', error);
    }
};

// Fetch stock data every few seconds
setInterval(fetchStockData, 5000);

// API to get recent 20 entries
app.get('/api/stocks/:symbol', async (req, res) => {
    const { symbol } = req.params;
    const stocks = await Stock.find({ symbol }).sort({ timestamp: -1 }).limit(20);
    res.json(stocks);
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
