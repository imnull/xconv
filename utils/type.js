const isFunction = v => typeof(v) === 'function';
const isString = v => typeof(v) === 'string';
const isObject = v => Object.prototype.toString.call(v) === '[object Object]';
const isArray = v => Object.prototype.toString.call(v) === '[object Array]';
const isRegExp = v => Object.prototype.toString.call(v) === '[object RegExp]';

module.exports = {
    isFunction, isString,
    isObject, isArray, isRegExp
};