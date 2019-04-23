/* eslint no-unused-vars: 0 */
const EXPRESS = require('express');
const DBC = require('../controllers/MongooseConnect');
const MODEL = require('../models/UserModel');
const COUNTER_MODEL = require('../models/CounterModel');
const JWT = require('jsonwebtoken');
const BCRYPT = require('bcrypt');
const PATH = require('path');

const getData = async (req, res) => {
  if(DBC.connection()){
    res.send(await MODEL.find({}));
  }else{
    res.send("Can't make a connection.");
  }
  DBC.disconnect();
};

const register = async (req, res) => {
  if(DBC.connection()){
    req.body.password = BCRYPT.hashSync(req.body.password, 10);
    const data = {
      uid : await getNextSeq('Users'),
      penname : req.body.penname,
      email : req.body.email,
      password : req.body.password,
      gender : undefined,
      birthdate : undefined,
      description : undefined,
      follower : undefined,
      avatar : undefined
    };

    MODEL.create(data, (err) =>{
      if(err){ 
        let status = '';
        if((err.message).search('keyate.Users index: email') !== -1) status = 'Duplicate email';
        else if((err.message).search('keyate.Users index: penname') !== -1) status = 'Duplicate penname';
        res.json({'status': status}) 
        DBC.disconnect();
      }
      else {
        res.json({status: 'Registered'});
        DBC.disconnect();
      }
     });

  }else{
    res.send("Can't make a connection.");
  }
};

const signIn = async (req, res) => {
  if(DBC.connection()){
    await MODEL.findOne(
      {email: req.body.email},
      (err, user) =>{
        if(err) {res.send(err);}
        else{
          if(user){
            if(BCRYPT.compareSync(req.body.password, user.password)){
              const payload = {
                uid: user.uid,
                email: user.email
              }
              let token = JWT.sign(payload, process.env.SECRET_KEY,{
                expiresIn: '24h'
              })
              res.send(token);
            }
            else res.json({ status: 'Password mismatch.'});
          }
          else res.json({ status: 'User does not exist.'});
        }
    });
    DBC.disconnect();
  }else{
    res.send("Can't make a connection.");
    DBC.disconnect();
  }
};

const setProfile = async (req, res) => {
  if(req.files.avatar.truncated === false) 
  {
    if(Object.keys(req.files).length === 0) return res.sendStatus(400);
    let uid = 1;
    let fileData = req.files.avatar;
    const extension = (fileData.name).substring(
      (fileData.name).lastIndexOf('.'), 
      (fileData.name).length);
    const fileName = 'ava_' + uid + extension;
    const newpath = PATH.join(__dirname, '../')+ "/assets/imgs/upload/avatars/"+fileName;

    fileData.mv(newpath, (err) =>{
      if(err) {return res.sendStatus(500);}
      res.json({'status': 'File uploaded'});
    });
  }
};

const getDecode = (req, res) => {
  const decoded = JWT.verify(req.body.token, process.env.SECRET_KEY);
  res.send(decoded.email);
}

async function getNextSeq(modelName){
  const seq = await COUNTER_MODEL.findById({ _id: modelName});
  await COUNTER_MODEL.updateOne({ _id: modelName }, { val: seq.val+1 });
  return seq.val;
}

function authenication(token){
  const decode = JWT.verify(token, process.env.SECRET_KEY);
}

module.exports = {getData, register, signIn, getDecode, setProfile};
