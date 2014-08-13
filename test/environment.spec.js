var gneiss = require("..");
var chai = require("chai");
var assert = chai.assert;
chai.use(require("chai-fs"));

describe("Environment", function() {
    var env;

    it("should create a deployment path", function(done) {
        env = gneiss.environment({
            sunspot: "../SunSPOT/sdk",
            deploy: "test/tmp",
            spots: [{
                path: "../../Eclipse-Gneiss/SimpleSpot/suite/",
                name: "SimpleNode_1.0.0.jar",
                midlets: [{
                    name: "SimpleNode",
                    pkg: "br.ufrj.dcc.simple"
                }]
            }, {
                path: "../../Eclipse-Gneiss/SimpleSpot/suite/",
                name: "SimpleNode_1.0.0.jar",
                midlets: [{
                    name: "SimpleNode",
                    pkg: "br.ufrj.dcc.simple"
                }]
            }, {
                path: "../../Eclipse-Gneiss/SimpleSpot/suite/",
                name: "SimpleNode_1.0.0.jar",
                midlets: [{
                    name: "SimpleNode",
                    pkg: "br.ufrj.dcc.simple"
                }]
            }]
        }, done);
    });

    it("should create deployment path from json file", function(done) {
        env = gneiss.environment({
            file: "test/fixtures/environment.json"
        }, done);
    });

    afterEach(function(done) {
        assert.pathExists("test/tmp");
        assert.pathExists("test/tmp/build.xml");
        assert.pathExists("test/tmp/emulation.xml");
        assert.pathExists("test/tmp/SimpleNode_1.0.0.jar");

        assert.property(env, "buildFilePath");
        assert.property(env, "emulationFilePath");
       
        assert.fileContent("test/tmp/emulation.xml",
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"+
            "<virtual-config keep-addresses=\"false\" run-midlets=\"true\">\n" +
            "    <virtual-spot>\n" +
            "        <jar file=\"SimpleNode_1.0.0.jar\"/>\n" +
            "        <midlet name=\"br.ufrj.dcc.simple.SimpleNode\"/>\n" +
            "    </virtual-spot>\n" +
            "    <virtual-spot>\n" +
            "        <jar file=\"SimpleNode_1.0.0.jar\"/>\n" +
            "        <midlet name=\"br.ufrj.dcc.simple.SimpleNode\"/>\n" +
            "    </virtual-spot>\n" +
            "    <virtual-spot>\n" +
            "        <jar file=\"SimpleNode_1.0.0.jar\"/>\n" +
            "        <midlet name=\"br.ufrj.dcc.simple.SimpleNode\"/>\n" +
            "    </virtual-spot>\n" +
            "</virtual-config>\n");

        env.clean(function(err) {
            if (err) return done(err);

            assert.notPathExists("test/tmp");
            done();
        });
    });
});
