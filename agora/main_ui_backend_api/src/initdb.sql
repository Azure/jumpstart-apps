-- Your SQL initialization script here
CREATE TABLE IF NOT EXISTS cameras (
    id SERIAL PRIMARY KEY,
    name text,
    description text,
    rtspuri text
);

CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    name text,
    description text,
    x1 int,
    y1 int,
    x2 int,
    y2 int
);

CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name text NOT NULL,
    description text,
    x1 int,
    y1 int,
    x2 int,
    y2 int,
    camera_id INT REFERENCES cameras(id),
    threshold int
);

CREATE TABLE IF NOT EXISTS hvacs (
    id SERIAL PRIMARY KEY,
    name text,
    description text,
    pressure int,
    temperature int,
    humidity int,
    power int,
    mode text,
    status text
);

-- Seeding cameras
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cameras) THEN
        INSERT INTO cameras (name, description, rtspuri)
        VALUES
            ('Camera 1', 'Entrance Camera', 'rtsp://camera1/stream'),
            ('Camera 2', 'Checkout Camera', 'rtsp://camera2/stream'),
            ('Camera 3', 'Fridge Camera', 'rtsp://camera3/stream'),
            ('Camera 4', 'Rear Camera', 'rtsp://camera3/stream'),
            ('Camera 5', 'Front Camera', 'rtsp://camera3/stream');
    END IF;
END $$;

-- Seeding regions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM regions) THEN
        INSERT INTO regions (name, description, camera_id, x1, y1, x2, y2, threshold)
        VALUES
            ('Region 1', 'Entrance Region', 1, 0, 0, 100, 100, 70),
            ('Region 2', 'Checkout Region', 2, 100, 0, 200, 100, 70),
            ('Region 3', 'Fridge Region', 3, 0, 100, 100, 200, 70),
            ('Region 4', 'Oven Region', 4, 100, 100, 200, 200, 70),
            ('Region 5', 'Storage Region', 5, 200, 100, 300, 200, 70);
    END IF;
END $$;

-- Seeding zones
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM zones) THEN
        INSERT INTO zones (name, description, x1, y1, x2, y2)
        VALUES
            ('Zone 1', 'Fruit Section', 0, 0, 50, 50),
            ('Zone 2', 'Vegetable Section', 50, 0, 100, 50),
            ('Zone 3', 'Bread Section', 0, 50, 50, 100),
            ('Zone 4', 'Dairy Section', 50, 50, 100, 100),
            ('Zone 5', 'Beverage Section', 100, 50, 150, 100);
    END IF;
END $$;

-- Seeding hvacs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM hvacs) THEN
        INSERT INTO hvacs (name, description, pressure, temperature, humidity, power, mode, status)
        VALUES
            ('HVAC 1', 'Main AC', 1, 200, 30, 1, 'Heating', 'Active'),
            ('HVAC 2', 'Warehouse AC', 1, 250, 20, 1, 'Heating', 'Active'),
            ('HVAC 3', 'Oven', 1, 180, 40, 1, 'Heating', 'Active'),
            ('HVAC 4', 'Refrigerator', 1, 220, 35, 1, 'Cooling', 'Active'),
            ('HVAC 5', 'Roasting Oven', 1, 300, 25, 1, 'Heating', 'Error');
    END IF;
END $$;