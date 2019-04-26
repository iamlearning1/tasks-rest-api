const mongoose = require('mongoose');

const uri = require('../../tokens.json');

mongoose.connect(uri.mongouri, { useNewUrlParser: true, useCreateIndex: true });

module.exports = mongoose;
