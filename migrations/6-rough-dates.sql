ALTER table fields
  ADD collection_year VARCHAR(4),
  ADD collection_month VARCHAR(2),
  ADD collection_day VARCHAR(2);

UPDATE fields SET
  collection_year = EXTRACT(year from collection_date),
  collection_month = EXTRACT(month from collection_date),
  collection_day = EXTRACT(day from collection_date);

ALTER table fields
  DROP collection_date;
