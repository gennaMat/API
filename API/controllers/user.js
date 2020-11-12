const User = require('../models/userSchema');
const mongoose = require('mongoose');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.user_get_all = (req, res, next) => {
    User.find()
    .select('_id idNum fName lName email')
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            users: docs.map(doc => {
                return {
                    _id: doc._id,
                    idNum : doc.idNum,
                    fName : doc.fName,
                    lName : doc.lName,
                    email : doc.email,
                    password : doc.password,
                    request : {
                        type : 'GET',
                        url : 'https://g-project2-api.herokuapp.com/user/' + doc._id
                    }
                }
            })
        }
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.user_get_single = (req, res, next) =>{
    User.find({email: req.params.email})
    .select('_id idNum fName lName email')
    .exec()
    .then(doc => {
        if(doc)
        {
            res.status(200).json({
                user : doc,
                request: {
                    type : 'GET',
                    description : 'Get all users',
                    url : 'https://g-project2-api.herokuapp.com/user/'

                }
            });
        }
        else
        {
            res.status(404).json({
                message: 'Entry not found in database'
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

//Change to find user by email
exports.user_patch = (req, res, next) =>{
    const id = req.params.email;
    const updateOps = {};

    for(const ops of req.body)
    {
        updateOps[ops.propName] = ops.value;
    }

    User.update({email: id}, {$set: updateOps}).exec()
    .then(result => {
        res.status(200).json({
            message: 'User updated',
            request : {
                type : 'GET',
                url : 'https://g-project2-api.herokuapp.com/user/' + id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });

}

//change to find user by email
exports.user_delete = (req, res, next) =>{
    const id = req.params.email;
    User.remove({email: id}).exec()
    .then(result => {
        res.status(200).json({
            message : 'User deleted successfully',
            request: {
                type : 'POST',
                url : 'https://g-project2-api.herokuapp.com/user/',
                body: {
                    id : 'String',
                    fName : 'String',
                    lName : 'String',
                    contact: 'String',
                    national: 'String',
                    email : 'String',
                    password: 'String'
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.user_signup = (req, res, next) =>{
    User.find({email: req.body.email}).exec()
    .then(user => {
        if(user.length > 0)
        {
            return res.status(422).json({
                message: 'User already exists in database'
            });
        }
        else
        {
            bycrypt.hash(req.body.password, 10, (err, hash) => {
                if(err)
                {
                    return res.status(500).json({
                        error: err
                    });
                }
                else 
                {
                    const user = new User({
                        _id : new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    user.save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'user created'
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            });
        }
    }) 
}

exports.user_login = (req, res, next) =>{
    User.find({email: req.body.email})
    .exec()
    .then(user=> {
        if(user.length <1)
        {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }
        bycrypt.compare(req.body.password, user[0].password, (err, result) =>{
            if(err)
            {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
           
            if(result)
            {
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id
                },
                process.env.JWT_KEY,
                {expiresIn:'1h'});

                return res.status(200).json({
                    message: 'Auth successful',
                    token: token 
                });
            }

            return res.status(401).json({
                message: 'Auth failed'
            });
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

/*router.post('/', checkAuth ,(req, res, next) =>{

    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        idNum: req.body.idNum,
        fName: req.body.fName,
        lName: req.body.lName,
        contact: req.body.contact,
        national: req.body.national,
        email: req.body.email,
        password: req.body.password
    });
    user.save().then(result =>{
        console.log(result);
        res.status(200).json({
            message: 'Created user successfully',
            createdUser: {
                _id: result._id,
                idNum : result.idNum,
                fName : result.fName,
                lName : result.lName,
                contact: result.contact,
                national: result.national,
                email : result.email,
                password: result.password,
                request : {
                    Type : 'GET',
                    url: 'https://g-project2-api.herokuapp.com/user/' + result._id
                }
            }
        });
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});*/