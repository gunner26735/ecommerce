const { pool } = require('../database/connection')

exports.apiHomePage = (req, res) => {
    return res.status(200).send({ message: "Welcome!! Use Postman To interact with API" });
}

/**
 * USERS Controller
 */

/**
 * Register User.
 * POST PARAMETERS are:
 * @param {string} name - The Name of the user.
 * @param {string} email - The email of the user shoudl be unique.
 * @param {string} password - The password of the user.
 * @param {string} cpassword - The confirm password of the user.
 * @returns {string} Confirm message.
 */
exports.doRegisterUser = (req, res) => {
    //body empty check
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Insufficient Information" });
    }
    else {
        const { name, email, password, cpassword } = req.body;
        if (password == "") {
            return res.status(400).send({ message: "Password cannot be empty." });
        }
        if (password === cpassword && email != "" && name != "") {
            pool.query("INSERT INTO USERS(name,email,password) VALUES($1,$2,$3);", [name, email, password], (err, res) => {
                if (err) { res.status(400).send({ message: "Error while creating user" }); }
            });
        }
        else {
            return res.status(400).send({ message: "Password is not matching." });
        }
        return res.status(201).send({ message: "New User Created. Please Login to start session" });
    }
}

/**
 * Login User. This will create a session for the current logged in user
 * POST PARAMETERS are:
 * @param {string} email - The email of the user shoudl be unique.
 * @param {string} password - The password of the user.
 * @returns {string} Confirm message.
 */
exports.doLoginUser = (req, res) => {
    //body empty check
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Insufficient Information" });
    }
    else {
        const { email, password } = req.body;
        if (password != "" && email != "") {
            pool.query("SELECT * FROM USERS WHERE email = $1;", [email], (err, data) => {
                if (err) { res.status(400).send({ message: "Error while fetching user" }); }
                else {
                    let r_email = data.rows[0].email;
                    let r_password = data.rows[0].password;
                    
                    if (r_email == email && r_password == password) {

                        // creating session
                        req.session.name = data.rows[0].name;
                        req.session.userId = data.rows[0].id;
                        req.session.isLoggedIn = true;

                        return res.status(200).send({ message: "Successs" });
                    }
                    else {
                        return res.status(401).send({ message: "either email or password is wrong." });
                    }
                }
            });
        }
        else {
            return res.status(400).send({ message: "Fields are empty." });
        }
    }
}

/**
 * LOGOUT USER: This will destory current session of user.
 * @returns {string} Confirm message.
 */
exports.doLogoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            return res.status(200).send({ message: "LOGOUT Successfully" });
        }
    })
}

/**
 * PRODUCT Controller
 */

/**
 * Add new Product not included in task but to make it easier to add a new product.
 * POST PARAMETERS are:
 * @param {string} name - The name of the product
 * @param {float} price - The product price.
 * @param {integer} quantity - The product quantity.
 * @returns {string} Confirm message.
 */
exports.doAddProduct = (req, res) => {
    const { name, price, quantity } = req.body;

    pool.query("INSERT INTO PRODUCTS(name,price,quantity) VALUES($1,$2,$3);", [name, price, quantity], (err, data) => {
        if (err) { return res.status(400).send({ message: "Error while creating user" }); }
        else { return res.status(201).send({ message: "Product Added Successfully" , body : data.rows[0]}); }
    });

}

/**
 * ORDER Controller
 */

/**
 * Fetch Order: This will fetch all the order of current logged in user.
 * @returns {object} A list of orders of logged-in user.
 */
exports.doGetAllOrder = (req, res) => {
    // auth check
    if(!req.session.isLoggedIn){
       return res.status(401).send({message:"Please Login First."})
    }
    var user_id = req.session.userId;
    pool.query("SELECT * FROM ORDERS WHERE user_id=$1;", [user_id], (err, data) => {
        if (err) { return res.status(400).send({ message: err.message }); }
        else if(data.rows.length){ return res.status(200).send({ message: "No orders found"}); }
        else { return res.status(201).send({ message: "Order Fetched Successfully" , body : data.rows}); }
    });

}

/**
 * Place Order: This will place the order for currently logged in user.
 * POST PARAMETERS are:
 * @param {integer} product_id - The id of the product
 * @param {integer} quantity - The product quantity to buy.
 * @returns {object} info about placed order
 */
