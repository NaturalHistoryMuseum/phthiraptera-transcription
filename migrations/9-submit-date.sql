ALTER TABLE fields
  ADD date timestamp;

UPDATE fields SET date=images.access_date FROM images WHERE fields.barcode=images.barcode AND images.access_date is not NULL;
