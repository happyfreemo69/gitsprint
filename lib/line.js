function Line(x, options){
    this.tok = options.tok;
    this.author;
    this.tag;
    this.msg;
    var idx = x.indexOf(this.tok);

    var format=x.substring(0, idx);
    this.author = format.substring(format.indexOf('=')+1);
    var left = x.substring(idx+this.tok.length);
    var res = left.split(' ');
    var tag = res[0];
    if(tag.match(options.TAGREGEX)){
        this.tag = tag.match(options.TAGREGEX)[0];
        res.shift();
    }else if(left.match(options.TAGREGEX) && options.enable_softTag){
        //we generally commit as something like [TG-1234] some comment
        //but maybe we forgot and wrote something like: Fix for 1234
        this.tag = left.match(options.TAGREGEX);
    }else{
        this.tag = 'junk';
    }
    this.msg = res.slice(0).join(' ');
}


Line.prototype.isValid = function(){
    return !!this.tag;
}
Line.prototype.output = function(){
    return this.author+' - '+this.msg;
}
module.exports = Line;