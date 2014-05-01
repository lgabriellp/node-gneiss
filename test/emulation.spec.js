var gneiss = require(".");
var through = require("through");
var chai = require("chai");
var assert = chai.assert;
chai.use(require("chai-fs"));

function until(expression, done) {
    return through(function (data) {
        if (data.toString().indexOf(expression) < 0) return;
        done();
    });
}

describe("Emulation", function() {
    var emu;
    this.timeout(60000);

    beforeEach(function(done) {
        emu = gneiss.emulation({
            path: "/home/lgabriel/Workspace/Ufrj/SunSPOT/sdk",
            spots: [{
                name: "SimpleNode",
                version: "1.0.0",
                path: "../../../Eclipse-Gneiss/SimpleSpot",
                midlets: [{
                    name: "SimpleNode",
                    pkg: "br.ufrj.dcc.simple"
                }]
            }]
        }, done);
    });

    beforeEach(function(done) {
        emu.pipe(until("-do-run-solarium", done));
    });

    beforeEach(function() {
        assert.pathExists("tmp/emulation.xml");
    });

    afterEach(function(done) {
        emu.stop();
        emu.clean(function(err) {
            if (err) return done(err);

            assert.notPathExists("tmp/emulation.xml");
            assert.notPathExists("tmp");
            done();
        });
    });

    it("should start and stop an emulator", function(done) {
        setTimeout(done, 9000);
    });

    it("should run a midlet", function(done) {
        emu.pipe(until("\"event\": \"step\"", done));
    });

    it("should emit events", function(done) {
        emu.on("event", function(ev) {
            assert.isObject(ev);
            assert.property(ev, "event");
            assert.property(ev, "address");

            if (ev.event === "step") done();
        });
    });
    
    it("should run multiple spots");
    it("should run multiple spots with multiples midlets");
});
