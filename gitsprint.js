#!/usr/bin/node

var conf = {};
conf.enable_softTag = true;

var fs = require('fs');

var optimist = require('optimist')
    .usage('$0: node app -s 171115 -b 171125')
    .options('s', {
        alias : 'since',
        type:'string',
        describe:'aammjj'
    })
    .options('r', {
        alias: 'regex',
        describe:'regex will match any entry matching the string author:description',
    })
    .options('b', {
        alias: 'before',
        type:'string',
        describe:'aammjj',
        default:'now'
    })
    .demand('since','before');

var argv = optimist.argv;
if(argv.help){
    optimist.showHelp()
    process.exit(0);
}
var y = fs.existsSync('.git');
if(!y){
    console.log(process.cwd()+' is not a git folder');
    process.exit(1);
}
var exec = require('child_process').exec;
var regex = new RegExp(argv.regex);
var tok = '|@|';//separate author from msg
var since =  argvToDate(argv.since);
var before =  argvToDate(argv.before);
function argvToDate(x){
    function twoDigits(s){
        return ('0'+s).substr(-2);
    }
    var d = new Date();
    if(x!='now'){
        var [a1,a2,a3,a4,a5,a6] = x.split('');
        d=new Date(2000+parseInt(a1+a2, 10), parseInt(a3+a4, 10)-1, parseInt(a5+a6,10));
    }
    return [d.getFullYear(), twoDigits(d.getMonth()+1), twoDigits(d.getDate())].join('-');
}
var cmd = 'git log --pretty=format:"%an'+tok+'%s" --since='+since+' --before='+before;


//ticket number is assumed to be anything 4 digits
const TAGREGEX = /\d{4}/;


function Line(x){
    this.author;
    this.tag;
    this.msg;
    var idx = x.indexOf(tok);

    var format=x.substring(0, idx);
    this.author = format.substring(format.indexOf('=')+1);
    var left = x.substring(idx+tok.length);
    var res = left.split(' ');
    var tag = res[0];
    if(tag.match(TAGREGEX)){
        this.tag = tag.match(TAGREGEX)[0];
        res.shift();
    }else if(left.match(TAGREGEX) && conf.enable_softTag){
        //we generally commit as something like [TG-1234] some comment
        //but maybe we forgot and wrote something like: Fix for 1234
        this.tag = left.match(TAGREGEX);
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
exec(cmd, function(err, out, stderr){
    if(err||stderr){return console.error(err, stderr);}

    var map = {};//hash -> msg
    out.split('\n').filter(function(x){
        return x.length>2;
    }).filter(line=>{
        if(!regex){return true;}
        return line.match(regex);
    }).map(function(x){
        var line = new Line(x);
        map[line.tag] = map[line.tag] || [];
        map[line.tag].push(line);
    });
    Object.keys(map).map(function(key){
        var lines = map[key].map(function(line){return '\t'+line.output()}).join('\n');
        var str = '';
        str += key + '\n';
        str += lines;
        var idx = key=='junk'?0:parseInt(key,10);
        return {line:str, idx:idx}
    }).sort(function(a,b){
        return a.idx - b.idx;
    }).forEach(function(x){
        console.log(x.line+'\n');
    });
});