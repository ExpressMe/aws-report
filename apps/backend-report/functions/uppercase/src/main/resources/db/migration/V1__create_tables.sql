create table if not exists "users"
(
  id         varchar not null,
  name       varchar not null,
  email      varchar not null,
  created_at timestamp,
  updated_at timestamp,
  primary key (id),
  constraint email_unique unique (email)
);
