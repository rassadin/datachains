#Datachains.js#

Datachains.js is alternative solution to so called 'chained' processing of the data arrays in JavaScript. This approach is widely adopted in number of libraries such as Underscore.js and was introduced in Array Extras of ECMA-262 5th edition.

Main ideas behind the library are performance, wider usage patterns, and
support for both browser and server environments.

##Current State##
The library is currently one step from proof-of-concept in long way to version one dot zero. A bunch of fuctionality was planned is missing for now. But I keep tests close up to 100% code coverage so it should be pretty usable.

If you interested in trial you are welcome. Please submit any feature request you have or any issue you found.

##Main features##

###Lazy processing###
Lazy evalution is significant difference from how Arrays or Underscore.js work. Chain processing begins only when terminal operation be specified. This brings significant performance improvement dealing with big arrays.

In next example array is been accessed only when forEach method is called.

```javascript
	chain(array).map(...).filter(...).forEach(...);
```

###Generic chains###
In contrast to other libraries Datachains.js allows to define chains without linking them to any particular source. These generic chains provide ability to define processing templates or patterns and apply them to arrays later.
	
```javascript
	var filterChain = chain().map(...).reduce(...);
	...
	result = filterChain.process(array);
```

###Compilation###

Typically you define generic chains in initialization or setup code to benefit
from the their reuse. Defined generic chain can be also compiled to single body
processing function, and internal complexity of chain internals will be removed.
This dramatically gain the performance of processing make it close to plain loops.

```javascript
	var filter = chain().filter(...).compile();
	...
	result = filter(array);
```

###Support for Node.js features###
Node.js specific functionality are currently in definition.

##Performance tests##
Performance tests are planned to measure efficiency of library in different patterns.

## Copyright ##
This project currently licensed under CC BY-NC-SA license.
There is planned to switch to less restrictive license later.
