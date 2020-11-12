const e = require('express');
const mongoose = require('mongoose');

const fileSchema =  mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    user : {type : String, ref: 'User', required: true},
    userFile : {type: String, required : true}
});

module.exports = mongoose.model('UserFile', fileSchema);