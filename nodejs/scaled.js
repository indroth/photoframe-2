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
