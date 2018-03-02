/*#######################
    下拉框 
    
使用方法：
    var data = ['销售','清算中','已清算'];
    //var data = [{name:'hc',value:'1'},{name:'hucong',value:'10000'}]

    new Hcselect({
        id:'test',
        data:data,
        icon:'./1.png',
        iconFn:function(params){
            console.log('click icon!',params);
            if(params.show){
                this.hideItems();
            }else{
                this.showItems();
            }
        },
        inputFn:function(params){
            console.log('click input!',params);
        },
        itemFn:function(params){
            console.log('click item!',params);
            params.inputEl.value = params.data;
        }
    });

    icon: 图标，可以为图片地址、html代码、false
######################*/
(function(exports){



var domUtil = {
    getWidthOrHeight:function(el,name,extra){
        var styles = window.getComputedStyle(el);
        var val = null;
        if(styles){
            val = styles.getPropertyValue(name)||styles[name];
        }
        if(val === 'auto'){
            val = el['offset'+name[0].toUpperCase()+name.slice(1)];
        }
        val = parseFloat(val)||0;
        if(extra === 'border'){
            if(name === 'width'){
                var br = styles.getPropertyValue('border-right-width'),
                bl = styles.getPropertyValue('border-left-width');
                val = val + parseFloat(br) + parseFloat(bl);    
            }
            if(name === 'height'){
                var bb = styles.getPropertyValue('border-bottom-width'),
                bt = styles.getPropertyValue('border-top-width');
                val = val + parseFloat(bb) + parseFloat(bt);
            }
        }
        return val;
    },
    width:function(el){
        if(true){ //可见
            return this.getWidthOrHeight(el,'width');
        }else{ //不可见

        }
    },
    bwidth:function(el){
        if(true){ //可见
            return this.getWidthOrHeight(el,'width','border');
        }else{ //不可见

        }
    },
    height:function(el){
        if(true){ //可见
            return this.getWidthOrHeight(el,'height');
        }else{ //不可见

        }
    },
    bheight:function(el){
        if(true){ //可见
            return this.getWidthOrHeight(el,'height','border');
        }else{ //不可见

        }
    },
    offset:function(el){
        var rect,doc,docElem,win;

        rect = el.getBoundingClientRect();

        doc = el.ownerDocument;
        docElem = doc.documentElement;
        win = doc.defaultView;

        return {
            top: rect.top + win.pageYOffset - docElem.clientTop,
            left: rect.left + win.pageXOffset - docElem.clientLeft
        };
    },
    hasClass:function(el,value){
        var className = ' '+value+' ';
        var curValue = el.getAttribute && el.getAttribute('class') || '';
        var cur = ' '+this._stripAndCollapse(curValue)+' ';

        if(cur.indexOf(className) > -1){
            return true;
        }
        return false;
    },
    _stripAndCollapse:function(value){
        //var htmlwhite = ( /[^\x20\t\r\n\f]+/g );
        var htmlwhite = ( /[^\s]+/g );
        var arr = value.match(htmlwhite)||[];
        return arr.join(' ');
    },
    remove:function(el){
        var p = el.parentNode;
        if(p){
            p.removeChild( el );
        }
        return el;
    },
    one:function(el,type,fn){
        var origFn = fn;
        fn = function(){
            el.removeEventListener(type,fn,false);
            return origFn();
        };
        el.addEventListener(type,fn,false);
    }
}

var Hcsel = exports.Hcselect = function(option){
    this.el = null; // 容器
    this.initOption(option);
    this.top = null;
    this.left = null;
    this.h = null;
    this.w = null;

    this.div = null;  // 内容框

    this.checkElement();
}
Hcselect.prototype.initOption = function(option){
    option.id = option.id||'';
    option.data = option.data || null;
    option.icon = option.icon || '';
    option.readonly = option.readonly;
    option.inputFn = option.inputFn || function(){};
    option.iconFn = option.iconFn || function(){};
    option.itemFn = option.itemFn || function(){};
    option.up = option.up || false;
    this.option = option;
    this.el = document.getElementById(option.id);
}
Hcselect.prototype.checkElement = function(){
    if(this.el){
        this.createContent();
        this.initItems(this.option.data);
        this.initPosition();
        this.initEvents();
    }else{
        console.log("Selector error: error id!")
    }
}
Hcselect.prototype.createContent = function(){
    this.el.innerHTML = this.views();
    this.inputEl = this.el.getElementsByClassName('hcselector-input')[0];

    // 弹出的内容框
    this.div = document.createElement('div');
    this.div.className = 'hcselector-div';
    this.div.show = false;
}
//内层的html
Hcselect.prototype.views = function(){
    var imgRe = /[.]+(jpg|gif|png|bmp|jpeg)$/;
    var htmlRe = /^<[^\n]+>$/;

    var html = '';
    var readonly = this.readonly?'readonly':'';
    var icon = this.option.icon;
    if(icon){
        if(imgRe.test(icon)){ // 图片地址
            html = '<div class="hcselector-wrapper"><input '+readonly+' type="text" name="hcselector-input" class="hcselector-input"><img src="'+icon+'" class="hcselector-icon"></div>';
        }else if(htmlRe.test(icon)){ // html代码
            if(icon.match(/class="/)){  // 有class属性则在里面添加hcselector-icon
                var arr = icon.split('class="');
                var classes = arr[1].split('"')[0];
                var tmpIcon = icon;
                icon = tmpIcon.replace(classes,classes+' hcselector-icon');
            }else{ // 直接添加 class="hcselector-icon"
                var arr = icon.split(/^</);
                var arr2 = arr[1].split(" ");
                arr2[0] += ' class="hcselector-icon"';
                icon = '<'+arr2.join('');
            }
            html = '<div class="hcselector-wrapper"><input '+readonly+' type="text" name="hcselector-input" class="hcselector-input">'+icon+'</div>';
        }
    }else{
        var html = '<div class="hcselector-wrapper"><input '+readonly+' type="text" name="hcselector-input" class="hcselector-input hcselector-input-full"></div>';
    }
    return html;
}
Hcselect.prototype.initItems = function(data){
    var html = '';
    for(var i=0;i<data.length;i++){
        var item = data[i];
        if(typeof item === 'object'){
            var name = item.name || '';
            html += '<div class="hcselector-item" hc-index="'+i+'">'+name+'</div>';
        }else{
            html += '<div class="hcselector-item" hc-index="'+i+'">'+item+'</div>';
        }
    }
    this.div.innerHTML = html;
}
Hcselect.prototype.initPosition = function(){
    var offset = domUtil.offset(this.el);
    this.top = offset.top;
    this.left = offset.left;
    this.w = domUtil.bwidth(this.el);
    this.h = domUtil.bheight(this.el);
    if(this.option.up){ // 如果设置了向上弹出

        // 获得 this.div 的高度
        this.div.style.visibility = 'hidden';
        document.body.appendChild(this.div);
        var divHeight = domUtil.height(this.div);
        domUtil.remove(this.div);

        this.div.style.cssText = 'box-sizing:border-box;position:fixed;top:'+(this.top-divHeight)+'px;left:'+(this.left)+'px;width:'+this.w+'px;z-index:666;cursor:pointer';
    }else{
        this.div.style.cssText = 'box-sizing:border-box;position:fixed;top:'+(this.top+this.h)+'px;left:'+(this.left)+'px;width:'+this.w+'px;z-index:666;cursor:pointer';
    }
}
Hcselect.prototype.initEvents = function(){
    var _this = this;

    // 事件设置，弹出内容框
    this.el.onclick = function(evt){
        var tar = evt.target;
        console.log(tar)

        if( domUtil.hasClass(tar,'hcselector-input') ){
            var params = {
                el:tar,
                show:_this.div.show
            };
            _this.option.inputFn.call(_this,params);
        }

        if( domUtil.hasClass(tar,'hcselector-icon') ){
            var params = {
                el:tar,
                show:_this.div.show
            };
            _this.option.iconFn.call(_this,params);
        }

        evt.stopPropagation();

    };

    // item 的点击事件
    this.div.onclick = function(evt){
        var tar = evt.target;
        if( domUtil.hasClass(tar,'hcselector-item') ){
            var index = tar.getAttribute('hc-index')|0;
            var params = {
                data:_this.option.data[index],
                el:tar,
                inputEl:_this.inputEl,
                show:_this.div.show
            };
            _this.option.itemFn.call(_this,params);
        }
        //evt.stopPropagation();
        // 开启了冒泡，说明点击时会触发 document 的 click 事件
    };

    window.onresize = function(){
        _this.initPosition();
    }

};
Hcselect.prototype.showItems = function(){
    var _this = this;
    document.body.appendChild(this.div);
    this.div.show = true;
    // document 添加一次 click 事件，用于隐藏
    domUtil.one(document,'click',function(){
        _this.hideItems();
    })
};
Hcselect.prototype.hideItems = function(){
    domUtil.remove(this.div);
    this.div.show = false;
}
Hcselect.prototype.setData = function(data){
    this.initItems(data);
}



}(typeof exports === 'object' ? exports : window));