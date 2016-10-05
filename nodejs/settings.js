/*
    Photoframe-2

    Copyright (C) 2016  Shounak Mitra

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
* Settings persistence and retieval.
*/
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

