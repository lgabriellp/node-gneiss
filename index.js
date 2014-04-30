var child_process = require("child_process");
var mongoskin = require("mongoskin");
var stream = require("stream");
var events = require("events");
var async = require("async");
var util = require("util");
var path = require("path");
var swig = require("swig");
var fs = require("fs-extra");

function render(src, dst, config, done) {
    swig.renderFile(src, config, function(err, text) {
        if (err) return done(err);

        fs.writeFile(dst, text, done);
    });
}

function Emulation(config) {
    stream.PassThrough.call(this);

    var configFile = "/tmp/emulation.xml";
    var argv = [ "solarium", "-Dconfig.file=" + __dirname + configFile ];
    var options = {
        cwd: config.path,
        env: { DISPLAY: ":1" },
        detached: true
    };
   
    render(path.join(__dirname, "templates", "emulation.xml"),
           path.join(__dirname, configFile),
           config);

    this.xvfb = child_process.spawn("Xvfb", [ ":1" ], options);
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
    this.xvfb.kill("SIGINT");
};

Emulation.prototype.clean = function() {

};

function Store(config) {
    var url = "mongodb://" + config.host + ":" + config.port + "/" + config.base;
    this.db = mongoskin.db(url, { native_parser: true });
    this.collection = this.db.bind(config.name, { w: 1 });
}

Store.prototype.save = function(args, done) {
    this.collection.insert(args, done);
};

Store.prototype.find = function(args) {
    return this.collection.find(args);
};

Store.prototype.drop = function(done) {
    this.collection.remove(done);
};

function Builder(config) {
    events.EventEmitter.call(this);
    this.deploy = path.join(__dirname, config.deploy);
}

util.inherits(Builder, events.EventEmitter);

Builder.prototype.buildOne = function(spot, done) {
    var buildSourcePath = path.join(this.deploy, path.basename(spot.path), spot.version);
    var jarBuildName = spot.name + "_" + spot.version + ".jar";
    var jarBuildPath = path.join(buildSourcePath, "suite", jarBuildName);
    var jarDestPath = path.join(this.deploy, jarBuildName);

    async.series([
        async.apply(fs.mkdirs, this.deploy),
        async.apply(fs.copy, spot.path, buildSourcePath),
        function(callback) {
            spot.midlets.forEach(function(midlet, index) {
                midlet.number = index + 1;
            });

            callback();
        },
        async.apply(render,
                    path.join(__dirname, "templates", "manifest.mf"),
                    path.join(buildSourcePath, "resources", "META-INF", "manifest.mf"),
                    spot),
        
        async.apply(child_process.exec, "ant jar-app", {
            cwd: buildSourcePath
        }),
        async.apply(fs.copy, jarBuildPath, jarDestPath)
    ], function(err, results) {
        done(err, results);
    });
};

Builder.prototype.build = function(spots, done) {
    async.each(spots, this.buildOne.bind(this), done);
};

Builder.prototype.clean = function(done) {
    fs.remove(this.deploy, done);
};

module.exports = {
    builder: function(config) {
        return new Builder(config);
    },
    emulation: function(config) {
        return new Emulation(config);
    },
    store: function(config) {
        return new Store(config);
    }
};
