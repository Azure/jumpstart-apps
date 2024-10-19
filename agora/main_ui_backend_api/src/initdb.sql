    -- Your SQL initialization script here
    CREATE TABLE IF NOT EXISTS products (productId SERIAL PRIMARY KEY, name text, description text, price numeric, stock int, photopath text, category text);
    CREATE TABLE IF NOT EXISTS Orders (orderID SERIAL PRIMARY KEY, orderDate timestamp, orderdetails JSON, storeId INT, cloudsynced BOOLEAN DEFAULT FALSE);
    CREATE TABLE IF NOT EXISTS checkout_type (id SERIAL PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS checkout (id INTEGER PRIMARY KEY, type INTEGER REFERENCES checkout_type(id), avgprocessingtime INTEGER, closed BOOLEAN);
    CREATE TABLE IF NOT EXISTS checkout_history (timestamp TIMESTAMPTZ, checkout_id INT REFERENCES checkout(id), checkout_type INT, queue_length INT, average_wait_time_seconds INT, PRIMARY KEY (timestamp, checkout_id));
    CREATE TABLE IF NOT EXISTS cameras (id SERIAL PRIMARY KEY, name text, description text);
    CREATE TABLE IF NOT EXISTS zones (id SERIAL PRIMARY KEY, name text, description text);
    CREATE TABLE IF NOT EXISTS ovens (id SERIAL PRIMARY KEY, name text, description text);
    CREATE TABLE IF NOT EXISTS fridges (id SERIAL PRIMARY KEY, name text, description text);

    -- seeding cameras
    INSERT INTO cameras (name, description)
    SELECT *
    FROM (VALUES
        ('Camera 1', 'Entrance Camera'),
        ('Camera 2', 'Checkout Camera'),
        ('Camera 3', 'Fridge Camera'),
        ('Camera 4', 'Oven Camera')
    ) AS data
    WHERE NOT EXISTS (SELECT 1 FROM cameras);

    -- seeding zones
    INSERT INTO zones (name, description)
    SELECT *
    FROM (VALUES
        ('Zone 1', 'Fruit Section'),
        ('Zone 2', 'Vegetable Section'),
        ('Zone 3', 'Bread Section'),
        ('Zone 4', 'Dairy Section'),
        ('Zone 5', 'Beverage Section'),
        ('Zone 6', 'Snack Section'),
        ('Zone 7', 'Egg Section')
    ) AS data
    WHERE NOT EXISTS (SELECT 1 FROM zones);

    -- seeding ovens
    INSERT INTO ovens (name, description)
    SELECT *
    FROM (VALUES
        ('Oven 1', 'Bread Oven'),
        ('Oven 2', 'Pizza Oven'),
        ('Oven 3', 'Cake Oven')
    ) AS data
    WHERE NOT EXISTS (SELECT 1 FROM ovens);

    -- seeding fridges
    INSERT INTO fridges (name, description)
    SELECT *
    FROM (VALUES
        ('Fridge 1', 'Dairy Fridge'),
        ('Fridge 2', 'Meat Fridge'),
        ('Fridge 3', 'Vegetable Fridge')
    ) AS data
    WHERE NOT EXISTS (SELECT 1 FROM fridges);