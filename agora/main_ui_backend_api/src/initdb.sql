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
    device_id text,
    temperature_celsius float,
    humidity_percent float,
    power_usage_kwh float,
    operating_mode text
);

-- Seeding cameras
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cameras) THEN
        INSERT INTO cameras (name, description, rtspuri)
        VALUES
            ('Camera 1', 'Aisle Camera', 'rtsp://rtsp-stream-aisle:8554/stream'),
            ('Camera 2', 'Produce Camera', 'rtsp://rtsp-stream-zoom:8555/stream');
    END IF;
END $$;

-- Seeding regions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM regions) THEN
        INSERT INTO regions (name, description, camera_id, x1, y1, x2, y2, threshold)
        VALUES
            ('Region 1', 'Entrance Region', 1, 0, 0, 100, 100, 70),
            ('Region 2', 'Aisle Region', 1, 0, 0, 100, 100, 70);
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

