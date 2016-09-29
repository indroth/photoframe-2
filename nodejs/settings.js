var fs = require('fs');
var events = require('events');

function Settings(filename) {
    this.values = null;
    events.EventEmitter.call(this);
    this.load = function(filename) {
        var data = "";
        var settings = this;
        var r = fs.createReadStream(filename);
        r.on("readable", function() {
            var chunk;
            while(null != (chunk = r.read())) {
                data += chunk;
            }
        });
        r.on("end", function() {
            settings.values = JSON.parse(data);
            settings.emit('loaded');
        });
        r.on("error", function(err) {
            settings.emit('error', err);
        });
    };
}

Settings.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = new Settings();

