CREATE TABLE `collections` (`id` text PRIMARY KEY NOT NULL,`slug` text NOT NULL,`title` text NOT NULL,`description` text,`release_date` text,`status` text DEFAULT 'draft' NOT NULL,`image_key` text);
--> statement-breakpoint
CREATE UNIQUE INDEX `collections_slug_unique` ON `collections` (`slug`);
--> statement-breakpoint
CREATE TABLE `artworks` (`id` text PRIMARY KEY NOT NULL,`slug` text NOT NULL,`title` text NOT NULL,`category` text NOT NULL,`description` text,`species` text,`materials` text,`binding` text,`dimensions` text,`year` integer,`edition_size` integer,`signature` text,`framing` text,`price_cents` integer,`currency` text DEFAULT 'ZAR' NOT NULL,`stock_total` integer DEFAULT 0 NOT NULL,`status` text DEFAULT 'draft' NOT NULL,`featured` integer DEFAULT 0 NOT NULL,`collection_id` text,`images_json` text DEFAULT '[]' NOT NULL,`created_at` text NOT NULL, CHECK(stock_total >= 0), CHECK(edition_size IS NULL OR edition_size >= 1), CHECK(edition_size IS NULL OR stock_total <= edition_size));
--> statement-breakpoint
CREATE UNIQUE INDEX `artworks_slug_unique` ON `artworks` (`slug`);
--> statement-breakpoint
CREATE TABLE `journal` (`id` text PRIMARY KEY NOT NULL,`slug` text NOT NULL,`title` text NOT NULL,`body` text NOT NULL,`summary` text,`published_at` text,`image_key` text,`seo_description` text,`status` text DEFAULT 'draft' NOT NULL);
--> statement-breakpoint
CREATE UNIQUE INDEX `journal_slug_unique` ON `journal` (`slug`);
--> statement-breakpoint
CREATE TABLE `shipping_zones` (`id` text PRIMARY KEY NOT NULL,`name` text NOT NULL,`countries_json` text NOT NULL,`price_cents` integer NOT NULL,`active` integer DEFAULT 0 NOT NULL);
--> statement-breakpoint
CREATE TABLE `orders` (`id` text PRIMARY KEY NOT NULL,`status` text NOT NULL,`customer_name` text NOT NULL,`customer_email` text NOT NULL,`address_json` text NOT NULL,`shipping_zone_id` text NOT NULL,`shipping_cents` integer NOT NULL,`subtotal_cents` integer NOT NULL,`total_cents` integer NOT NULL,`currency` text NOT NULL,`created_at` integer NOT NULL,`expires_at` integer NOT NULL,`paid_at` integer,`provider_payment_id` text);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_provider_payment_id_unique` ON `orders` (`provider_payment_id`);
--> statement-breakpoint
CREATE TABLE `order_items` (`id` text PRIMARY KEY NOT NULL,`order_id` text NOT NULL,`artwork_id` text NOT NULL,`title` text NOT NULL,`quantity` integer NOT NULL CHECK(quantity > 0),`unit_cents` integer NOT NULL CHECK(unit_cents >= 0));
--> statement-breakpoint
CREATE INDEX `order_items_artwork_id_idx` ON `order_items` (`artwork_id`);
--> statement-breakpoint
CREATE TABLE `payment_events` (`id` text PRIMARY KEY NOT NULL,`order_id` text NOT NULL,`payload_json` text NOT NULL,`received_at` integer NOT NULL);
--> statement-breakpoint
CREATE TABLE `site_content` (`key` text PRIMARY KEY NOT NULL,`value` text NOT NULL);
--> statement-breakpoint
CREATE TRIGGER `reserve_artwork` BEFORE INSERT ON `order_items` BEGIN SELECT CASE WHEN (SELECT status FROM artworks WHERE id=NEW.artwork_id) != 'available' OR (SELECT price_cents FROM artworks WHERE id=NEW.artwork_id) != NEW.unit_cents OR NEW.quantity + (SELECT COALESCE(SUM(oi.quantity),0) FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE oi.artwork_id=NEW.artwork_id AND (o.status='paid' OR (o.status='pending' AND o.expires_at > unixepoch()*1000))) > (SELECT stock_total FROM artworks WHERE id=NEW.artwork_id) THEN RAISE(ABORT,'artwork unavailable') END; END;
--> statement-breakpoint
CREATE TRIGGER `guard_paid_stock` BEFORE UPDATE OF status ON `orders` WHEN NEW.status='paid' BEGIN SELECT CASE WHEN EXISTS(SELECT 1 FROM order_items oi JOIN artworks a ON a.id=oi.artwork_id WHERE oi.order_id=NEW.id AND oi.quantity + (SELECT COALESCE(SUM(other.quantity),0) FROM order_items other JOIN orders o ON o.id=other.order_id WHERE other.artwork_id=oi.artwork_id AND other.order_id!=NEW.id AND (o.status='paid' OR (o.status='pending' AND o.expires_at > unixepoch()*1000))) > a.stock_total) THEN RAISE(ABORT,'stock claimed before payment confirmation') END; END;
--> statement-breakpoint
CREATE TRIGGER `guard_stock_edit` BEFORE UPDATE OF stock_total ON `artworks` BEGIN SELECT CASE WHEN NEW.stock_total < (SELECT COALESCE(SUM(oi.quantity),0) FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE oi.artwork_id=NEW.id AND (o.status='paid' OR (o.status='pending' AND o.expires_at > unixepoch()*1000))) THEN RAISE(ABORT,'stock below committed orders') END; END;
--> statement-breakpoint
CREATE VIEW `public_artworks` AS SELECT a.*, a.stock_total - (SELECT COALESCE(SUM(oi.quantity),0) FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE oi.artwork_id=a.id AND (o.status='paid' OR (o.status='pending' AND o.expires_at > unixepoch()*1000))) AS available_stock FROM artworks a;
