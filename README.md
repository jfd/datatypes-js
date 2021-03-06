datatypes-js
============

ATTENTION:

	This version of datatypes-js is not supported by Node-js. If you are planing to use this library with Node-js, please checkout the branch named "nodejs".

Byte encoder and decoder for typical datatypes implemented in Javascript.

## Introduction 
The primary goal for this library is to make life easier for those who want to 
work with binary datatypes in Javascript. 

The library is fully compatible with the ECMA-standard, without any
requirements of third-party libraries. 

Note: All examples bellow is written for nodejs (http://tinyclouds.org/node/).


## A Quick Example
Here is a quick example what datatype-js can do:

	include('datatypes.js');
	
	// Encodes a Javascript String object into a byte array.
	var buffer = encode(cstring, 'Hello World!');

	// Prints [?,?,?,?,?,?,?,?,?,?,?] to the screen;
	puts(buffer);
	
	// Decode the buffer into a Javascript String object.
	var result = decode(buffer, cstring);
	
	// Prints "Hello World!" to the screen;
	puts(result);



## Built-in Datatypes
The library has a set of pre-defined decoders and encoders for the most regular
datatypes. Each datatype is represented by a constant. Here is a list with 
currently pre-defined datatypes:

- **byte**, A byte value.
- **bytes**, An array with one or more bytes.
- **int16**, An 2-byte integer.
- **int32**, An 2-byte integer.
- **cstring**, A null-terminated string. 

It's easy to define your own encoder/decoder if you are missing a datatype. To 
do so you can simple call the ´´define´´ function: 

	// Import library
	node.mixin(require('../datatypes.js'));

	// Define a custom 2-byte datatype.
	var my_datatype = define(
		
		// Set's the size of the datatype. Other valid values are: FLEX_DATASIZE
		// and DEFINED_DATASIZE. See notes below for more information. 
		2, 
		
		// The callback that encodes the datatype. Should always return an 
		// array of bytes.
		function(value, options) {
			return [(v >> 8) & 0xff, (v & 0xff)];
		},

		// The callback that decides the datatype. 
		function(buffer, pointer, length, options) {
        	return (buffer[pointer.next()] << 8) | (buffer[pointer.next()]);
		}
		
	);
	
Actually, the example above is the int16 datatype. 

There is three valid sizes to use:

- **positive integer**, Set's a fixed size. The encoder MUST always return an 
						byte-array with the length equal to the specified size.
- **DEFINED_DATASIZE**, The size is defined by user. For example, the byteS uses a 
						defined data size.
- **FLEX_DATASIZE**, 	The data size is flexible. The actual size is 
						controlled by the datatype. The cstring type for 
						example, uses an flexible data size. The null-
						terminator indicates where to stop reading the buffer.



#Encoding Javascript-Objects Into Bytes.
For our first example, we will encode a set of number into a byte array. 

	// Import libraries
	node.mixin(require('/utils.js'));
	node.mixin(require('../datatypes.js'));
	
	var buffer = encode(
	
		// Datatype to the right and value to the left
		int32, 123456789,
		int16, 12345,
		cstring, 'Hello world'
	);
	
	// Prints [?,?,?,?,?,?,?,?,?,?,? ] in the console. 
	puts(buffer);


As seen above, the specified values are encoded into an array with bytes. A 
trained eye might see the byte-order for the integers. The function encodes 
numbers in the big-endian byte-order format. However, this can be changed by 
specifying a built-in encoding option:

	// Import libraries
	node.mixin(require('/utils.js'));
	node.mixin(require('../datatypes.js'));

	var buffer = encode(
		
		// Set's the byte-order to little-endian. 
		LITTLE_ENDIAN,
		
		int32, 123456789,
		int16, 12345,
		cstring, 'Hello world'
	);

	// Prints [?,?,?,?,?,?,?,?,?,?,? ] in the console. 
	puts(buffer);
 

There is currently two built-in options that is supported by the encode 
function. These options are: 

- BIG_ENDIAN (default), encodes supported datatypes in the the big-endian 
  byte-order format.
- LITTLE_ENDIAN, encodes supported datatypes in the the little-endian 
  byte-order format.



## Decoding Bytes Into Javascript-Objects	
To decode the newly buffer, we simply call the decode function:

	// Import libraries
	node.mixin(require('/utils.js'));
	node.mixin(require('../datatypes.js'));

	var result = decode(
		
		// The buffer to decode
		buffer,
		
		// The field order, and a name that represents each value in the
		// result.
		int32, 'int32_value',
		int16, 'int16_value',
		cstring, 'string_value'
	);
	
	// Print's "{int32_value: 123456789, int16_value: 12345, 
	// string_value: 'Hello world' }. 
	p(result);
	

The example above, as noticed, will return a dict with the values in the 
buffer. The decode function returns a result dict as default. The second choice 
is to encode the values to a plain array. To do so, we need to define an decoding
option:

	// Import libraries
	node.mixin(require('/utils.js'));
	node.mixin(require('../datatypes.js'));

	var result = decode(
		
		// The byte-buffer to decode
		buffer,
		
		// We like to have the result in an Array.
		ARRAY,
		
		// Because we decode the result into an array, we do not need to declare 
		// any names for the fields.
		int32, int16, cstring
	);
	
	// Print's "[123456789, 12345, 'Hello world']
	p(result);


There is currently two built-in options that is supported by the decode 
function. These options are:

- DICT (default), decodes the result into a dict.
- ARRAY, decodes the result into an array of values
- BIG_ENDIAN (default), decodes supported datatypes in the the big-endian 
  byte-order format.
- LITTLE_ENDIAN, decodes supported datatypes in the the little-endian 
  byte-order format.
	