exports.doPlaceOrder = (req, res) => {
    //auth check
    if(!req.session.isLoggedIn){
        return res.status(401).send({message:"Please Login First."})
    }

    //body empty check
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Insufficient Information" });
    }

    const { product_id, quantity } = req.body;
    var price;
    var user_id = parseInt(req.session.userId);

    if(product_id !== "" && quantity !== ""){

        pool.query("SELECT * FROM products where id=$1;", [ product_id ], (err, data) => {
            if (err) { return res.status(400).send({ message: "Error while fetching product" }); }
            else {

                //calculating price for the total ordered quantity
                price = data.rows[0].price;
                price = price * quantity;
                
                let new_quantity = data.rows[0].price - quantity; //calculating new quantity before purchase

                // checking if required quantity is there or not 
                if(data.rows[0].quantity < quantity){
                    return res.status(400).send({ message: "Insufficient Quantity!" });
                }
                else{
                    // confirming the order
                    pool.query("INSERT INTO ORDERS(user_id,product_id,quantity,price,purchase_date) VALUES($1,$2,$3,$4,$5);", [user_id, product_id, quantity,price, new Date()], (err, data) => {
                        if (err) {console.log(err); return res.status(400).send({ message: "Error while placing order" }); }
                        else { return res.status(201).send({ message: "Order Placed Successfully" , body : data.rows[0]}); }
                    });

                    // updating products quantity
                    pool.query("UPDATE products set quantity=$1 where id=$2;", [new_quantity,product_id], (err, data) => {
                        if (err) {console.log(err); return res.status(400).send({ message: "Error while placing order" }); }
                    });
                }

            }
        });
    }
    else{
        return res.status(400).send({ message: "Fields are empty." });
    }

}

/**
 * CART functionality
 */

/**
 * Add To Cart: This will add the order into the cart for currently logged in user.
 * POST PARAMETERS are:
 * @param {integer} product_id - The id of the product
 * @param {integer} quantity - The product quantity to buy.
 * @returns {object} info about product added into the cart.
 */
exports.doAddProductInCart = (req,res)=>{
    //auth check
    if(!req.session.isLoggedIn){
        return res.status(401).send({message:"Please Login First."})
    }

    //body empty check
    if (Object.keys(req.body).length === 0) {
        return res.status(400).send({ message: "Insufficient Information" });
    }

    const { product_id, quantity } = req.body;
    var price;
    var user_id = parseInt(req.session.userId);

    if(product_id !== "" && quantity !== ""){

        pool.query("SELECT * FROM products where id=$1;", [ product_id ], (err, data) => {
            if (err) { return res.status(400).send({ message: "Error while fetching product" }); }
            else {

                //calculating price for the total ordered quantity
                price = data.rows[0].price;
                price = price * quantity;
                
                // checking if required quantity is there or not 
                if(data.rows[0].quantity < quantity){
                    return res.status(400).send({ message: "Insufficient Quantity!" });
                }
                else{
                    // adding product into the Cart
                    pool.query("INSERT INTO CART(user_id,product_id,quantity,price,product_add) VALUES($1,$2,$3,$4,$5);", [user_id, product_id, quantity,price, new Date()], (err, data) => {
                        if (err) {console.log(err); return res.status(400).send({ message: "Error while placing order" }); }
                        else { return res.status(201).send({ message: "Product added into the Cart." , body : data.rows[0]}); }
                    });
                }
            }
        });
    }
    else{
        return res.status(400).send({ message: "Fields are empty." });
    }
}

/**
 * Checkout: This will check the cart wethere it exist for currently logged-in user or not then place the order of the cart items.
 * @returns {object} detail about cart total order price.
 */
exports.doCheckoutCart = (req,res)=>{
    //auth check
    if(!req.session.isLoggedIn){
        return res.status(401).send({message:"Please Login First."})
    }
    var user_id = parseInt(req.session.userId);
    var total_order_cost = 0;

    // querying user cart
    pool.query("SELECT * FROM CART WHERE user_id=$1;",[user_id],(err,data)=>{
        if(err){
            return res.status(400).send({message:"Error while fetching the cart."})
        }
        // check if cart is empty or not
        if(data.rows.length === 0){
            return res.status(200).send({message:"Your Cart is empty."})
        }
        else{
            // moving cart items into orders section
            for(let i=0;i<data.rows.length;i++){
                pool.query("INSERT INTO ORDERS(user_id,product_id,quantity,price,purchase_date) VALUES($1,$2,$3,$4,$5);",
                    [user_id,data.rows[i].product_id,data.rows[i].quantity,data.rows[i].price,new Date()],
                    (err,order_data)=>{
                        if(err){return res.status(400).send({message:"Error while ordering the products."})}
                        
                        // deleting items from cart 
                        pool.query("DELETE FROM CART WHERE id=$1",[data.rows[0].id],(err,cart_delete_data)=>{
                            if(err){return res.status(400).send({message:"Error while updating cart."})}
                        });
                    });
                total_order_cost +=data.rows[i].price;
            }
            return res.status(200).send({message:`Your Order of amount ${total_order_cost} is confirmed. Please Check your Orders to confirm.`});
        }
    })
}