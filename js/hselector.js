(function(){



var utils = {
	width:function(el){
		if(this.isWindow(el)){
			return window.document.documentElement.clientWidth;
		}
		return this.getWidthOrHeight(el,'width','content');
	},
	inWidth:function(el){
		return this.getWidthOrHeight(el,'width','padding');
	},
	outWidth:function(el,margin){
		var extra = margin?'margin':'border';
		return this.getWidthOrHeight(el,'width',extra);
	},
	height:function(el){
		if(this.isWindow(el)){
			return window.document.documentElement.clientHeight;
		}
		return this.getWidthOrHeight(el,'height','content');
	},
	inHeight:function(el){
		return this.getWidthOrHeight(el,'height','padding');
	},
	outHeight:function(el,margin){
		var extra = margin?'margin':'border';
		return this.getWidthOrHeight(el,'height',extra);
	},
	getWidthOrHeight:function(el,type,extra){
		var isHide = false;
		var _display, _visibility;
		if(el.style.display === 'none') { //不可见
			isHide = true;
			_display = el.style.display, 
			_visibility = el.style.visibility;
			el.style.display = 'block';
			el.style.visibility = 'hidden';
		}

		var styles = this.getStyle(el),
			val = this.curCSS(el,type,styles),
			isBorderBox = this.curCSS(el,'boxSizing',styles) === 'border-box';

		if(val === 'auto'){
			val = el['offset'+type[0].toUpperCase()+type.slice(1)];
		}

		val = parseFloat(val)||0;
		
		var finalVal = ( val + this.argumentWidthOrHeight(el,type,extra,isBorderBox,styles) );

		if(isHide){
			el.style.display = _display;
			el.style.visibility = _visibility;
		}

		return finalVal;
	},
	getStyle:function(el){
		var view = el.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( el );
	},
	curCSS:function(el,type,styles){
		var val;
		if(styles){
			val = styles.getPropertyValue(type) || styles[type];
		}
		return val;
	},
	//当为 borderBox 时，width 宽度为 content+padding+border
	argumentWidthOrHeight:function(el,type,extra,isBorderBox,styles){
		var val = 0, that = this;
		var cssExpand = [ "Top", "Right", "Bottom", "Left" ];
		var i;

		if(extra === (isBorderBox?'border':'content') ){ // 此时不需要进行padding、border、margin的加减，所以不参与循环
			i = 4;
		}else{
			i = ( type==='width' ? 1 : 0 );			
		}

		for(;i<4;i=i+2){

			if(extra === 'margin'){
				val += parseFloat( that.curCSS(el, 'margin'+cssExpand[i], styles) );
			}

			// 当为 border-box 时，减去
			if(isBorderBox){
				// padding 和 content 时都会减去 border
				if(extra !== 'margin'){
					val -= parseFloat( that.curCSS(el, 'border'+cssExpand[i]+'Width', styles) );
				}

				if(extra === 'content'){
					val -= parseFloat( that.curCSS(el, 'padding'+cssExpand[i], styles) );
				}
			}else{
				if(extra !== 'content'){
					val += parseFloat( that.curCSS(el, 'padding'+cssExpand[i], styles) );
				}
				if(extra === 'border'|| extra === 'margin'){
					val += parseFloat( that.curCSS(el, 'border'+cssExpand[i]+'Width', styles) );
				}
			}

		}
		return val;
	},
	isWindow:function( obj ) {
		return obj != null && obj === obj.window;
	},
	css:function(el,name,value){
		// 取值
		if(typeof name === 'string' && value === undefined){
			var styles = this.getStyle(el);
			var val = this.curCSS(el,name,styles);
			return val;
		}

		// 赋值		
		var type = typeof name,
		i;
		if(type === 'string'){
			this.style(el,name,value);
		}else if(type === 'object'){
			for(i in name){
				this.style(el,i,name[i]);
			}
		}
	},
	style:function(el,name,value){
		var type = typeof value,
			style = el.style;
		if ( value !== undefined ) {

			if(type === 'number'){
				value += this.cssNumber[name]?'':'px';
			}

			style[ name ] = value;
		}
	},
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},
	remove:function(el){
		var p = el.parentNode;
		if(p){
			el.parentNode.removeChild( el );
		}
		return el;
	},
	hasClass:function(el,value){
		var className = ' '+value+' ';
		var curValue = el.getAttribute && el.getAttribute('class') || '';
		var cur = ' '+this.stripAndCollapse(curValue)+' ';

		if(cur.indexOf(className) > -1){
			return true;
		}
		return false;
	},
	addClass:function(el, value){
		var classes = this.classesToArray(value),
		curValue,cur,j,clazz,finalValue;

		if(classes.length>0){
			curValue = el.getAttribute && el.getAttribute('class') || '';
			cur = ' '+this.stripAndCollapse(curValue)+' ';

			if(cur){
				var j=0;
				while( (clazz = classes[j++]) ){
					if ( cur.indexOf( ' ' + clazz + ' ' ) < 0 ) {
						cur += clazz + ' ';
					}
				}

				finalValue = this.stripAndCollapse(cur);
				if(curValue !== finalValue){
					el.setAttribute('class',finalValue);
				}
			}
		}
	},
	removeClass:function(el, value){
		var classes = this.classesToArray(value),
		curValue,cur,j,clazz,finalValue;

		if(classes.length>0){
			curValue = el.getAttribute && el.getAttribute('class') || '';
			cur = ' '+this.stripAndCollapse(curValue)+' ';

			if(cur){
				var j=0;
				while( (clazz = classes[j++]) ){
					if ( cur.indexOf( ' ' + clazz + ' ' ) > -1 ) {
						cur = cur.replace(' '+clazz+' ' ,' ');
					}
				}

				finalValue = this.stripAndCollapse(cur);
				if(curValue !== finalValue){
					el.setAttribute('class',finalValue);
				}
			}
		}
	},
	stripAndCollapse:function(value){
		var htmlwhite = ( /[^\s]+/g );
		var arr = value.match(htmlwhite)||[];
		return arr.join(' ');
	},
	classesToArray:function(value){
		if ( Array.isArray( value ) ) {
			return value;
		}
		if ( typeof value === "string" ) {
			var htmlwhite = ( /[^\s]+/g );
			return value.match( htmlwhite ) || [];
		}
		return [];
	},
	extend:function(){
		var target  = arguments[0],
			i = 1,
			length = arguments.length,
			obj,copy,name;

		for(;i<length;i++){
			obj = arguments[i];
			for(name in obj){
				copy = obj[name];
				target[name] = copy;
			}
		}

		return target;
	},
	addHandler : function(element, type, handler){
		if (element.addEventListener) {
			element.addEventListener(type, handler, false);
		}
		else if (element.attachEvent) {
			element.attachEvent("on" + type, handler);
		}else {
			element["on" + type] = handler;
		}
	},
	removeHandler : function(element, type, handler){
		if(element.removeEventListener){
			element.removeEventListener(type, handler, false);
		}else if(element.attachEvent){
			element.detachEvent("on"+type, handler);
		}else{
			element["on" + type] = null;
		}
	}
};


//-------------------------- tips -------------------
function getRelativeBoundingClientRect(reference, position) {
	var parentRect = getBoundingClientRect(document.documentElement);
	var referenceRect = getBoundingClientRect(reference);

	if(position === 'fixed') {
		return referenceRect;
	}

	return {
		top: referenceRect.top - parentRect.top,
		bottom: referenceRect.top - parentRect.top + referenceRect.height,
        left: referenceRect.left - parentRect.left,
        right: referenceRect.left - parentRect.left + referenceRect.width,
        width: referenceRect.width,
        height: referenceRect.height
    };
}
// TODO
function getBoundingClientRect(element) {
    var rect = element.getBoundingClientRect();

    var isIE = navigator.userAgent.indexOf("MSIE") != -1;

    var rectTop = isIE && element.tagName === 'HTML'
        ? -element.scrollTop
        : rect.top;

    return {
        left: rect.left,
        top: rectTop,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.right - rect.left,
        height: rect.bottom - rectTop
    };
}
var DEFAULT = {
	placement: 'top',
	modifiers: [ 'applyStyle' ],
}
function Popper(reference, popper, options){
	this._reference = reference;
	this._popper = popper;
	this._options = utils.extend({}, DEFAULT, options);
	this._options.modifiers = this._options.modifiers.map(function(modifier){
		return this.modifiers[modifier] || modifier;
	}.bind(this));
	this._popper.setAttribute('x-placement', this._options.placement);
	this.position = this._getPosition(reference);
	//this.update();
	return this;
}
Popper.prototype._getPosition = function(reference){
	var isFixed = this._isFixed(reference);
	return isFixed ? 'fixed' : 'absolute';
}
Popper.prototype._isFixed = function(el){
	if(el === document.body){
		return false;
	}
	if( utils.css(el,'position') === 'fixed' ){
		return true;
	}
	return el.parentNode ? this._isFixed(el.parentNode) : el;
}
Popper.prototype.update = function(referenceWidth){
	var data = { instance: this };
	data.placement = this._options.placement;
	utils.css(this._popper, 'width', referenceWidth);
	data.offsets = this._getOffsets(this._popper, this._reference, data.placement);

	this.modifiers.applyStyle.call(this,data);
}
/*
	placement: 暂时只有 top/bottom/left/right,
	以后会增加为 top/top-start/top-end/
			   bottom/bottom-start/bottom-end/
			   left/left-start/left-end/
			   right/right-start/right-end
*/
Popper.prototype._getOffsets = function(popper, reference, placement){
	var referenceOffsets = getRelativeBoundingClientRect(reference, this.position);
	var popperOffsets = {};
	popperOffsets.width = utils.outWidth(popper, true);
	popperOffsets.height = utils.outHeight(popper, true);
	
	placement = placement.split('-')[0];
	if(placement === 'right' || placement === 'left') {
		popperOffsets.top = referenceOffsets.top + referenceOffsets.height/2 - popperOffsets.height/2;
		if(placement === 'right'){
			popperOffsets.left = referenceOffsets.right;
		}else {
			popperOffsets.left = referenceOffsets.left - popperOffsets.width;
		}
	}else {
		popperOffsets.left = referenceOffsets.left + referenceOffsets.width/2 - popperOffsets.width/2;
		if(placement === 'top'){
			popperOffsets.top = referenceOffsets.top - popperOffsets.height;
		}else {
			popperOffsets.top = referenceOffsets.bottom;
		}
	}

	return {
        popper: popperOffsets,
        reference: referenceOffsets
    };
}
Popper.prototype.modifiers = {
	applyStyle: function(data){
		var styles = {
            position: this.position
        };

        // round top and left to avoid blurry text
        var left = Math.round(data.offsets.popper.left);
        var top = Math.round(data.offsets.popper.top);
		styles.left =left;
		styles.top = top;
		utils.css(this._popper, styles);
	}
}
//------------------ tips end -----------------------------

var popperInstances = [];

var hselector = window.hselector = {
	init: function(options) {
		return new HSelector(options);
	}
}

function HSelector(options) {
	this.currentValue = options.currentValue;
	this.options = options;
	this.reference = document.getElementById(options.id);

	this.setCurrentValue(options);

	this.popper = this.createPopper();

	this.popperInstance = new Popper(this.reference, this.popper, { placement: 'bottom' });
	this.popperInstance.reference = this.reference;
	popperInstances.push(this.popperInstance);

	this.initListener();

	window.onresize = function() {
		for(var i=0,l=popperInstances.length; i<l; i++) {
			var referenceWidth = utils.outWidth(popperInstances[i].reference);
			popperInstances[i].update(referenceWidth);	
		}
	}
}

HSelector.prototype.setCurrentValue = function(options) {
	if(this.currentValue) {
		if(options.label) {
			this.reference.value = this.currentValue[options.label];
		}else {
			this.reference.value = this.currentValue;
		}
	}
}

HSelector.prototype.createPopper = function() {
	var popper = document.createElement('div');
	utils.addClass(popper, 'hclayer-tips hclayer-anim hclayer-anim-fadeIn');
	var html = '<div class="scrollbar"><div class="dropdown-wrapper"><ul class="dropdown-list">';
	if(this.options.label) {
		for(var i=0,l=this.options.data.length; i<l; i++) {
			var item = this.options.data[i];
			html += '<li class="dropdown-item"><span>'+item[this.options.label]+'</span></li>';
		}	
	}else {
		for(var i=0,l=this.options.data.length; i<l; i++) {
			var item = this.options.data[i];
			html += '<li class="dropdown-item"><span>'+item+'</span></li>';
		}
	}
	html += '</ul></div><div class="scrollbar-bar-vertical"><div class="scrollbar-bar-thumb"></div></div></div>';
	popper.innerHTML = html;
	var referenceWidth = utils.outWidth(this.reference);
	utils.css(popper, 'width', referenceWidth);
	document.body.appendChild(popper);
	this.initScrollBar(popper);
	utils.css(popper, 'display', 'none');
	return popper;
}

HSelector.prototype.initScrollBar = function(popper) {
	var thumb = popper.getElementsByClassName('scrollbar-bar-thumb')[0];
	var wrapper = this.scrollWrapper = popper.getElementsByClassName('dropdown-wrapper')[0];
	var scrollOffset = wrapper.scrollHeight - wrapper.clientHeight; // 滚动内容超出的长度
	if(scrollOffset <= 0) return;

	var barHeight = wrapper.clientHeight / (wrapper.scrollHeight / wrapper.clientHeight); // 滚动条的长度 
	thumb.style.height = barHeight + 'px';

	var barOffset = wrapper.clientHeight - barHeight; // 滚动条长度 与 内容可视高度 的差值
	wrapper.onscroll = function() {
		// 当没滚动是，scrollTop 为 0，因此此时 top 为 0
		// 当滚动到底时， scrollTop = scrollOffset, 所以 top 为 barOffset 的高度，表现上来看就是滚动条滚到底了
		var top = barOffset * (this.scrollTop / scrollOffset);
		thumb.style.top = top + 'px';
	}
}

HSelector.prototype.initListener = function() {
	var that = this;
	utils.addHandler(that.reference, 'focus', function() {
		that.popperInstance.update();
		that.showTips(that.popper);
		that.scrollWrapper.scrollTop = 0;
	});
	utils.addHandler(that.reference, 'blur', function() {
		that.closeTips(that.popper);
	})
	var items = that.popper.getElementsByClassName('dropdown-item');
	for(var i=0,l=items.length; i<l; i++) {
		items[i].onclick = function(index){
			return function() {
				if(that.options.label) {
					that.reference.value = that.options.data[index][that.options.label];
				}else {
					that.reference.value = that.options.data[index];
				}
				var realValue = '';
				if(that.options.value) {
					realValue = that.options.data[index][that.options.value];
				}else {
					realValue = that.options.data[index];
				}
				if(typeof that.options.clickCallback === 'function') {
					that.options.clickCallback(realValue, that);
				}
				that.currentValue = realValue;
			}
		}(i);
	}
}

HSelector.prototype.closeTips = function(popper, isEnterPopper) {
	utils.addClass(popper, 'hclayer-anim-fadeOut');
	setTimeout(function() {
		utils.css(popper, 'display', 'none');
	}, 200)
}

HSelector.prototype.showTips = function(popper) {
	utils.addClass(popper, 'hclayer-anim-fadeIn');
	utils.removeClass(popper, 'hclayer-anim-fadeOut');
	utils.css(popper, 'display', 'block');
}


})();