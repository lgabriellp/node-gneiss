var path = require("path");
var Builder = require("./builder");
var Promise = require("bluebird");
var child_process = Promise.promisifyAll(require("child_process"));

function Emulation() {

}

module.exports = Emulation;

Emulation.prototype.build = function(config) {
    var self = this;
    self.builder = new Builder({
        sunspot: path.join(__dirname, "..", config.sunspot),
        deploy: path.join(__dirname, "..", config.deploy)
    });

    return self.builder.configure(config.spots)
    .then(function() {
        return self.builder.build(config.spots);
    });
};

Emulation.prototype.run = function(config) {

};

/*
var child_process = require("child_process");
var stream = require("stream");
var async = require("async");
var util = require("util");
var _ = require("lodash");

var environment = require("./environment");
var childs = [];

process.on("exit", function() {
    _.forEach(childs, function(child) {
        child.kill("SIGINT");
    });
});

function Emulation(config, done) {
    stream.PassThrough.call(this);
    _.bindAll(this);

    async.series([
        async.apply(this._buildEnvironment, config),
        async.apply(this._start)
    ], done);
}

util.inherits(Emulation, stream.PassThrough);

Emulation.prototype._kill = function(done) {
    this.solarium.kill("SIGINT");
    this.xvfb.kill("SIGINT");
    done();
};

Emulation.prototype._emitKill = function(regex, done, data) {
    if (data.toString().match(regex)) {
        this._kill(done);
    }
};

Emulation.prototype.stop = function(config, done) {
    if (!config.timeout && !config.regex) {
        return done(new Error("Must pass timeout or regex"));
    }

    if (config.timeout) {
        setTimeout(async.apply(this._kill, done), config.timeout);
    }

    if (config.regex) {
        this.on("data", async.apply(this._emitKill, config.regex, done));
    }
};

Emulation.prototype.clean = function(done) {
    this.env.clean(done);
};

Emulation.prototype._buildEnvironment = function(config, done) {
    this.env = environment(config, done);
};

Emulation.prototype._emitEvents = function (data) {
    var lines = data.toString().split("\n");
    
    for (var i = 0; i < lines.length; i++) {
        var begin = lines[i].indexOf("{");
        var end = lines[i].indexOf("}");

        if (begin === -1 || end === -1) continue;

        this.emit("event", JSON.parse(lines[i].substr(begin, end)));
    }
};

Emulation.prototype._start = function(done) {
    this.xvfb = child_process.spawn("Xvfb", [ ":1" ]);
    this.solarium = child_process.spawn("ant", [
        "solarium",
        "-Dconfig.file=" + this.env.emulationFilePath
    ], {
        cwd: this.env.sunspot,
        env: { DISPLAY: ":1" },
        detached: true
    });

    childs.push(this.xvfb);
    childs.push(this.solarium);

    this.on("data", this._emitEvents);
    this.solarium.stdout.pipe(this);
    this.solarium.stderr.pipe(this);
    done();
};

module.exports = function(config, done) {
    return new Emulation(config, done);
};

*/
