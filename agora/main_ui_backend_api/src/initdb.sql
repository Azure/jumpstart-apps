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
    y2 int,
    camera_id INT REFERENCES cameras(id)
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
            ('Freezer Aisle', 'Aisle Camera', 'rtsp://rtsp-stream-aisle:8554/stream'),
            ('Produce Section', 'Produce Camera', 'rtsp://rtsp-stream-zoom:8555/stream');
    END IF;
END $$;

-- Seeding regions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM regions) THEN
        INSERT INTO regions (name, description, camera_id, x1, y1, x2, y2, threshold)
        VALUES
            ('Freezer View', 'Entrance Region', 1, 0, 0, 1000, 1000, 70),
            ('Produce View', 'Aisle Region', 2, 0, 0, 1000, 1000, 70);
    END IF;
END $$;

-- Seeding zones
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM zones) THEN
        INSERT INTO zones (name, description, x1, y1, x2, y2, camera_id)
        VALUES
            ('Frozen Food', 'Frozen', 0, 0, 200, 200, 1),
            ('Produce Section', 'Vegetable', 0, 0, 200, 200, 2);
    END IF;
END $$;

