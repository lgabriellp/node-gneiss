var gneiss = require(".");
var chai = require("chai");
var assert = chai.assert;
chai.use(require("chai-fs"));

describe("Spot Builder", function() {
    this.timeout(10000);
    var builder;

    beforeEach(function() {
        builder = gneiss.builder({ deploy: "test/tmp" });
    });
    
    afterEach(function(done) {
        builder.clean(function(err) {
            assert.notPathExists("test/tmp");
            done();
        });
    });
    
    it("should generate single jar file", function(done) {
        builder.build({
            name: "SimpleNode",
            version: "1.0.0",
            path: "../../Eclipse-Gneiss/SimpleSpot",
            midlets: [{
                name: "SimpleNode",
                pkg: "br.ufrj.dcc.simple"
            }]
        }, function(err) {
            assert.pathExists("test/tmp");
            assert.notIsEmptyFile("test/tmp/SimpleNode_1.0.0.jar");
            done();
        });
    });
});
