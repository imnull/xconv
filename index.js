const jsonx = require('./jsonx');
const xmlx = require('./xmlx');
const Reader = require('./reader/index');
const JReader = require('./reader/j-reader');
const XReader = require('./reader/x-reader');
const StyleReader = require('./reader/style-reader');

module.exports = {
    Reader, XReader, JReader, StyleReader,
    jsonx, xmlx,
};