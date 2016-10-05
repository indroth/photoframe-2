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
* Automatic image scaling and rotation.
*/
var child_process = require('child_process');

exports.getScaled = function(f, size, callback) {
    var proc = child_process.spawn('./scaler/scaler', [f, size[0], size[1]],{stdio:['ignore','pipe',process.stderr]});
    var buffers = [];
    var totalLength = 0;
    proc.stdout.on('readable', function() {
        var b = proc.stdout.read();
        while(b) {
            totalLength += b.length;
            buffers.push(b);
            b = proc.stdout.read();
        }
    });
    function finish() {
        callback(null, Buffer.concat(buffers, totalLength));
    }
    proc.stdout.on('end', finish);
    proc.on("error", function(err) {
        callback(err);
        proc.stdout.removeListener('end', finish);
    });
}
