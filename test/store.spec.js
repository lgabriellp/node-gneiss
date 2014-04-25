var gneiss = require(".");
var _ = require("lodash");
var events = require("events");
var assert = require('chai').assert;

describe.only("Store", function() {
    var store;
    var samples;
    var emitter;
    
    beforeEach(function() {
        emitter = new events.EventEmitter();
        samples = [
            { seqno: 0, energy: 100 }, 
            { seqno: 0, energy: 80 },
            { seqno: 0, energy: 60 },
            { seqno: 1, energy: 90 },
            { seqno: 1, energy: 70 },
            { seqno: 1, energy: 50 },
            { seqno: 2, energy: 80 },
            { seqno: 2, energy: 60 },
            { seqno: 2, energy: 40 }
        ];
        
        store = gneiss.store({
            host: "localhost",
            port: "27017",
            base: "test",
            name: "emulation-0",
        });
        store.save(samples, function() {
            emitter.emit("collect");
        });
    });

    afterEach(function(done) {
        store.drop(done);
    });

    it("should collect events in database", function(done) {
        emitter.on("collect", function() {
            store.find().count(function(err, count) {
                assert.equal(count, samples.length);
                done();
            });
        });
    });

    it("should compute performance metrics", function(done) {
        emitter.on("collect", function() {
            store.collection.mapReduce(function() {
                emit(this.seqno, this.energy);
            }, function(key, values) {
                var result = 0;
                for (var i = 0; i < values.length; i++) {
                    result += values[i];
                }
                return result / values.length;
            }, {
                out: { inline: 1 },
            }, function(err, result) {
                assert.deepEqual(_.pluck(result, "value"), [80, 70, 60]);
                done();
            });
        });
    });
});
