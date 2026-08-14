const Database = require("better-sqlite3");

const db = new Database("ecommerce.db");


/* ================= PRODUCTS ================= */

db.prepare(`
CREATE TABLE IF NOT EXISTS products (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    category TEXT NOT NULL,

    price REAL NOT NULL,

    old_price REAL DEFAULT 0,

    description TEXT,

    image TEXT,

    stock INTEGER DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`).run();


/* ================= ORDERS ================= */

db.prepare(`
CREATE TABLE IF NOT EXISTS orders (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    customer_name TEXT NOT NULL,

    phone TEXT NOT NULL,

    email TEXT,

    address TEXT NOT NULL,

    payment_method TEXT NOT NULL,

    transaction_id TEXT,

    subtotal REAL NOT NULL,

    delivery_charge REAL NOT NULL,

    total REAL NOT NULL,

    status TEXT DEFAULT 'Pending',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)
`).run();


/* ================= ORDER ITEMS ================= */

db.prepare(`
CREATE TABLE IF NOT EXISTS order_items (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    order_id INTEGER NOT NULL,

    product_id INTEGER NOT NULL,

    product_name TEXT NOT NULL,

    price REAL NOT NULL,

    quantity INTEGER NOT NULL

)
`).run();


module.exports = db;