import pg from 'pg';

const { Client } = pg;

const client = new Client({
    connectionString: 'postgres://jzhkqzll:N3zxnxTxGr8V-Ok9qitTcQeb2XTn92Yp@floppy.db.elephantsql.com/jzhkqzll',
    ssl: {
        rejectUnauthorized: false
    }
});

export default client;