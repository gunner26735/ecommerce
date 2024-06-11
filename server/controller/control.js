const { pool } = require('../database/connection')

exports.apiHomePage = (req, res) => {
    res.status(200).send({ message: "Welcome!! Use Postman To interact with API" });
}

exports.doRegisterUser = (req, res) => {
    if (Object.keys(req.body).length === 0) {
        res.status(400).send({ message: "Insufficient Information" });
    }
    else {
        const { name, email, password, cpassword } = req.body;
        if (password == "") {
            res.status(400).send({ message: "Password cannot be empty." });
        }
        if (password === cpassword && email != "" && name != "") {
            pool.query("INSERT INTO USERS(name,email,password) VALUES($1,$2,$3);", [name, email, password], (err, res) => {
                if (err) { res.status(400).send({ message: "Error while creating user" }); }
            });
        }
        else {
            res.status(400).send({ message: "Password is not matching." });
        }
        res.status(201).send({ message: "New User Created. Please Login to start session" });
    }
}

exports.doLoginUser = (req, res) => {
    if (Object.keys(req.body).length === 0) {
        res.status(400).send({ message: "Insufficient Information" });
    }
    else {
        const { email, password } = req.body;
        if (password != "" && email != "") {
            pool.query("SELECT * FROM USERS WHERE email = $1;", [email], (err, data) => {
                if (err) { res.status(400).send({ message: "Error while fetching user" }); }
                else {
                    let r_email = data.rows[0].email;
                    let r_password = data.rows[0].password;
                    console.log(r_email);
                    if (r_email == email && r_password == password) {

                        // creating session
                        req.session.name = data.rows[0].name;
                        req.session.id = data.rows[0].id;
                        req.session.isLoggedIn = true;

                        res.status(200).send({ message: "Successs" });
                    }
                    else {
                        res.status(401).send({ message: "either email or password is wrong." });
                    }
                }
            });
        }
        else {
            res.status(400).send({ message: "Fields are empty." });
        }
    }
}

exports.doLogoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.status(200).send({ message: "LOGOUT Successfully" });
        }
    })
}