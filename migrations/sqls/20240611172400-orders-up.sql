CREATE TABLE ORDERS(
    id serial primary key, 
    user_id integer not null,
    product_id integer not null,
    quantity integer not null,
    price numeric(10,2) not null,
    purchase_date date not null,
    CONSTRAINT fk_user_order FOREIGN KEY(user_id) REFERENCES users(id),
    CONSTRAINT fk_product_order FOREIGN KEY(product_id) REFERENCES products(id)
);
