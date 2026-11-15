CREATE TABLE IF NOT EXISTS market_categories (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_key TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO market_categories (id,slug,title,description,sort_order,active) VALUES
('a4e46b34-64f9-4ee4-a001-75f24a584001','a4-drawings','Original A4 botanical drawings','Original botanical drawings in A4 format.',1,1),
('a4e46b34-64f9-4ee4-a001-75f24a584002','mini-canvases','Mini botanical canvases','Original hand drawn mini botanical canvases.',2,1),
('a4e46b34-64f9-4ee4-a001-75f24a584003','japanese-journals','Japanese botanical journals','Hand bound Japanese botanical journals.',3,1),
('a4e46b34-64f9-4ee4-a001-75f24a584004','botanical-bookmarks','Botanical bookmarks','Hand drawn botanical bookmarks.',4,1);
