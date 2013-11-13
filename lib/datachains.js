//
// Datachains.js 
// 0.1.0
//
// Datachains.js is alternative solution to so called 'chained'
// processing of the data arrays in JavaScript. This approach is
// widely adopted in number of libraries such as Underscore.js and
// was introduced in Array Extras of ECMA-262 5th edition.
//
// 2013 Nik Rassadin <rassadin@gmail.com>
//
// This project currently licensed under CC BY-NC-SA license.
// There is planned to switch to less restrictive license later.
//
//
// Like with Arrays
// result = [].map(...)
//
// Or like with Underscore.js chain 
// result = _.chain([]).map(...).value(),
//
// You can use:
// result = dc.chain([]).map(...).toArray();
//
// Or get more fun with generic chains
// var c = dc.chain().filter(...);
// result = c.process([]);
// 
;(function(context) {

        var Chain = function(array) {
        	this.array = array;   
        	this.ops = [];
	    };

        Chain.prototype = {};
        Chain.prototype.constructor = Chain;

        Chain.prototype.link = function(op) {
			this.ops[this.ops.length] = op;
			return this;
		};
		
		Chain.prototype.end = function(op, before, after) {
			
			var array = this.array;
			var context = { result: null, cancel: false };

			if (before) before(context);
			
			var emit = op;
			var count = this.ops.length;
			while(count--) {
				emit = this.ops[count](emit, count);
			}
			
			var length = array.length;
			for (var i = 0;	i < length && !(context.cancel); ++i) {
				emit(array[i], context);
			}

			if (after) after(context);
			return context.result;
		};


		Chain.prototype.toArray = function() {
			var result = [];
			var emit = function(e){ result[result.length]=e };
			
			var count = this.ops.length;
			while(count--) {
				emit = this.ops[count](emit, count);
			}
		
			var array = this.array;
			var length = array.length;
			var context = { 'result' : result, cancel: false }; 
			for (var i = 0;	i < length && !(context.cancel); ++i) {
				emit(array[i], context);
			}
			return result;
		}
		
		var GenericChained = function() {};
		
		GenericChained.prototype = {};
        GenericChained.prototype.constructor = GenericChained;

        var GenericChain = function() {
 			this.ops = [];

			//with compile
			this.opNames = [];
 			this.opArguments = [];
 		}

		GenericChain.prototype = new GenericChained();
        GenericChain.prototype.constructor = GenericChain;

        GenericChain.prototype.link = function(op) {
			this.ops[this.ops.length] = op;
			return this;
		};
		
		GenericChain.prototype.end = function(op, before, after) {
			this.finalOp = op;
			if (before) this.before = before;
			if (after) this.after = after;

			this.emit = op;

			var count = this.ops.length;
			while(count--) {
				this.emit = this.ops[count](this.emit,count);
			}

			this.__proto__ = new GenericChained();
			return this;
		};
		
		GenericChain.prototype.toArray = function() {
			
			this.before = function(context) {
				context.result = [];
			}
			this.emit = function(e, context) {
				context.result[context.result.length] = e;
			}			
	      
			var count = this.ops.length;
			while(count--) {
				this.emit = this.ops[count](this.emit,count);
			}

			this.__proto__ = new GenericChained();
			return this;
		};


		GenericChained.prototype.process = function(array) {
			
			var count = this.ops.length;
	      	if (count == 0 && !this.finalOp) return array;
	      	
			if(this.emit == null) this.toArray();
			var emit = this.emit;

	      	var context = { result: null, cancel: false };
			if (this.before) this.before(context);

			var length = array.length;

			for (var i = 0;	i < length && !(context.cancel); ++i) {
				emit(array[i], context);
			}

			if (this.after) this.after(context);
		 
			return context.result;
		};


		GenericChained.prototype.emitter = function() {
			throw new Error('Not implemented');
		};

		GenericChain.prototype.async = function(errorIsFirstArgumentOfCallback) {
			throw new Error('Not implemented');
		};

		//with compile
		var chainOperations = {};

		//with compile
		var transformCode = function(source, replacements, emitBody, emitMatch, emitElement) {
			//req : donot not support inline RE use RegExp constructor instead
			//req : donot suppot non-latin names for identifiers
			var spaces='                ';

			var whitener = function(match, offset, str) {
				var s = match.length;
				while(spaces.length < s) {
					var ss = s - spaces.length;
					if (ss > spaces.length)
						spaces += spaces;
					else
						spaces += spaces.substring(0,ss);
				}
				return spaces.substring(0,s);
			};
			var white = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\*(?:[^*])*?\*\/|\/\/.*/gm;
			var whiten = source.replace(white, whitener);

			var ident = /(?:^|\s|[,:;{}()\[\]]|[\-+~!?*\/%<=>&|\^])([$_a-zA-Z][$_0-9a-zA-Z]*)/gm;
			var replacer = function(match, id, offset, str) {
				if (id in replacements) {
					if (match.length == id.length) {
						if (whiten.charAt(offset) !== ' ')
							return replacements[id];
					}
					else {
						if (whiten.charAt(offset+1) !== ' ' )
							return match.substring(0,1) + replacements[id];
					}
				}
				return match;
			}
			var target = source.replace(ident, replacer);
			var whiten = target.replace(white, whitener);
			
			if (emitMatch) {
				var emitter = new RegExp('(^|\\s|[,:;{}()\\[\\]]|[\\-+~!?*\\/%<=>&|\\^])'+
						emitMatch +'\\s*\\(', 'gm');
				var r;
				while(r = emitter.exec(whiten)) {

					var b = 1, sb = 0, mb = 0, comma = 0, cb = 0;
					var i = emitter.lastIndex;

					while (i < target.length) {
						var c = target.charAt(i);

						switch (c) {
						case '{': 	mb++; break;
						case '}':	mb--; break;
						case '[':	sb++; break;
						case ']':	sb--; break;
						case '(':	b++; break;
						case ')':	b--;
							if(mb == 0 && sb == 0 && b == 0) {
								if (!comma) comma = i;
								cb = ++i;
							}
							break;
						case ',':
							if(comma == 0 &&
								mb == 0 && sb == 0 && b == 1) {
								comma = i;
							}
							break;
						}
						if (cb) break;
						i++;
					}
					if (!cb) break;
					
					var emr = '{var ' + emitElement +'=' + 
							target.substring(emitter.lastIndex, comma) + ';'+ emitBody + '}';
					
					var ri = r.index + r[1].length;
					whiten = whiten.substring(0,ri) + emr + whiten.substring(cb);
					target = target.substring(0,ri) + emr + target.substring(cb);
					
					emitter.lastIndex = 0;
				}
			}
			return target;
		}

		//with compile
		GenericChained.prototype.compile = function() {
				var args ="";

			var argValues = [];
			var argIndexes = [];

			var k = 0;
			for (var i=0; i<this.opNames.length; i++) {
				argIndexes[i] = k;
				var aa = this.opArguments[i];
				for (var j=0; j<aa.length; j++) {
					argValues.push(aa[j]);
					args += (k === 0) ? "_a" : ",_a";
					args += k;
					k++;
				}
			}
			var src = "return function(_data){"+
					"var _c={result:null,cancel:false};";

			var method;
			var emit = null;
			var count = this.opNames.length;

			if(this.finalOp){
				method = chainOperations[
						this.opNames[this.opNames.length - 1]];
				var argIndex = argIndexes[this.opNames.length - 1];
				if (method.beforeSource) {
					var replacements = {};
					replacements[method.beforeContext] = "_c";
					for (var k=0; k < method.methodArgs.length; ++k) {
						replacements[method.methodArgs[k]] = "_a" + (argIndex + k);
					}
					src += transformCode(method.beforeSource, replacements) + ';';
				}
			} 
			else {
				src += "_c.result=[];";
				emit = "_c.result[_c.result.length]=_e" + (this.opNames.length) + ";";
			}

			for (var j=count; j--;) {
				method = chainOperations[this.opNames[j]];
				var argIndex = argIndexes[j];
				

				var replacements = {};
				replacements[method.opElement] = "_e" + j;
				replacements[method.opContext] = "_c";
				
				for (var k=0; k < method.methodArgs.length; ++k) {
					replacements[method.methodArgs[k]] =
							"_a" + (argIndex + k);
				}
				if (method.closureIndex) {
					replacements[method.closureIndex] = j;
				}
				if (emit == null)
					emit = transformCode(method.opSource, replacements);
				else {
					emit = transformCode(method.opSource, replacements,
						emit, method.closureEmit, "_e" + (j+1));
				}
			}

			src += "for(var _i=0;_i<_data.length&&!_c.cancel;++_i){" +
					"var _e0=_data[_i];" +
					emit +
					"}";

			if(this.finalOp){
				method = chainOperations[
						this.opNames[this.opNames.length - 1]];
				var argIndex = argIndexes[this.opNames.length - 1];
				if (method.afterSource) {
					var replacements = {};
					replacements[method.afterContext] = "_c";
					for (var k=0; k < method.methodArgs.length; ++k) {
						replacements[method.methodArgs[k]] = "_a" + (argIndex + k);
					}
					src += transformCode(method.afterSource, replacements) + ';';
				}
			} 
			src += "return _c.result; }";
			//console.log(src);
			var closure = new Function(args, src);
			return closure.apply(null, argValues);

		}

		// Register operations

		var registerOperation = function (name, args, emit, index,
				opElement, opContext, opSource,
				beforeContext, beforeSource,
				afterContext, afterSource) {

			var src = 'return this.' +
				(emit ? 'link(' +
							'function(' + emit + 
								(index? ',' + index : '') +
								'){' +
					 			'return function(' + opElement+ ',' + opContext + '){' +
					 				opSource +
					 			'}'+
					 		'})'
					 : 'end(' +
				 			'function(' + opElement+ ',' + opContext + '){' +
					 			opSource +
					 		'}' +
					 		(beforeContext?
					 		',function(' + beforeContext + '){' +
					 			beforeSource +
					 		'}'
					 		: ',null') +
					 		(afterContext?
					 		',function(' + afterContext + '){' +
					 			afterSource +
					 		'}'
					 		: '') +
					 	')'
				);
		
			var operation = new Function(args.join(','), src);
			//console.log(operation.toString());

			var registry = {
				'methodArgs' : args,
				'closureEmit' : emit,
				'closureIndex' : index,
				'opElement': opElement,
				'opContext': opContext,
				'opSource' : opSource,
				'beforeContext': beforeContext,
				'beforeSource' : beforeSource,
				'afterContext': afterContext,
				'afterSource' : afterSource,
			};

			name.split(',').forEach(function(n){

				Chain.prototype[n] = operation;	
	
				//with no compile
				//GenericChain.prototype[n] = operation;
				
				//with compile
				GenericChain.prototype[n] = function() {
					this.opNames.push(n);
					this.opArguments.push(arguments);
					return operation.apply(this,arguments);
				}

				chainOperations[n] = registry;
			})
			
		}

		registerOperation('map', 
			['cb'], 'em', 0, 'e', 'c', 'em(cb(e), c)');

		registerOperation('filter',
			['cb'], 'em', 0,  'e', 'c', 'if (cb(e)) em(e, c)');

		registerOperation('reduce',
			['cb', 'iv'], 0, 0, 'e', 'c', 'c.result = cb(c.result, e)',
			'c', 'c.result = iv');

		registerOperation('forEach,each',
			['cb'], 0, 0, 'e', 'c', 'cb(e)');

		registerOperation('every,all',
			['cb'], 0, 0, 'e', 'c', 'if(!cb(e)){c.cancel=true}',
			0, 0, 'c', 'c.result = !c.cancel');

		registerOperation('some,any',
			['cb'], 0, 0, 'e', 'c', 'if(cb(e)){c.cancel=true}',
			0, 0, 'c', 'c.result = !!c.cancel');

		registerOperation('skip',
			['n'], 'em', 'i', 'e', 'c', 'if((c[i]=(c[i]?c[i]:0)+1)>n){em(e, c)}');
		
		registerOperation('limit',
			['n'], 'em', 'i', 'e', 'c', 'if((c[i]=(c[i]?c[i]:0)+1)<=n){em(e, c)}else{c.cancel=true}');

		registerOperation('count',
			[], 0, 0, 'e', 'c', 'c.result++');

		registerOperation('first',
			['n'], 0, 0, 'e', 'c', 'if(c.first<n){c.result[c.first++]=e}else{c.cancel=true}',
			'c', 'c.first=0;c.result=new Array(n)');

		registerOperation('last',
			['n'], 0, 0, 'e', 'c', 'c.result[(c.last++)%n]=e',
			'c', 'c.last=0;c.result=new Array(n)',
			'c', 'var s=c.last%n;if(s){var a=c.result,z=0,'+
			'f=function(l,r){while(++l<--r){z=a[l];a[l]=a[r];a[r]=z}};'+
			'f(-1,s);f(s-1,n);f(-1,n)}');

        // Exports
        // chain() or chain(array)

        var chainFunction = function(source) {
            if (source) {
            	var sourceType = typeof source;
				if (sourceType != 'object' && sourceType != 'function' || 
					!('length' in source)) {
					throw new Error('Wrong argument');												
				}
				return new Chain(source);
            } else {
            	return new GenericChain();
            }
            
        }
		
	// Export to Node.js
	if (typeof module === "object" && module && module.exports === context) {
        module.exports = { chain : chainFunction };
  	}

	// Export to context
	else {
		context.chain = chainFunction;
	}

})(this);