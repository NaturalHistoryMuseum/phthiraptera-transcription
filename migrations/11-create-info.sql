CREATE TABLE info (
	barcode VARCHAR(9) NOT NULL,
	thumbnails JSONB,
	sciName VARCHAR(255),
	PRIMARY KEY (barcode)
)
