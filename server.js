import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import axios from 'axios';
import client from "./db/db.js";
import "./cronjob/cron-jobs.js";

client.connect(err => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to the database');
    }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());

app.use(express.static(__dirname));

app.post("/set-data", async (req, res) => {
    const apiKey = '7Pw4YyfFh8nyIj4fwhiLkhcyBDQKt33fMa93VBVfgaIpzszXVJED7IYZ3tzV8lpq';
    const apiURL = 'https://api.wazirx.com/api/v2/tickers';

    try {
        const response = await axios.get(apiURL, {
            headers: {
                'X-MBX-APIKEY': apiKey
            }
        });

        // Get the data from the response
        const data = response.data;

        // Sort the data by volume in descending order
        const sortedData = Object.values(data).sort((a, b) => parseFloat(b.last) - parseFloat(a.last));

        // Get the top 10 results
        const top10 = sortedData.slice(0, 10);

        await client.query(`
            DROP TABLE IF EXISTS INFO;
            CREATE TABLE INFO(
                NAME VARCHAR(100),
                LAST FLOAT,
                BUY FLOAT,
                SELL FLOAT,
                VOLUME FLOAT,
                BASE_UNIT FLOAT
            );
        `);

        for(let item of top10){
            await client.query(`
                INSERT INTO STATISTICS (NAME,FIVE_MIN_OLD,FIVE_MIN,ONE_HOUR_OLD,ONE_HOUR,ONE_DAY_OLD,ONE_DAY,SEVEN_DAYS_OLD,SEVEN_DAYS,LAST)  
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, 
            [item.name, item.last, item.last, item.last, item.last, item.last, item.last, item.last, item.last,item.last]);
        }
        
        // Map the results to include only the required fields
        const result = top10.map(item => ({
            name: item.name,
            last: parseFloat(item.last),
            buy: parseFloat(item.buy),
            sell: parseFloat(item.sell),
            volume: parseFloat(item.volume),
            base_unit: parseFloat(item.base_unit),
        }));
        
        for(let item of result){
            await client.query(`
                INSERT INTO INFO (NAME,LAST,BUY,SELL,VOLUME,BASE_UNIT)  
                VALUES ($1,$2,$3,$4,$5,$6)`, 
            [item.name, item.last, item.buy, item.sell, item.volume, item.base_unit]);
        }
        

        return res.status(200).send({
            success:true,
            message:"Added to database"
        })
    } catch (error) {
        console.error(`Error: ${error}`);
        res.status(500).json({ error: 'An error occurred while trying to fetch data from the API' });
    }
});

app.get("/get-data",async (req,res) => {
    try {
        let result = await client.query(`
            SELECT * FROM INFO        
        `);
        return res.status(200).send({result: result.rows});
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message:"error"
        })
    }
})

app.get("/get-data/:name",async (req,res) => {
    try {
        const {name} = req.params;
        let result = await client.query(`
            SELECT * FROM STATISTICS WHERE NAME=$1  
        `,[name+"/INR"])
        if (!result.rows[0]){
            return res.status(404).send({
                message:"not found"
            })
        }
        return res.status(200).send(result.rows[0]);
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message:"error"
        })
    }
})


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, function () {
    console.log('App is listening on port 3000');
});
