CREATE TABLE PRODUCTS(
    id serial primary key, 
    name varchar(50) not null,
    price numeric(10,2) not null,
    quantity integer not null
);
