var gneiss = require("..");
var chai = require("chai");
var assert = chai.assert;
chai.use(require("chai-fs"));

describe("Emulation", function() {
    var emu;

    beforeEach(function(done) {
        emu = gneiss.emulation({
            file: "test/fixtures/environment.json"
        }, done);
    });
    
    afterEach(function(done) {
        emu.clean(function(err) {
            if (err) return done(err);

            assert.notPathExists("test/tmp");
            done();
        });
    });

    it("should stop after a timeout", function(done) {
        emu.stop({
            timeout: 1000
        }, done);
    });

    it("should stop after a sentence", function(done) {
        this.timeout(20000);

        emu.stop({
            regex: /"event":\s+"step"/gm
        }, done);
    });

    it("should emit events", function(done) {
        this.timeout(20000);

        emu.on("event", function(ev) {
            assert.isObject(ev);
            assert.property(ev, "event");
            assert.property(ev, "address");

            if (ev.event === "step") {
                emu.stop({
                    timeout: 1
                }, done);
            }
        });
    });
});
