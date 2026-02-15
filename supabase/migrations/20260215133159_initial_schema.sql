CREATE TABLE "clients" (
  "id" int PRIMARY KEY,
  "phone_number" text,
  "phonebook_name" text,
  "name" text,
  "surname" text,
  "address" text
);

CREATE TABLE "vehicles" (
  "id" int PRIMARY KEY,
  "vin" text UNIQUE,
  "registration" text UNIQUE,
  "make" text,
  "model" text,
  "year" int,
  "distance" int,
  "client" int,
  "engine" text,
  "company" text
);

CREATE TABLE "engines" (
  "code" text PRIMARY KEY,
  "displacement" int,
  "power" int,
  "fuel" text
);

CREATE TABLE "employees" (
  "id" int PRIMARY KEY,
  "name" text,
  "surname" text
);

CREATE TABLE "work_orders" (
  "id" int PRIMARY KEY,
  "time_of_creation" timestamp,
  "description" text,
  "status" text,
  "notes_from_worker" text,
  "distance" int,
  "vehicle" int,
  "employee" int
);

CREATE TABLE "companies" (
  "oib" text PRIMARY KEY,
  "name" text,
  "address" text
);

ALTER TABLE "vehicles" ADD FOREIGN KEY ("client") REFERENCES "clients" ("id");

ALTER TABLE "vehicles" ADD FOREIGN KEY ("engine") REFERENCES "engines" ("code");

ALTER TABLE "vehicles" ADD FOREIGN KEY ("company") REFERENCES "companies" ("oib");

ALTER TABLE "work_orders" ADD FOREIGN KEY ("vehicle") REFERENCES "vehicles" ("id");

ALTER TABLE "work_orders" ADD FOREIGN KEY ("employee") REFERENCES "employees" ("id");
