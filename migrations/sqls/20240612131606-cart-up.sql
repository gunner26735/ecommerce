CREATE TABLE CART(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    product_add DATE NOT NULL,
    CONSTRAINT fk_user_order FOREIGN KEY(user_id) REFERENCES users(id),
    CONSTRAINT fk_product_order FOREIGN KEY(product_id) REFERENCES products(id)
);