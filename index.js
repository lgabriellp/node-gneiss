var child_process = require("child_process");
var swig = require("swig");
var fs = require("fs");

function Emulation(config) {
    var configFile = "/tmp/emulation.xml";
    var argv = [ "solarium", "-Dconfig.file=" + __dirname + configFile ];
    var options = {
        cwd: config.path,
        env: process.env,
    };
   
    var text = swig.renderFile(__dirname + "/templates/emulation.xml", config);
    fs.writeFileSync(__dirname + configFile, text);

    this.child = child_process.spawn("ant", argv, options);
}

Emulation.prototype.pipe = function(stream) {
    this.child.stdout.pipe(stream);
    this.child.stderr.pipe(stream);
};

Emulation.prototype.stop = function() {
    this.child.kill("SIGINT");
};

module.exports = {
    emulation: function(config, done) {
        return new Emulation(config, done);
    }
};
