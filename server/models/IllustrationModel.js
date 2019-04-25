const MONGOOSE = require('mongoose');

const ILLUSTRATIONSCHEMA = MONGOOSE.Schema({

  uid : {type: Number, required: true},
  name : {type: String, required: true},
  illustrator : {type: Number, required: true},
  description : {type: String, required: true, default: ''},
  tag : [ String ],
  category : [ String ],
  release_date : {type: Date, required: true, default: Date.now},
  views : {type: Number, required: true, default: 0},
  populars : {type: Number, required: true, default: 0},
  deleted : {type: Boolean, required: true, default: false},
  comments_box_id : {type: String, required: true}

}, { collection : 'Illustrations'}

);

module.exports = MONGOOSE.model('Illustration', ILLUSTRATIONSCHEMA);