
// processes code, stylize, and wrap in spans
function stylize_code(code){
    // this should be itterative so we don't need 4 million wrappers
    var tokens = []; // tokenizer
    for(let i = 0; i<code.length; ++i){
	var token = "";
	if(token = code.substr(i).match(/^\/\*[\s\S]*?\*\/|^\s*\/\/.*\s*/)){ // single line comment
	    var comment = document.createElement('span');
	    comment.innerText = token[0];
	    comment.style.color = "#858587";
	    tokens.push(comment);
	    i += token[0].length-1;
	} else if(token = code.substr(i).match(/^(\s*[\[\]\{\}\{\}\(\)\,\;\\\:\/\~]\s*)+/)){
	    var paren = document.createElement('span');
	    paren.innerText = token[0];
	    paren.style.color = "#D7D7DB";
	    tokens.push(paren);
	    i += token[0].length-1;
	} else if(token = code.substr(i).match(/^(\s*[\!\@\+\-\=\<\>\|\?\%\^\&\*]\s*)+/)){
	    var operator = document.createElement('span');
	    operator.innerText = token[0];
	    operator.style.color = "#B1B1B3";
	    tokens.push(operator);
	    i += token[0].length-1;
	} else if(token = code.substr(i).match("^#")){
	    var modifier = document.createElement('span');
	    modifier.innerText = token[0];
	    modifier.style.color = "#FC7BE6";
	    tokens.push(modifier);
	    i += token[0].length-1;
	} else if(token = code.substr(i).match(/^(\s*?\"[\s\S]*?\"\s*?)+/)){ // string & expansion
	    var stringWrapper = document.createElement('span');
	    stringWrapper.innerText = token[0];
	    stringWrapper.style.color = "#6B89FF";
	    tokens.push(stringWrapper);
	    i += token[0].length-1;
	} else if(token = code.substr(i).match(/^(\s*(true|false|null|undefined|class|function|let|var|return|yield)\s*)+/)){
	    var boolWrapper = document.createElement('span');
	    boolWrapper.innerText = token[0];
	    boolWrapper.style.color = "#E170CF";
	    tokens.push(boolWrapper);
	    i += boolWrapper.innerText.length-1;
	} else if(token = code.substr(i).match(/^(\s*(?!(true|false|null|undefined|class|function|let|var|return|yield)(?![A-Za-z1-9\$\_]))[A-Za-z\$\_][A-Za-z1-9\$\_]*\s*)+/)){ // identifier - filter out keywords
	    var identifier = document.createElement('span');
	    identifier.innerText = token[0];
	    identifier.style.color = "#906FC7";
	    tokens.push(identifier);
	    i += token[0].length;
	    while(token = code.substr(i).match(/^(\s*\.\s*)+/)){ // property
		var point = document.createElement('span');
		point.innerText = token[0];
		point.style.color = "#D7D7DB";
		tokens.push(point);
		i += point.innerText.length;
		if(token = code.substr(i).match(/^\s*(?!(true|false|null|undefined|class|function|let|var|return|yield)(?![A-Za-z1-9\$\_]))[A-Za-z\$\_][A-Za-z1-9\$\_]*\s*/)){ // following property, if applicable - no expansion
		    var property = document.createElement('span');
		    property.innerText = token[0];
		    property.style.color = "#86DE74";
		    tokens.push(property);
		    i += token[0].length;
		}
	    }
	    --i;
	} else if(token = code.substr(i).match(/^(\s*[1-9]*[\.]?[1-9]+\s*)+/)){
	    var number = document.createElement('span');
	    number.innerText = token[0];
	    number.style.color = "#6B89FF";
	    tokens.push(number);
	    i += token[0].length-1;
	} else {
	    var def = document.createElement('span');
	    def.innerText = code[i];
	    def.style.color = "#906FC7";
	    tokens.push(def);
	}
    }

    var wrapper = document.createElement('span');
    for(let i = 0; i<tokens.length; ++i)
	wrapper.appendChild(tokens[i]);
    return wrapper;
}

// returned DOM code, wrapped all up
function stylize_ret(innerVar){
    var wrapper = document.createElement('span');
    wrapper.style.color = "#78787B";
    switch(typeof innerVar){
    case "boolean":
	wrapper.innerText = innerVar;
	wrapper.style.color = "#78C46A";
	break;
    case "string":
	wrapper.innerText = "\"" + innerVar + "\"";
	wrapper.style.color = "#D7D7DB";
	break;
    case "function":
	wrapper.appendChild(stylize_code(innerVar.toString()));
	break;
    case "object":
	if(innerVar === null){
	    wrapper.innerText = "null";
	} else if (Array.isArray(innerVar)){
	    var tmp = document.createElement("span");
	    tmp.style.color = "#75BFFF";
	    tmp.innerText = "[ ";
	    wrapper.appendChild(tmp);

	    for(let i = 0; i<innerVar.length; ++i){
		wrapper.appendChild(stylize_ret(innerVar[i]));
		if(i == innerVar.length-1)
		    break;
		tmp = document.createElement("span");
		tmp.style.color = "#D6D6DA";
		tmp.innerText = ", ";
		wrapper.appendChild(tmp);
	    }
	    
	    tmp = document.createElement("span");
	    tmp.style.color = "#75BFFF";
	    tmp.innerText = " ]";
	    wrapper.appendChild(tmp);
	} else { // "normal" object
	    var tmp = document.createElement("span");
	    tmp.style.color = "#75BFFF";
	    tmp.innerText = "{ ";
	    wrapper.appendChild(tmp);

	    pairs = Object.entries(innerVar);
	    
	    for(let i = 0; i<pairs.length; ++i){
		tmp = document.createElement("span");
		tmp.style.color = "#75BFFF";
		tmp.innerText = pairs[i][0];
		wrapper.appendChild(tmp);
		tmp = document.createElement("span");
		tmp.innerText = ": ";
		wrapper.appendChild(tmp);
		wrapper.appendChild(stylize_ret(pairs[i][1]));
		if(i == pairs.length-1)
		    break;
		tmp = document.createElement("span");
		tmp.style.color = "#D6D6DA";
		tmp.innerText = ", ";
		wrapper.appendChild(tmp);
	    }
	    
	    tmp = document.createElement("span");
	    tmp.style.color = "#75BFFF";
	    tmp.innerText = " }";
	    wrapper.appendChild(tmp);
	    
	}
	break;
    case "number":
	if(!isNaN(innerVar)){
	    wrapper.innerText = innerVar;
	    wrapper.style.color = "#86DE74";
	    break;
	} // if NaN, fall through, color is in css class
    default:
	wrapper.innerText = innerVar;
    }
    return wrapper;
}

var hist = 0;
var histBottom = "";
function focusBox(){
    var text = "";
    if (typeof window.getSelection != "undefined") {
        text = window.getSelection().toString();
    } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
        text = document.selection.createRange().text;
    }
    
    pointer = document.getElementById("pointer");
    codeInput = document.getElementById("codeInput");
    if(document.activeElement === codeInput || text == "") {
	codeInput.focus();
	pointer.style.color = "#75BAFF";
    } else {
	pointer.style.color = "#858587";
    }
}
document.onmouseup = focusBox;
document.onkeyup = focusBox;

document.getElementById("codeInput").onkeydown = function(e){
    if(e.keyCode==9 || e.which==9){ // tab
        e.preventDefault();
        var s = this.selectionStart;
        this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
        this.selectionEnd = s+1; 
    }
    if(e.keyCode==38 || e.which==38){ // up
	var start = this.selectionStart;
	var finish = this.selectionEnd;
	topWrapper = document.getElementById("topWrapper")
	if(start == finish && (this.value.indexOf("\n") == -1 || this.value.indexOf("\n") >= start) && topWrapper.children.length > hist){
	    e.preventDefault();
	    if(hist == 0)
		histBottom = this.value;
	    this.value = topWrapper.children[topWrapper.children.length-(hist++)-1].children[0].children[1].innerText;
	    this.setSelectionRange(this.value.length,this.value.length);
	}
    }
    if(e.keyCode==40 || e.which==40){ // down
	var start = this.selectionStart;
	var finish = this.selectionEnd;
	topWrapper = document.getElementById("topWrapper")
	if(start == finish && (this.value.lastIndexOf("\n") == -1 || this.value.lastIndexOf("\n") < start)){
	    e.preventDefault();
	    --hist;
	    if(hist<0)
		hist = 0;
	    if(hist == 0)
		this.value = histBottom;
	    else
		this.value = topWrapper.children[topWrapper.children.length-hist].children[0].children[1].innerText;
	}
    }
    if((e.keyCode==13 || e.which==13) && !e.shiftKey){ // enter
        e.preventDefault();
	var code = document.getElementById("codeInput").value;

	if(code == "")
	    return;
	topWrapper = document.getElementById("topWrapper");
	
	hist = 0;

	let preFormattedCode = code;

	// first, use esprima to grab all varibles that should be global at the end and need some
	// help getting into the proper scope
	let names = [];
	let error = false
	let parsed;
	try{
	    parsed = esprima.parseScript(code, {range: true});
	} catch (e){
	    error = true; // so errors work
	}
	for(let i=0; !error&&i<parsed.body.length;++i){
	    if(parsed.body[i].type == "VariableDeclaration" && parsed.body[i].kind == "let" || parsed.body[i].kind == "const")
		for(let j=0; j<parsed.body[i].declarations.length; ++j)
		    names.push({type: parsed.body[i].kind, name: parsed.body[i].declarations[j].id.name});
	    else if(parsed.body[i].type == "ClassDeclaration")
		names.push({type: "class", name: parsed.body[i].id.name});
	}
	
	// problem: this means the last line doesnt give the right return value
	// we need a way to pass through any return value, past the next statement

	// need to be injected immediatly after varible declaration, and have an extra varible line
	// esprima can give locations of varible definitions (Line and column-based or Index-based range)

	// idea: get the index range of the LAST global declaration (of any type). That will guarentee a safe spot to put a semicolon and inject Object.defineProperties - plural, then add the name after again
	if(names.length){
	    finalDeclaration = parsed.body.filter(el => el.type.includes("Declaration")).slice(-1)[0];
	    if(finalDeclaration.declarations)
		finalDeclaration = finalDeclaration.declarations.slice(-1)[0];
	    if(finalDeclaration){
		properties = "Object.defineProperties(window, {"
		for(let i=0; i<names.length; ++i){
		    properties += names[i].name + ": {enumerable: true, configurable: false, get: function(){return " + names[i].name + ";}, set: function(val){";
		    if(names[i].type == "const")
			properties += "throw new TypeError(\"invalid assignment to const `" + names[i].name + "'\");";
		    if(names[i].type == "let" || names[i].type == "class")
			properties += "return " + names[i].name + " = val;"
		    properties += "}}";
		    if(i < names.length-1)
			properties += ",";
		}
		properties+= "})"
		code = code.substr(0, finalDeclaration.range[1]) + ";" + properties + ";" + finalDeclaration.id.name + ";" + code.substr(finalDeclaration.range[1])
	    }
	}
	
	//     ex: let a = 0; Object.define...; a;
	// Object.defineProperty(window, "a", {below v})
	// for const: {enumerable: true, configurable: false, get: function(){return a;}, set: function(val){console.error("TypeError: invalid assignment to const `a'")}}
	// for let: {enumerable: true, configurable: false, get: function(){return a;}, set: function(val){return a = val;}}
	// class is same as let
	
	// also, redirect console.log to our terminal emulator
	// this means we need to start building divs first

	document.getElementById("codeInput").value = "";
	var resultWrapper = document.createElement('div');
	resultWrapper.className = "resultWrapper";

	var evaluatedWrapper = document.createElement('div');
	evaluatedWrapper.className = "tableWrapper";
	var resultPointer = document.createElement('label');
	resultPointer.className = "resultPointer";
	resultPointer.innerText = ">>";

	var evaluated = stylize_code(preFormattedCode);//document.createElement('span');
	//var evaluated = stylize_code(code);//document.createElement('span');
	evaluated.className = "evaluated";
	
	evaluatedWrapper.appendChild(resultPointer);
	evaluatedWrapper.appendChild(evaluated);
	resultWrapper.appendChild(evaluatedWrapper);

	
	var oldLog = console.log;
	console.log = function(wrapper){
	    return function(result){
		var logWrapper = document.createElement('div');
		logWrapper.className = "tableWrapper";
		var resultArrow = document.createElement('label');
		resultArrow.className = "resultArrow";
		resultArrow.innerText = " ";
		var returned = stylize_ret(result);
		
		logWrapper.appendChild(resultArrow);
		logWrapper.appendChild(returned);
		resultWrapper.appendChild(logWrapper);
	    }
	}(resultWrapper);
	toClear = false;
	clear = function(){
	    toClear = true;
	    while(topWrapper.firstChild)
		topWrapper.removeChild(topWrapper.firstChild);
	}
	var result;
	try{
	    result = (1, eval)(code);
	} catch(e) {
	    result = e;
	    error = true; // so errors work
	}
	console.log = oldLog;
	if(toClear)
	    return;
	
	var logWrapper = document.createElement('div');
	logWrapper.className = "tableWrapper";
	var resultArrow = document.createElement('label');
	resultArrow.className = "resultArrow";
	resultArrow.innerText = error ? " " : "←";
	var returned = stylize_ret(result);
	if(error){
	    returned.innerText = result;
	    returned.style.color = "red";
	}
	logWrapper.appendChild(resultArrow);
	logWrapper.appendChild(returned);
	resultWrapper.appendChild(logWrapper);

	
	topWrapper.appendChild(resultWrapper);
	render();
	document.getElementById("topWrapper").scrollTop = document.getElementById("topWrapper").scrollHeight;
    }
}

render = function(){
    codeInput = document.getElementById("codeInput");
    bottomWrapper = document.getElementById("bottomWrapper");
    topWrapper = document.getElementById("topWrapper");
    
    bottomWrapper.style.height = (document.body.offsetHeight - topWrapper.offsetHeight) + "px";
    codeInput.style.overflowY = "hidden";
    if(topWrapper.scrollHeight+codeInput.scrollHeight > document.body.offsetHeight/* && codeInput.scrollHeight != prevScrollHeight*/){
	bottomWrapper.style.height = "14pt";
	bottomWrapper.style.height = (codeInput.scrollHeight)+'px';
	topWrapper.style.height = window.innerHeight-bottomWrapper.offsetHeight + "px";
	if(topWrapper.offsetHeight < 19){ // need to start scrolling on input
	    topWrapper.style.height = "14pt";
	    bottomWrapper.style.height = (document.body.offsetHeight - topWrapper.offsetHeight) + "px";
	    codeInput.style.overflowY = "scroll";
	    codeInput.blur();
	    codeInput.focus();
	}
    }
}

window.onresize = render;
render();
