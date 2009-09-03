//
//  datatypes-js
//  Byte encoder and decoder for typical datatypes implemented in Javascript.
//  
//  Read readme.txt for instructions and LICENSE license.
//  
//  Copyright (c) 2009 Johan Dahlberg <jfd@distrop.com>
//
var datatypes = {};
try{ datatypes = exports } catch(e) {}; // Try to export the lib for node.js
(function(self) {

// Name for special classes that datatypes-js recognise. An objects class can  be 
// determind by reading the _dtclass property.
var OPTION = 'option',
    DATATYPE = 'datatype',
    STRUCT = 'struct';

// Special data sizes. 
var FLEX_DATASIZE = -2;
var DEFINED_DATASIZE = -1;

// Predefined datatypes
var DATATYPES = [
    ['byte'     , 1],
    ['bytes'    , DEFINED_DATASIZE],
    ['int16'    , 2, 'choice'],
    ['int32'    , 4, 'choice'],
    ['string8'  , DEFINED_DATASIZE],
    ['cstring'  , FLEX_DATASIZE]
];

// Converts ´´arguments´´ into an array.
function get_array(args) {
    return Array.prototype.slice.call(args);
}

// Defines a new datatype with specified options.
//
//  datasize -  The size of the datatype. Valid values are positive integers 
//              or one of the following constants:
//             
//              FLEX_DATASIZE
//              The decoder decides when to stop read from buffer
//          
//              DEFINED_DATASIZE
//              The size is user defined. 
//
//  "choice" -  Optional. This indicates that the following two callbacks are 
//              encoder/decoder chooser's rather than a real encoder/decoder. A 
//              chooser callback is called takes one argument, the option set, 
//              and should return the encoder/decoder based on that.
//
//  encoder  -  The encoder to use for the datatype. The encoder is a callback
//              that takes one argument. The encoder should always return an 
//              array with bytes.
//
//              function(value) {
//                  var result = tobytes(value) // Encode value to bytes.
//                  return result;    
//              }
//
//  decoder  -  The decoder to use for the datatype. The decoder is a callback
//              that takes two arguments. The first argument is a Buffer Pointer.
//
//              The second argument is the byte buffer to read from.
//
//              The third argument is the size of the datatype. This argument
//              will always contain the fixed datasize, for datatypes with 
//              with specified size. The value will be undefined if the  
//              datasize is declared as DATASIZE_CUSTOM. The argument has a 
//              variable value if the datasize is declared as DATASIZE_DEFINE.
//
//              function(buffer, bp, length) {
//                  var result = 0;
//                  while(!bp.eof()) result += buffer(bp.next());
//                  return result;
//              }
//
function define() {
    var args = get_array(arguments);
    return {
        _dtclass: DATATYPE,
        size: args.shift(),
        choose_callback: args[0] == 'choice' ? args.shift() == 'choice' : false,
        encoder: args.shift(),
        decoder: args.shift()
    }
}

// Defines a new data structure. A datastructure is a set of datatypes, with
// compiled encoders and decoders.
function struct() {
    // TODO    
}

// Defines a new option. An option can give user-defined instructions while 
// encoding and decoding datatypes. The option function takes two callback. The
// first callback is called when encoding a buffer, and second while decoding
// buffer.
//
// Both callback's takes one argument. The argument is an option set,
// used by current encoder/decoder.
//
//      function(options) { 
//          options.my_option = 1234 
//      }
//
// Each datatype encoder and decoder function get's the generated option set. 
//
// Built-in datatype's encoder's/decoder's ignores this option set. 
//
function option(enc_callback, dec_callback) {
    return {
        _dtclass: OPTION,
        encoder_callback: enc_callback,
        decoder_callback: dec_callback
    }
}

// Define's the BIG_ENDIAN option. This option sets the buffer byte-order to 
// big-endian.
var BIG_ENDIAN = option( 
    function(opts) { opts.little_endian = false }, 
    function(opts) { opts.little_endian = false } 
);

// Define's the LITTLE_ENDIAN option. This option sets the buffer byte-order to 
// little-endian.
var LITTLE_ENDIAN = option( 
    function(opts) { opts.little_endian = true }, 
    function(opts) { opts.little_endian = true } 
);

// Define's the DICT option. This option tell's the decoder to return a dict
// with the decoded values.
var DICT = option(
    null,
    function(opts) { opts.array_result = false }
);

// Define's the ARRAY option. This option tell's the decoder to return an array
// with decoded values.
var ARRAY = option(
    null,
    function(opts) { opts.array_result = true }
);

// Initializes a new BufferPoint instance.
function BufferPointer(pos, buffer_length) {
    this.pos = pos;
    this.length = buffer_length;
}

BufferPointer.prototype = {
    eof: function() { return !(this.pos < this.length) },
    next: function() { return this.pos++ },
}

// Define built-in encoders. An encoder takes two arguments: value and 
// (optional) options. The value argument represents the Javascript object. The
// option argument is optional and contains a dict with user-defined options. 
// It's possible to create new option handles by calling the option 
// function.
//
// All built-in encoders can be accessd through the ENCODERS member in the
// exported module. 
var ENCODERS = {
    
    // Encodes bytes. If the v argument is a number, then the number is wrapped 
    // within an array. If not, the v argument is asumed to be an array with bytes.
    bytes: function(v) {
        return v.constructor === Number ? [v] : v;
    },
    
    // Returns an int16 encoder based on the bigendian option
    get_int16: function(v, opts) {
        return opts.little_endian ? ENCODERS.int16l : ENCODERS.int16;
    },

    // Encodes an Int16 into big-endian format.
    int16: function(v) {
        return [(v >> 8) & 0xff, (v & 0xff)];
    },
    
    // Encodes an Int16 into little-endian format.
    int16l: function(v) {
        return [(v & 0xff), (v >> 8) & 0xff];
    },

    // Returns an int32 encoder based on the bigendian option
    get_int32: function(v, opts) {
        return opts.little_endian ? ENCODERS.int32l : ENCODERS.int32;
    },

    // Encodes an Int32 into big-endian format.
    int32: function(v) {
        return [ (v >> 24) & 0xff, (v >> 16) & 0xff, (v >> 8) & 0xff, (v & 0xff) ];
    },

    // Encodes an Int32 into little-endian format.
    int32l: function (v) {
        return [ (v & 0xff), (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff ];
    },
    
    // Encodes an 8-bit char-string.
    string8: function(v) {
        var result = [], l = v.length;
        for(var i = 0; i < l; i++) result.push(v.charCodeAt(i));
        return result;
    },
    
    // Encodes an 8-bit char null-terminated string.
    cstring: function(v) {
        return ENCODERS.string8(v).concat([0]);
    }
    
}

//  Define built-in decoders. A decoder is a callback for specified dataype. The 
//  callback takes three arguments: buffer, pointer and length. 
//  
//      buffer  - The buffer is an Array with 1 or more bytes.
//      pointer - A BufferPointer instance. The instance points to the buffer 
//                position to read from. 
//      length  - The total length of the datatype. This argument SHOULD be 
//                ignored by Datatypes with a fixed size.
//      options - OPTIONAL. A dict with user-defined options. 
//
// All built-in decoders can be accessd through the ENCODERS member in the
// exported module.
var DECODERS = {
    
    // Decodes an byte array.
    bytes: function(buffer, pointer, length) {
        if(length == 1) return buffer[pointer.pos++];
        var pos = pointer.pos;
        pointer.pos += pos + length;
        return buffer.slice(i, length);
    },
    
    // Returns an int16 decoder based on the bigendian option
    get_int16: function(b, pt, l, opts) {
        return opts.little_endian ? DECODERS.int16l : DECODERS.int16;
    },
    
    // Decodes an Int16 in big-endian format.
    int16: function(b, pt) {
        return (b[pt.pos++] << 8) | (b[pt.pos++]);
    },
    
    // Decodes an Int16 in little-endian format.
    int16l: function(b, pt) {
        return (b[pt.pos++]) | (b[pt.pos++] << 8);
    },

    // Returns an int32 decoder based on the bigendian option
    get_int32: function(b, pt, l, opts) {
        return opts.little_endian ? DECODERS.int32l : DECODERS.int32;
    },

    // Decodes an Int32 in big-endian format.
    int32: function(b, pt) {
        return (b[pt.pos++] << 24) |  (b[pt.pos++] << 16) | (b[pt.pos++] << 8) | (b[pt.pos++]);
    },

    // Decodes an Int32 in little-endian format.
    int32l: function(b, pt) {
        return (b[pt.pos++]) | (b[pt.pos++] << 8) |  (b[pt.pos++] << 16) | (b[pt.pos++] << 24);
    },
    
    // Decodes an 8-bit char-string.
    string8: function(b, pt, l) {
        var result = [], i = index, bl = b.length, v;
        while(pt.pos < l && pt.pos < bl) {
            result.push(String.fromCharCode(v));
            pt.pos++;
        }
        return result.join('');
    },
    
    // Decodes an 8-bit char null-terminated string.
    cstring: function(b, pt) {
        var result = [], bl = b.length, v;
        while(pt.pos < bl && (v = b[bt.pos++]) != 0) {
            result.push(String.fromCharCode(v));
        }
        return result.join('');
    }
}

// Encodes Javascript objects into a byte-array.
function encode() {
    var args = get_array(arguments), result = [], options = { };
    while(args.length > 0) {
        var first = args.shift(), second, encoder;
        switch(first._dtclass) {
            case OPTION:
                if(first.encoder_callback) first.encoder_callback(options);
                break;
            case DATATYPE:
                second = args.shift();
                encoder = first.choose_callback ? 
                          first.encoder(second, options) :
                          first.encoder;
                result = result.concat(encoder(second, options));
                break;
            case STRUCT:
                // TODO
                break;
            default:
                throw "Expected datatype, struct or option";
                break;
        }
    }
    return result;
}

// Decodes a set of bytes into a javascript object.
function decode_dt(dt, buffer, pt, length, opts) {
    var decoder = dt.choose_callback ? 
                  dt.decoder(buffer, pt, length, opts) :
                  dt.decoder;
    return decoder(buffer, pt, length, opts);
}

// Decodes an byte-array into Javascript objects.
function decode() {
    var args = get_array(arguments), result = {}, options = {};
    var buffer = args.shift(), pt = new BufferPointer(0, buffer.length);
    while(args.length > 0) {
        var first = args.shift(), second, field, decoder, dtresult;
        switch(first._dtclass) {
            case OPTION:
                var array_result = options.array_result;
                if(first.decoder_callback) first.decoder_callback(options);
                if(options.array_result != array_result) {
                    result = options.array_result ? [] : {};
                }
                break;
            case STRUCT:
                throw "Structs are not currently supported by decoder.";
                break;
            case DATATYPE:
            default:
                if(args[0] !== undefined && args[0].size == DEFINED_DATASIZE) {
                    // Expect a number representing the size
                    // of the datatype
                    if(first._dtclass == DATATYPE) {
                        // Parse size from member
                        first = decode_dt(first, buffer, pt, length, options);
                    } 
                    second = args.shift();
                    dtresult = decode_dt(second, buffer, pt, first, options);
                } else {
                    dtresult = decode_dt(first, buffer, pt, first.size, options);
                }
                if(options.array_result) {
                    result.push(dtresult);
                } else {
                    field = args.shift();
                    if(field.constructor !== String) throw "Expected named field";
                    result[field] = dtresult;
                }
                break;
        }
    }
    return result;
}

// Export public members
(function() {
    var l = DATATYPES.length;    
    while(l-- > 0) {
        var type = DATATYPES[l];
        var name = type[0];
        var size = type[1];
        var prefix = '';
        var ctor_args = [size];
        if(type[2] == 'choice') {
            prefix = 'get_';
            ctor_args.push('choice');  
        } 
        ctor_args.push(ENCODERS[prefix + name]);
        ctor_args.push(DECODERS[prefix + name]);
        self[name.toUpperCase()] = define.apply(null, ctor_args);
    }
})();

self.BIG_ENDIAN = BIG_ENDIAN;
self.LITTLE_ENDIAN = LITTLE_ENDIAN;
self.DICT = DICT;
self.ARRAY = ARRAY;
self.FLEX_DATASIZE = FLEX_DATASIZE;
self.DEFINED_DATASIZE = DEFINED_DATASIZE;
self.ENCODERS = ENCODERS;
self.DECODERS = DECODERS;
self.define = define;
self.option = option;
self.encode = encode;
self.decode = decode;


})(datatypes);