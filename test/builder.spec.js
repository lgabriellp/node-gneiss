var gneiss = require("..");
var chai = require("chai");
var path = require("path");
var _ = require("lodash");
var assert = chai.assert;
chai.use(require("chai-fs"));

describe("Spot Builder", function() {
    this.timeout(10000);
    var self = {};

    beforeEach(function() {
        self.deploy = path.join(__dirname, "deploy");
        self.project = path.join(__dirname, "../../sunspot-simple");
        self.sunspot = path.join(__dirname, "../deps/SunSPOT/sdk");

        self.builder = gneiss.builder({
            deploy: self.deploy,
            sunspot: self.sunspot
        });
        
        assert.notPathExists(self.deploy);
        assert.pathExists(self.project);
        assert.pathExists(self.sunspot);
    });

    afterEach(function(done) {
        self.builder.clean(function(err) {
            if (err) return done(err);

            assert.notPathExists(self.deploy);
            assert.pathExists(self.project);
            done();
        });
    });

    it("should build single spot jar", function() {
        var spot = {
            name: "SimpleNode",
            vendor: "DCC-UFRJ",
            version: "1.0.0",
            path: self.project,
            midlets: [{
                name: "SimpleNode",
                pkg: "br.ufrj.dcc.simple"
            }]
        };

        return self.builder.configure(spot).then(function() {
            _.forEach(spot.midlets, function(midlet, index) {
                assert.equal(midlet.number, index + 1);
            });

            assert.pathExists(self.deploy);
            assert.fileContent(path.join.apply(path, [
                spot.buildPath,
                "build.xml"
            ]), [
                '<?xml version="1.0" encoding="UTF-8"?>',
                '<project name="SimpleNode" default="jar-app" basedir=".">',
                '    <property name="sunspot.home" value="' + self.sunspot + '"/>',
                '    <property name="user.home" value="' + self.deploy + '"/>',
                '    <import file="${sunspot.home}/build.xml"/>',
                '</project>',
                ''
            ].join("\n"));

            assert.fileContent(path.join.apply(path, [
                spot.buildPath,
                "resources",
                "META-INF",
                "manifest.mf"
            ]), [
                'MIDlet-Name: SimpleNode',
                'MIDlet-Version: 1.0.0',
                'MIDlet-Vendor: DCC-UFRJ',
                'MIDlet-1: SimpleNode, , br.ufrj.dcc.simple.SimpleNode',
                'MicroEdition-Profile: IMP-1.0',
                'MicroEdition-Configuration: CLDC-1.1',
                ''
            ].join("\n"));
        }).then(function() {
            return self.builder.build(spot);
        }).then(function() {
            assert.notIsEmptyFile(path.join.apply(path, [
                self.deploy,
                "SimpleNode_1.0.0.jar"
            ]));
        });
    });

    it("should build multiple spot jar", function() {
        var spots = [{
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
        }];

        return self.builder.configure(spots)
        .then(function() {
            return self.builder.build(spots);
        }).then(function() {
            assert.pathExists(self.deploy);
            assert.notIsEmptyFile(path.join(self.deploy, "SimpleNode_A.jar"));
            assert.notIsEmptyFile(path.join(self.deploy, "SimpleNode_B.jar"));
            assert.notIsEmptyFile(path.join(self.deploy, "SimpleNode_C.jar"));
        });
    });
});
