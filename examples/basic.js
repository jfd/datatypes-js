//  datatypes-js
//
//  Basic encoding and decoding examples
//
var datatypes = require('../datatypes.js');

// Import utils
node.mixin(require("/utils.js"));

// Import all predefined datatypes and constants.
node.mixin(datatypes.DATATYPES);
node.mixin(datatypes.CONSTANTS);

// Variables used in this examples
var bytes, value;

// Encodes a number into a INT16. Should print: [48, 57]
bytes = datatypes.encode(int16, 12345);
p(bytes);


// Decode the bytes back to an dict. Should print: {"number":12345}
value = datatypes.decode(bytes, int16, 'number');
p(value);

// Decode the bytes back to an array with value. Should print: [12345]
value = datatypes.decode(bytes, ARRAY, int16);
p(value);

