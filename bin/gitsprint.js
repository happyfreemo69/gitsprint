#!/usr/bin/node


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
    .options('p', {
        alias: 'pull',
        type:'string',
        describe:'pull before making the diff. 0 to disable, 1 to enable'
    })
    .options('f', {
        alias: 'file',
        type:'string',
        describe:'path to config.json',
        default: process.env.GITSPRINT_RC
    })
    .demand('since','before');

var argv = optimist.argv;
if(argv.help){
    optimist.showHelp()
    process.exit(0);
}



var fs = require('fs');
var Runner = require('../lib/runner');
var defconf = {
    enable_softTag : true,
    folders:[
        {path:process.cwd()}
    ]
};

function getConf(){
    return new Promise(function(resolve, reject){
        if(!argv.file){
            return resolve(Object.assign({}, defconf));
        }
        return fs.readFile(argv.file, function(err, data){
            if(err){
                return resolve(defconf);
            }
            try{
                var o = JSON.parse(fs.readFileSync(argv.file).toString());
                return resolve(o);
            }catch(e){
                return reject(e);
            }
        })  
    }).then(conf=>{
        if(argv.hasOwnProperty('pull')){
            argv.pull = argv.pull != '0';
        }
        return Object.assign({}, defconf, conf, argv);
    })
}
return getConf().then(conf=>{
    return conf.folders.reduce((acc,x)=>{
        return acc.then(_=>{
            var runner = new Runner({since: argv.since, before: argv.before, path: x.path}, {pull: conf.pull, regex: argv.regex, enable_softTag: conf.enable_softTag});
            return runner.run();
        })
    }, Promise.resolve())
}).catch(console.log.bind(console))