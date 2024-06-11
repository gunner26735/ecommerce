exports.apiHomePage = (req,res)=>{
    res.status(200).send({message:"Welcome!! Use Postman To interact with API"});
}

exports.doRegisterUser = (req,res)=>{
    if(Object.keys(req.body).length === 0){
        res.status(400).send({message:"Insufficient Information"});
    }
    else{
        res.status(201).send({message:"New User Created."});
    }
}