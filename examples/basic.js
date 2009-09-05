//  datatypes-js
//
//  Basic encoding and decoding examples
//
var datatypes = require('../datatypes.js');
datatypes.export_to(this);

// Variables used in this examples
var bytes, value;

// Encodes a number into a INT16. Should print: [48, 57]
bytes = datatypes.encode(INT16, 12345);
p(bytes);

// Decode the bytes back to an dict. Should print: {"number":12345}
value = datatypes.decode(bytes, INT16, 'number');
p(value);

// Decode the bytes back to an array with value. Should print: [12345]
value = datatypes.decode(bytes, ARRAY, INT16);
p(value);

