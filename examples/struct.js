//  datatypes-js
//
//  A small example that show how to use struct's.
//

// Import all predefined datatypes and constants.
node.mixin(require("../datatypes.js"));

// Import utils
node.mixin(require("/utils.js"));

// Demo constants
var MAGIC = 0x12344356;
var VERSION = 0x1235;

// Define a new struct.  We are using the big endian format and ignores any 
// constant decoding errors.
var STRUCT_A = struct(
    
    // Options
    BIG_ENDIAN,
    
    // Declaration
    INT32,      MAGIC, 
    INT16,      VERSION,
    CSTRING,    DYNAMIC, 'body' 
);

// Encodes our struct into a byte array.
//
// Output: [18,52,67,86,35,85,72,101,108,108,111,32,87,111,114,108,100,0]
var struct_a_bytes = STRUCT_A({body: "Hello World"});
p(struct_a_bytes);

// Decode the bytes back a dict.
//
// Output: {"body":"Hello World"}
var struct_a_decoded = STRUCT_A.to_dict(struct_a_bytes);
p(struct_a_decoded);
//, NO_ERROR_CHECK