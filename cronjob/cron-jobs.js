import cron from 'node-cron';
import client from '../db/db.js';
import axios from 'axios';

const apiKey = '7Pw4YyfFh8nyIj4fwhiLkhcyBDQKt33fMa93VBVfgaIpzszXVJED7IYZ3tzV8lpq';
const apiURL = 'https://api.wazirx.com/api/v2/tickers';

// Function to update statistics
async function updateStatistics(column) {
    try {
        const response = await axios.get(apiURL, { headers: { 'X-MBX-APIKEY': apiKey } });
        const data = response.data;

        let query = `UPDATE STATISTICS SET ${column}_OLD = ${column}, ${column} = CASE NAME `;
        let values = [];

        for (let item of Object.values(data)) {
            query += 'WHEN $1 THEN $2::double precision ';
            values.push(item.name, parseFloat(item.last));
        }

        query += 'END WHERE NAME IN (' + values.map((_, i) => '$' + (i + 1)).join(',') + ')';
        await client.query(query, values);
        console.log("done");
    } catch(error) {
        console.error(error);
    }
}

// Schedule tasks
cron.schedule('*/5 * * * *', () => updateStatistics('FIVE_MIN'));
cron.schedule('0 * * * *', () => updateStatistics('ONE_HOUR'));
cron.schedule('0 0 * * *', () => updateStatistics('ONE_DAY'));
cron.schedule('0 0 */7 * *', () => updateStatistics('SEVEN_DAYS'));
