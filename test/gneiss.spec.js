var gneiss = require(".");
var through = require("through");
var assert = require('chai').assert;

function until(expression, done) {
    return through(function (data) {
        if (data.toString().indexOf(expression) < 0) return;
        done();
    });
}

describe("Gneiss Emulation", function() {
    this.timeout(60000);

    beforeEach(function() {
        this.emu = gneiss.emulation({
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
        }); 
    });

    afterEach(function() {
        this.emu.stop();
    });

    it("should start and stop an emulator", function(done) {
        setTimeout(done, 9000);
    });

    it("should pipe stdout and stderr", function(done) {
        this.emu.pipe(until("-do-run-solarium", done));
    });

    it("should run a midlet", function(done) {
        this.emu.pipe(until("\"event\": \"step\"", done));
    });

    it("should emit events", function(done) {
        this.emu.on("event", function(ev) {
            assert.isObject(ev);
            assert.property(ev, "event");
            assert.property(ev, "address");

            if (ev.event === "step") done();
        });
    });

    it("should save events in database");
    it("should compute wsn performance metrics");
});
