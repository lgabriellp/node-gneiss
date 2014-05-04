var child_process = require("child_process");
var mongoskin = require("mongoskin");
var events = require("events");
var async = require("async");
var swig = require("swig");
var util = require("util");
var path = require("path");
var fs = require("fs-extra");

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

function render(src, dst, config, done) {
    swig.renderFile(src, config, function(err, text) {
        if (err) return done(err);

        fs.writeFile(dst, text, done);
    });
}

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
    store: function(config) {
        return new Store(config);
    },
    environment: require("./environment"),
    emulation: require("./emulation")
};
