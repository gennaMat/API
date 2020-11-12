const mongoose = require('mongoose');
const UserFile = require('../models/userFileSchema');
const fs = require('fs');
const xlsx = require('node-xlsx');

function classifyTextData(dataArray)
{
  var usrId, name, lastName, contactNum, nationality ;
  for(var i =0; i < dataArray.length; i++)
  {
    var data = dataArray[i].toString().split(':') ;
    if(dataArray[i].toString().includes('first'))
    {
      name = data[1] ;
    }
    if(dataArray[i].toString().includes('last'))
    {
      lastName = data[1] ;
    }

    if(dataArray[i].toString().includes('id'))
    {
      usrId = data[1] ;
    }

    if(dataArray[i].toString().includes('contact') || dataArray[i].toString().includes('number'))
    {
      contactNum = data[1] ;
    }

    
    if(dataArray[i].toString().includes('nat') || dataArray[i].toString().includes('origin'))
    {
      nationality = data[1] ;
    }    
  }

  const userData = {
    idNum: usrId,
    firstName: name,
    lastName: lastName,
    contact: contactNum,
    national: nationality
  }
  
  return userData;
}

function classifyExcelData(dataArray)
{
 
  var usrId, name, lastName, contactNum, nationality ;
  var info = dataArray[0][1].toString().split(',');
  for(var i in info)
  {
    var data = info[i].toString().split(':');
    if(info[i].toString().includes('first'))
    {
      name = data[1];
    }

    if(info[i].toString().includes('last'))
    {
      lastName = data[1];
    }

    if(info[i].toString().includes('id'))
    {
      usrId = data[1];
    }

    if(info[i].toString().includes('contact') || info[i].toString().includes('number'))
    {
      contactNum = data[1];
    }

    if(info[i].toString().includes('nat') || info[i].toString().includes('origin'))
    {
      nationality = data[1];
    }


  }
 

  const userData = {
    idNum: usrId,
    firstName: name,
    lastName: lastName,
    contact: contactNum,
    national: nationality
  }
  
  return userData;
  
}


function getFileData(filePath)
{
  var array = [];
  var userClassifiedData ;
  if(filePath.toString().includes('.txt') ||filePath.toString().includes('.csv'))
  {
    array = fs.readFileSync(filePath).toString().split('\n');
    userClassifiedData = classifyTextData(array);
  }
  else if(filePath.toString().includes('.xlsx'))
  {
    var excelObj = xlsx.parse(fs.readFileSync(filePath));
    for(var i in excelObj)
    {
     array.push(Object.values(excelObj[i]));
    }
    userClassifiedData = classifyExcelData(array);
  }
  else
  {
    return;
  }
  console.log(userClassifiedData);

  return userClassifiedData;
}


exports.uploadFile = (req, res, next) => {
    const id = req.params.email;
    UserFile.find({email: id}).exec()
      .then(user => {
        if (!user) {
          return res.status(404).json({
            message: "user not found"
          });
        }
        const file = new UserFile({
          _id: mongoose.Types.ObjectId(),
          user : req.params.email,
          userFile: req.file.path
        });
        return file.save();
      })
      .then(result => {
        const u_email = req.params.email;
        UserFile.remove({email: u_email}).exec()
        .then(result => {
          const data = getFileData(req.file.path);
          fs.unlink(req.file.path, (output) =>{
            console.log(output);
          });
          res.status(200).json({
            message : 'File uploaded and deleted successfully' ,  
            userData : data 
          });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  };
