var async = require("async");
var path = require("path");
var swig = require("swig");
var fs = require("fs-extra");
var _ = require("lodash");

function Environment(config, done) {
    async.series([
        async.apply(this.loadConfig.bind(this), config),
        async.apply(this.createBuildPath.bind(this)),
        async.apply(this.copyBuildFile.bind(this)),
        async.apply(this.copySpotsJar.bind(this)),
        async.apply(this.renderEmulationFile.bind(this)),
    ], done);
}

Environment.prototype.loadConfig = function(config, done) {
    if (!config.file) {
        _.assign(this, config);
        return done();
    }

    fs.readFile(config.file, function(err, text) {
        if (err) return done(err);

        _.assign(this, JSON.parse(text));
        done();
    }.bind(this));
};

Environment.prototype.createBuildPath = function(done) {
    fs.mkdirs(this.deploy, done);
};

Environment.prototype.copyBuildFile = function(done) {
    fs.copy(path.join(this.sunspot, "build.xml"),
            path.join(this.deploy, "build.xml"),
            done);
};

Environment.prototype.clean = function(done) {
    fs.remove(this.deploy, done);
};

Environment.prototype.copySpotsJar = function(done) {
    async.each(this.spots, function(spot, done) {
        var source = path.join(spot.path, spot.name);
        var destination = path.join(this.deploy, spot.name);

        fs.copy(source, destination, done);
    }.bind(this), done);
};

Environment.prototype.renderEmulationFile = function(done) {
    var template = path.join(__dirname, "templates", "emulation.xml");
    var rendered = path.join(__dirname, this.deploy, "emulation.xml");

    async.waterfall([
        async.apply(swig.renderFile, template, this),
        async.apply(fs.writeFile, rendered)
    ], done);
};

module.exports = function(config, done) {
    return new Environment(config, done);
};
