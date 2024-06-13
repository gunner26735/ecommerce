CREATE TABLE USERS(
    id serial primary key, 
    name varchar(50) not null,
    email varchar(50) not null unique,
    password varchar(50) not null
);
