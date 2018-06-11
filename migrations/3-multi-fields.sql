ALTER table fields
  ADD requires_verification boolean NOT NULL DEFAULT false,
  ALTER collector TYPE jsonb USING jsonb_build_array(collector),
  ALTER type_status TYPE jsonb USING jsonb_build_array(type_status);

ALTER table fields
  RENAME collector TO collectors;

ALTER table fields
  RENAME type_status TO type_statuses;
