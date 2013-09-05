// models/measures.js
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var measureSchema = new Schema({
  id_device:    { type: Number },
  measure:      { type: Number },
  date:         { type: Date, default: Date.now }
});

module.exports = mongoose.model('measure', measureSchema);