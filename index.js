var child_process = require("child_process");
var stream = require("stream");
var util = require("util");
var swig = require("swig");
var fs = require("fs");

function Emulation(config) {
    stream.PassThrough.call(this);

    var configFile = "/tmp/emulation.xml";
    var argv = [ "solarium", "-Dconfig.file=" + __dirname + configFile ];
    var options = {
        cwd: config.path,
        env: process.env,
    };
   
    var text = swig.renderFile(__dirname + "/templates/emulation.xml", config);
    fs.writeFileSync(__dirname + configFile, text);

    this.child = child_process.spawn("ant", argv, options);
    this.on("data", function (data) {
        var lines = data.toString().split("\n");
        
        for (var i = 0; i < lines.length; i++) {
            var begin = lines[i].indexOf("{");
            var end = lines[i].indexOf("}");

            if (begin === -1 || end === -1) continue;

            this.emit("event", JSON.parse(lines[i].substr(begin, end)));
        }
    });

    this.child.stdout.pipe(this);
    this.child.stderr.pipe(this);
}

util.inherits(Emulation, stream.PassThrough);

Emulation.prototype.stop = function() {
    this.child.kill("SIGINT");
};

module.exports = {
    emulation: function(config, done) {
        return new Emulation(config, done);
    }
};
