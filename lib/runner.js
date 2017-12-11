var Line = require('./line');
var exec = require('child_process').exec;
function Reporter(){

}
Reporter.prototype.write = function(x){
    console.log(x);
}
/**
 * [processWorkspace description]
 * @param  {[type]} argv     [description]
 * @param  {[type]} reporter [description]
 * @return {[type]}          [description]
 */
function Runner(argv, options){
    this.since = argvToDate(argv.since);
    this.before = argvToDate(argv.before);
    this.path = argv.path;
    this.regex = options.regex && new RegExp(options.regex);
    this.pull = options.pull;
    this.reporter = new Reporter;
    this.enable_softTag = !!options.enable_softTag;
}
Runner.prototype.execp = function(cmd){
    return new Promise(function(resolve, reject){
        return exec(cmd, function(err, out, stderr){
            if(err||stderr){return reject(stderr);}
            return resolve(out);
        })
    })
}
Runner.prototype.gitpull = function(){
    return this.execp('cd '+this.path+' && git pull').catch(e=>{
        console.log('error? ', e);//TODO handle branch fetch
        return;
    })
}
Runner.prototype.gitlog = function(){
    var self = this;
    const TAGREGEX = /\d{4}/;
    var tok = '|@|';//separate author from msg
    return this.execp('cd '+self.path+' && git log --pretty=format:"%an'+tok+'%s" --since='+self.since+' --before='+self.before).then(out=>{
        var map = {};//hash -> msg
        out.split('\n').filter(function(x){
            return x.length>2;
        }).filter(line=>{
            if(!self.regex){return true;}
            return line.match(self.regex);
        }).map(function(x){
            var line = new Line(x, {TAGREGEX: TAGREGEX, enable_softTag:self.enable_softTag, tok: tok});
            map[line.tag] = map[line.tag] || [];
            map[line.tag].push(line);
        });

        var n = Object.keys(map).length;
        self.reporter.write(self.path+' ('+n+' ticket'+(n==1?'':'s')+')\n');
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
            self.reporter.write(x.line+'\n');
        });
    })
}
Runner.prototype.run = function(){
    var suite = [];
    if(this.pull){
        suite.push(()=>this.gitpull())
    }
    suite.push(()=>this.gitlog())
    return suite.reduce((acc,x)=>{
        return acc.then(_=>x())
    },Promise.resolve())
}

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

module.exports = Runner;