// Builder Implementation
// ======================

// requirements
// ------------
// - **lodash** for utilities
// - **path** for filesystem path manipulations
// - **bluebird** for A+ promises implementation
// - **swig** for template rendering
// - **fs-extra** for filesystem manipulations
// - **child_process** for running ant build system
var _ = require("lodash");
var path = require("path");
var Promise = require("bluebird");
var swig = Promise.promisifyAll(require("swig"));
var fs = Promise.promisifyAll(require("fs-extra"));
var child_process = Promise.promisifyAll(require("child_process"));

// render(src, dst, config)
// ------------------------
// Renders templates located in templates directory
//
// - **src** is the name of the template;
// - **dst** is the destination path of the rendered template
// - **config** is the configuration to be applyed to the template

function render(src, dst, config) {
    return swig.renderFileAsync(path.join.apply(path, [
        __dirname, "templates", src
    ]), config)
    .then(function(text) {
        return fs.writeFileAsync(dst, text);
    });
}

// Builder(config)
// ---------------
// Builder class is the responsible for configuring and building required jar
// files to be used in solarium emulations
//
// - **config.sunspot** is the path of the sunspot installation
// - **config.deploy** is the path of the jars deployment

function Builder(config) {
    this.buildFile = path.join.apply(path, [
        __dirname, "deps", "SunSPOT", "build.xml"
    ]);

    this.sunspot = config.sunspot;
    this.deploy = config.deploy;
}

Builder.prototype.configureOne = function(spot) {
    var self = this;
    
    spot.sunspot = self.sunspot;
    spot.deploy = self.deploy;
    spot.buildPath = path.join.apply(path, [
        self.deploy,
        path.basename(spot.path),
        spot.version
    ]);
    spot.jarPath = path.join.apply(path, [
        spot.buildPath,
        "suite",
        spot.name + "_" + spot.version + ".jar"
    ]);

    _.forEach(spot.midlets, function(midlet, index) {
        midlet.number = index + 1;
    });

    return fs.mkdirsAsync(self.deploy)
    .then(function() {
        return fs.copyAsync(spot.path, spot.buildPath);
    }).then(function() {
        return render("build.xml", path.join.apply(path, [
            spot.buildPath,
            "build.xml",
        ]), spot);
    }).then(function() {
        return render("manifest.mf", path.join.apply(path, [
            spot.buildPath,
            "resources",
            "META-INF",
            "manifest.mf"
        ]), spot);
    });
};

Builder.prototype.buildOne = function(spot) {
    return child_process.execAsync("ant", {
        cwd: spot.buildPath
    }).then(function() {
        return fs.copyAsync(spot.jarPath, path.join.apply(path, [
            spot.deploy,
            path.basename(spot.jarPath)
        ]));
    });
};

Builder.prototype.configure = function(spots) {
    var self = this;
    if (!_.isArray(spots)) spots = [spots];

    return Promise.map(spots, function(spot) {
        return self.configureOne(spot);
    }, { concurrency: 3 });
};

Builder.prototype.build = function(spots) {
    var self = this;
    if (!_.isArray(spots)) spots = [spots];

    return Promise.map(spots, function(spot) {
        return self.buildOne(spot);
    }, { concurrency: 3 });
};

Builder.prototype.clean = function(done) {
    fs.remove(this.deploy, done);
};

module.exports = function(config, done) {
    return new Builder(config, done);
};
