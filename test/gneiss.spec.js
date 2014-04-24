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
    var emu;
    this.timeout(60000);

    beforeEach(function() {
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
        });
    });

    afterEach(function() {
        emu.stop();
    });

    it("should start and stop an emulator", function(done) {
        setTimeout(done, 9000);
    });

    it("should pipe stdout and stderr", function(done) {
        emu.pipe(until("-do-run-solarium", done));
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

    describe("Store", function() {
        var store;
        var maxEvents = 2;
        
        beforeEach(function() {
            store = gneiss.store({
                host: "localhost",
                port: "27017",
                base: "test",
                name: "emulation-0",
            });
        });

        beforeEach(function() {
            var counter = 0;
            
            emu.on("event", function(ev) {
                store.save(ev, function(err) {
                    if (err) return done(err);
                    if (++counter < maxEvents) return;
                    
                    emu.emit("collect");
                });
            }); 
        });
    
        afterEach(function(done) {
            store.drop(done);
        });

        it("should collect events in database", function(done) {
            emu.on("collect", function() {
                store.find().toArray(function(err, events) {
                    assert.lengthOf(events, maxEvents);
                    done();
                });
            });
        });

        it("should collect wsn performance metrics using map/reduce");
    });
});
