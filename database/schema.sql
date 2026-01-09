-- 1. Tabla de EXPANSIONES (Sets)
-- Guardamos info del set para filtrar por ejemplo "Base Set" o "Silver Tempest"
CREATE TABLE IF NOT EXISTS sets (
    id VARCHAR(50) PRIMARY KEY, -
    name VARCHAR(100) NOT NULL,
    series VARCHAR(100),
    release_date DATE,
    total_cards INT,
    symbol_url TEXT -- Icono del set
);

-- 2. Tabla de CARTAS (Datos fijos)
CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(50) PRIMARY KEY, 
    name VARCHAR(100) NOT NULL,
    supertype VARCHAR(50), -- 'Pokémon', 'Trainer', 'Energy'
    subtypes TEXT[],       -- Array: ['Stage 1', 'VMAX']
    types TEXT[],          -- Array: ['Fire', 'Water']
    set_id VARCHAR(50) REFERENCES sets(id), 
    rarity VARCHAR(50),
    image_small TEXT,      -- URL imagen pequeña
    image_large TEXT,      -- URL imagen grande
    market_price DECIMAL(10, 2) DEFAULT 0 -- Precio actual (cacheado para búsquedas rápidas)
);

-- 3. Tabla HISTÓRICO DE PRECIOS (Series Temporales)
-- Aquí es donde se guardan los datos cada día
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    card_id VARCHAR(50) REFERENCES cards(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de USUARIOS (Para el futuro Login/JWT)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) DEFAULT 100.00, -- Monedas para abrir sobres
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de COLECCIÓN (Cartas que tiene el usuario)
CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    card_id VARCHAR(50) REFERENCES cards(id),
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para que las búsquedas vayan rápido
CREATE INDEX idx_price_history_card_id ON price_history(card_id);
CREATE INDEX idx_cards_set_id ON cards(set_id);