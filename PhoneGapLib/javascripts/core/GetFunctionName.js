/* Helper code to resolve anonymous callback functions,

If the function callback can be resolved by name it is returned unaltered.
If the function is defined in an unknown scope and can't be resolved, an internal reference to the function is added to the internal map.

Callbacks added to the map are one time use only, they will be deleted once called.  

example 1:

function myCallback(){};

fString = GetFunctionName(myCallback);

- result, the function is defined in the global scope, and will be returned as is because it can be resolved by name.

example 2:

fString = GetFunctionName(function(){};);

- result, the function is defined in place, so it will be returned unchanged.

example 3:

function myMethod()
{
    var funk = function(){};
    fString = GetFunctionName(funk);
}

- result, the function CANNOT be resolved by name, so an internal reference wrapper is created and returned.


*/


var _anomFunkMap = {};
var _anomFunkMapNextId = 0; 

function anomToNameFunk(fun)
{
	var funkId = "f" + _anomFunkMapNextId++;
	var funk = function()
	{
		fun.apply(this,arguments);
		_anomFunkMap[funkId] = null;
		delete _anomFunkMap[funkId];	
	}
	_anomFunkMap[funkId] = funk;

	return "_anomFunkMap." + funkId;
}

function GetFunctionName(fn)
{
  if (typeof fn === "function") {
    var name= fn.name;	
	if (!name) {
      var m = fn.toString().match(/^\s*function\s+([^\s\(]+)/);
      name= m && m[1];	
	}
	if (name && (window[name] === fn)) {
		return name;
	} else {
		return anomToNameFunk(fn);
	} 
  }else {
  	return null;
  }
}
