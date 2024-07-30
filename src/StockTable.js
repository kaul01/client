import React, { useState, useEffect } from 'react';
import './StockTable.css'
import socketIOClient from 'socket.io-client';

const ENDPOINT = "http://localhost:3000";

const StockTable = () => {
    const [data, setData] = useState([]);
    const [symbol, setSymbol] = useState('Ethereum');
    const [newSymbol, setNewSymbol] = useState('');

    const [selectedOption, setSelectedOption] = useState('Ethereum');

    const options = [
        { label: 'Ethereum', value: 'Ethereum' },
        { label: 'Bitcoin', value: 'Bitcoin' },
        { label: 'Tether', value: 'Tether' },
        { label: 'BNB', value: 'BNB' },
        { label: 'Solana', value: 'Solana' }
    ];

    useEffect(() => {
        const socket = socketIOClient(ENDPOINT);

        socket.on('stockData', (stockData) => {
            if (stockData.symbol === symbol) {
                fetchRecentData(symbol);
            }
        });

        fetchRecentData(symbol);

        return () => socket.disconnect();
    }, [symbol, Date.now()]);

    const fetchRecentData = async (symbol) => {
        const response = await fetch(`/api/stocks/${symbol}`);
        const data = await response.json();
        setData(data);
    };


    return (
        <div className="section">
            <div className="header">
                <h1>Real-time Stock and Crypto Data</h1>
            </div>
            <div className="dropdown">
                <select className="selectBox" value={selectedOption} onChange={ async (e) => {
                    setSelectedOption(e.target.value)
                    setSymbol(e.target.value);
                }}>
                    <option value="" disabled>Select an option</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            {/*<button onClick={() => document.getElementById('modal').style.display = 'block'}>Change Stock/Crypto*/}
            {/*</button>*/}
            <div className="stockTable">
                <table>
                    <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Price (USD)</th>
                        <th>Timestamp</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((item, index) => (
                        <tr key={index} >
                            <td>{item.symbol}</td>
                            <td>{item.price}</td>
                            <td>{new Date(item.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockTable;