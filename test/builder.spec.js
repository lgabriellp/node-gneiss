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
        builder.buildOne({
            name: "SimpleNode",
            version: "1.0.0",
            path: "../../Eclipse-Gneiss/SimpleSpot",
            midlets: [{
                name: "SimpleNode",
                pkg: "br.ufrj.dcc.simple"
            }]
        }, function(err) {
            if (err) return done(err);

            assert.pathExists("test/tmp");
            assert.notIsEmptyFile("test/tmp/SimpleNode_1.0.0.jar");
            done();
        });
    });

    it("should generate multiple jar files", function(done) {
        builder.build([{
            name: "SimpleNode",
            version: "A",
            path: "../../Eclipse-Gneiss/SimpleSpot",
            midlets: [{
                name: "SimpleNode",
                package: "br.ufrj.dcc.simple"
            }]
        }, {
            name: "SimpleNode",
            version: "B",
            path: "../../Eclipse-Gneiss/SimpleSpot",
            midlets: [{
                name: "SimpleNode",
                package: "br.ufrj.dcc.simple"
            }]
        }, {
            name: "SimpleNode",
            version: "C",
            path: "../../Eclipse-Gneiss/SimpleSpot",
            midlets: [{
                name: "SimpleNode",
                package: "br.ufrj.dcc.simple"
            }]
        }], function(err) {
            if (err) return done(err);
            
            assert.pathExists("test/tmp");
            assert.notIsEmptyFile("test/tmp/SimpleNode_A.jar");
            assert.notIsEmptyFile("test/tmp/SimpleNode_B.jar");
            assert.notIsEmptyFile("test/tmp/SimpleNode_C.jar");
            done();
        });
    });
});
