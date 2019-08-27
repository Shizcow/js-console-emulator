
// processes code, stylize, and wrap in spans
function stylize_code(code){
    // this should be itterative so we don't need 4 million wrappers
    var tokens = []; // tokenizer

    for(let i = 0; i<code.length; ++i){
	if("[]{}(),;\\,:/~".includes(code[i])){
	    var paren = document.createElement('span');
	    paren.innerText = code[i];
	    paren.style.color = "#D7D7DB";
	    tokens.push(paren);
	} else if("!@-=+<>|?%^&*_".includes(code[i])){
	    var operator = document.createElement('span');
	    operator.innerText = code[i];
	    operator.style.color = "#B1B1B3";
	    tokens.push(operator);
	} else if("#".includes(code[i])){
	    var modifier = document.createElement('span');
	    modifier.innerText = code[i];
	    modifier.style.color = "#FC7BE6";
	    tokens.push(modifier);
	} else if(code[i] == "\n"){
	    tokens.push(document.createElement('br'));
	} else if("\"\'".includes(code[i])){ // need to paint all of string white
	    delimeter = code[i];
	    var stringWrapper = document.createElement('span');
	    stringWrapper.innerText = code[i] + code.substr(i+1).split(code[i])[0] + code[i];
	    stringWrapper.style.color = "#6B89FF";
	    tokens.push(stringWrapper);
	    i += stringWrapper.innerText.length-1;
	} else if(token = ["true", "false", "null", "undefined", "class", "function", "let", "var", "return", "yield"].filter(el => code.substr(i, el.length) == el), token.length){ // bools & keywords
	    var boolWrapper = document.createElement('span');
	    boolWrapper.innerText = token[0];
	    boolWrapper.style.color = "#E170CF";
	    tokens.push(boolWrapper);
	    i += boolWrapper.innerText.length-1;
	} else if(token = code.substr(i).match(/^[A-Za-z\$\_][A-Za-z1-9\$\_]*/)){ // identifier
	    token = token[0];
	    var identifier = document.createElement('span');
	    identifier.innerText = token;
	    identifier.style.color = "#906FC7";
	    tokens.push(identifier);
	    i += identifier.innerText.length;
	    while(token = code.substr(i).match(/^\s*\./)){ // property
		var point = document.createElement('span');
		point.innerText = token;
		point.style.color = "#D7D7DB";
		tokens.push(point);
		i += point.innerText.length;
		token = code.substr(i).match(/^\s*[A-Za-z\$\_][A-Za-z1-9\$\_]*/); // following property, if applicable
		if(token && token.length){
		    var property = document.createElement('span');
		    property.innerText = token;
		    property.style.color = "#86DE74";
		    tokens.push(property);
		    i += property.innerText.length;
		}
	    }
	    --i;
	} else if(token = code.substr(i).match(/^[1-9]*[\.]?[1-9]+/)){
	    var number = document.createElement('span');
	    number.innerText = token;
	    number.style.color = "#6B89FF";
	    tokens.push(number);
	    i += number.innerText.length-1;
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

	preFormattedCode = code; // don't show the user our hacks

	// before we do literally anything, we need to parse the input a bit
	// reason being: classes don't declare in evals
	// unless they're wrapped in parens
	// so we need to find every instance of 'class', and go until {}
	for(let i=0; i<code.length; ++i){
	    if(code.substr(i, 6) == "class " && (code[i-1] == undefined || " \t\n{}()".includes(code[i-1]))){
		let j = code.slice(i).indexOf("{");
		if(j == -1)
		    break; // missing paren error
		className = code.substr(i+6).split("{")[0];
		j = code.slice(i).indexOf("{")+i+1;
		for(let parens = 1; parens > 0;){
		    if(code[j] == undefined)
			break; // unmatched paren
		    iOpen = code.slice(j).indexOf("{");
		    iClosed = code.slice(j).indexOf("}");
		    if(iOpen == -1 || iClosed < iOpen){
			parens--;
			j += iClosed+1;
		    } else {
			parens++;
			j += iOpen+1;
		    }
		}
		i = j;
		code = code.slice(0, i) + "; window." + className + " = " + className + "; undefined;" + code.slice(i); // undefined for consistant behavior
	    }
	}

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
	error = false;
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
