var Emulation = require("../lib/emulation");
var path = require("path");

describe("Emulation", function() {
    this.timeout(10000);
    var self = {};
    
    beforeEach(function() {
        self.project = path.join(__dirname, "../../sunspot-simple");
        self.emu = new Emulation();

        return self.emu.build({
            sunspot: "deps/SunSPOT/sdk",
            deploy: "test/deploy",
            spots: [{
                name: "SimpleNode",
                version: "A",
                path: self.project,
                midlets: [{
                    name: "SimpleNode",
                    package: "br.ufrj.dcc.simple"
                }]
            }, {
                name: "SimpleNode",
                version: "B",
                path: self.project,
                midlets: [{
                    name: "SimpleNode",
                    package: "br.ufrj.dcc.simple"
                }]
            }, {
                name: "SimpleNode",
                version: "C",
                path: self.project,
                midlets: [{
                    name: "SimpleNode",
                    package: "br.ufrj.dcc.simple"
                }]
            }] 
        });
    });

    it("should build", function() {
        return self.emu.run({
            stop: 1000
        });
    });
/*

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
*/
});
