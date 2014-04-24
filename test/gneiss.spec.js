var gneiss = require(".");
var through = require("through");
var assert = require('chai').assert;

describe("Gneiss Emulation", function() {
    this.timeout(10000);

    afterEach(function() {
        this.emu.stop();
    });

    it("should start and stop an emulation", function(done) {
        this.emu = gneiss.emulation({
            path: "/home/lgabriel/Workspace/Eclipse-Gneiss/SimpleSpot",
        });

        setTimeout(done, 9000);
    });

    it("should pipe stdout and stderr", function(done) {
        this.emu = gneiss.emulation({
            path: "/home/lgabriel/Workspace/Eclipse-Gneiss/SimpleSpot",
        });

        this.emu.pipe(through(function (data) {
            if (data.toString().indexOf("-do-run-solarium") < 0) return;

            done();
        }));
    });
});
