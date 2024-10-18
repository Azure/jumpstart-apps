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

    CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        name text NOT NULL,
        description text,
        camera_id INT REFERENCES cameras(id)
    );

    -- Seeding products table with sample data for various kinds of tomatoes and other vegetables
    INSERT INTO products (name, description, price, stock, photopath, category)
    SELECT *
    FROM (VALUES
        ('Cherry Tomato', 'Small, round, and sweet tomatoes', 2.99, 100, '/images/cherry_tomato.jpg', 'Tomato'),
        ('Beefsteak Tomato', 'Large, juicy tomatoes perfect for slicing', 3.49, 50, '/images/beefsteak_tomato.jpg', 'Tomato'),
        ('Roma Tomato', 'Plum tomatoes ideal for sauces', 2.79, 75, '/images/roma_tomato.jpg', 'Tomato'),
        ('Heirloom Tomato', 'Variety of colors and flavors, non-hybrid', 4.99, 30, '/images/heirloom_tomato.jpg', 'Tomato'),
        ('Grape Tomato', 'Small, oblong, and sweet tomatoes', 3.19, 120, '/images/grape_tomato.jpg', 'Tomato'),
        ('Cucumber', 'Fresh and crisp cucumbers', 1.99, 200, '/images/cucumber.jpg', 'Vegetable'),
        ('Bell Pepper', 'Sweet and crunchy bell peppers', 2.49, 150, '/images/bell_pepper.jpg', 'Vegetable'),
        ('Carrot', 'Crunchy and sweet carrots', 1.29, 300, '/images/carrot.jpg', 'Vegetable'),
        ('Broccoli', 'Fresh and healthy broccoli', 2.99, 80, '/images/broccoli.jpg', 'Vegetable'),
        ('Spinach', 'Leafy green spinach', 3.49, 60, '/images/spinach.jpg', 'Vegetable')
    ) AS data
    WHERE NOT EXISTS (SELECT 1 FROM products);

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

    INSERT INTO regions (name, description, camera_id)
    SELECT *
    FROM (VALUES
        ('Region 1', 'Entrance Area', 1),
        ('Region 2', 'Checkout Area', 2),
        ('Region 3', 'Fridge Area', 3),
        ('Region 4', 'Oven Area', 4),
        ('Region 5', 'Produce Section', 1),
        ('Region 6', 'Dairy Section', 2),
        ('Region 7', 'Bakery Section', 3)
    ) AS data
    WHERE NOT EXISTS (SELECT 1 FROM regions);

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