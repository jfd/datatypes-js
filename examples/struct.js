//  datatypes-js
//
//  A small example that show how to use struct's.
//

// Import all predefined datatypes and constants.
process.mixin(require("../datatypes"));

// Import utils
process.mixin(require("utils"));

// Demo constants
var MAGIC = 0x12344356;
var VERSION = 0x1235;

// Define a new struct.  We are using the big endian format and ignores any 
// constant decoding errors.
var STRUCT_A = struct(
    
    // Options
    BIG_ENDIAN,
    
    // Declaration
    int32,      MAGIC, 
    int16,      VERSION,
    cstring,    dynamic, 'body' 
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




var STRUCT_B = struct (
    
    int32,      0x11002,
    int32,      struct_size,
    cstring,    dynamic, 'value'
);


var struct_b_bytes = STRUCT_B({value: 'value'});
p(struct_b_bytes);

var struct_b_decoded = STRUCT_B.to_dict(struct_b_bytes);
p(struct_b_decoded);
