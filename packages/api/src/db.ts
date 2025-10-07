import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool;

/**
 * Initializes the database connection pool.
 */
export const initDb = () => {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log('Database connection pool successfully created.');
    } catch (error) {
        console.error('Database connection pool creation failed:', error);
        throw error;
    }
};

/**
 * Returns the database connection pool.
 * @returns {Pool} The MySQL connection pool.
 */
export const getDb = (): Pool => {
    if (!pool) {
        throw new Error('Database has not been initialized. Please call initDb() first.');
    }
    return pool;
};
