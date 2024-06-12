const { pool } = require('../database/connection')

exports.apiHomePage = (req, res) => {
    return res.status(200).send({ message: "Welcome!! Use Postman To interact with API" });
}

/**
 * USERS Controller
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
exports.doGetAllOrder = (req, res) => {
    // auth check
    if(!req.session.isLoggedIn){
       return res.status(401).send({message:"Please Login First."})
    }
    var user_id = req.session.userId;
    pool.query("SELECT * FROM ORDERS WHERE user_id=$1;", [user_id], (err, data) => {
        if (err) { return res.status(400).send({ message: err.message }); }
        else { return res.status(201).send({ message: "Order Fetched Successfully" , body : data.rows}); }
    });

}

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

    if(product_id !== "" && quantity !== "" && price !== ""){

        pool.query("SELECT * FROM products where id=$1;", [ product_id ], (err, data) => {
            if (err) { return res.status(400).send({ message: "Error while fetching product" }); }
            else { 
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