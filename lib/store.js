var mongoskin = require("mongoskin");

function Store(config) {
    var url = "mongodb://" + config.host + ":" + config.port + "/" + config.base;
    this.db = mongoskin.db(url, { native_parser: true });
    this.collection = this.db.bind(config.name, { w: 1 });
}

Store.prototype.save = function(args, done) {
    this.collection.insert(args, done);
};

Store.prototype.find = function(args) {
    return this.collection.find(args);
};

Store.prototype.drop = function(done) {
    this.collection.remove(done);
};

module.exports = function(config) {
    return new Store(config);
};
