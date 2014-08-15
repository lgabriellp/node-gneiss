var async = require("async");
var path = require("path");
var swig = require("swig");
var fs = require("fs-extra");
var _ = require("lodash");

function Environment(config, done) {
    _.bindAll(this);
    
    async.series([
        async.apply(this._loadConfig, config),
        async.apply(this._createBuildPath),
        async.apply(this._copyBuildFile),
        async.apply(this._copySpotsJar),
        async.apply(this._renderEmulationFile),
    ], done);
}

Environment.prototype.clean = function(done) {
    fs.remove(this.deploy, done);
};

Environment.prototype._loadConfig = function(config, done) {
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

Environment.prototype._createBuildPath = function(done) {
    fs.mkdirs(this.deploy, done);
};

Environment.prototype._copyBuildFile = function(done) {
    var original = path.join(this.sunspot, "build.xml");
    var duplicate = path.join(this.deploy, "build.xml");

    this.buildFilePath = duplicate;

    fs.copy(original, duplicate, done);
};

Environment.prototype._copySpotsJar = function(done) {
    async.each(this.spots, function(spot, done) {
        var source = path.join(spot.path, spot.name);
        var destination = path.join(this.deploy, spot.name);

        fs.copy(source, destination, done);
    }.bind(this), done);
};

Environment.prototype._renderEmulationFile = function(done) {
    var template = path.join(__dirname, "templates", "emulation.xml");
    var rendered = path.join(__dirname, this.deploy, "emulation.xml");

    this.emulationFilePath = rendered;

    async.waterfall([
        async.apply(swig.renderFile, template, this),
        async.apply(fs.writeFile, rendered)
    ], done);
};

module.exports = function(config, done) {
    return new Environment(config, done);
};
