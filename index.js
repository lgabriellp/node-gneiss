var child_process = require("child_process");

function Emulation(config) {
    var argv = [ "solarium" ];
    var options = {
        cwd: config.path,
        env: process.env,
    };

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
