var lwip = require('lwip');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

var ctl_w, ctl_r;
if(process.argv.indexOf('test') < 0) {
    ctl_w = '/dev/fakeactl';
    ctl_r = ctl_w;
} else {
    ctl_w = 'testout.jpg';
    ctl_r = 'test_r';
}

var fontpath = 'image'
var font={};

function load_char(c, end, callback) {
    lwip.open(fontpath + '/' + c + ".png", function(err, image) {
        if (err) {
           console.log("Failed to read " + c);
           if(callback) callback(err);
        } else {
            font[c] = image;
            var i = c.charCodeAt(0) + 1;
            if(i <= end.charCodeAt(0)) {
                load_char(String.fromCharCode(i), end, callback);
            } else if (callback) {
                callback();
            }
        }
    });
}

function text_size(string) {
    var size = [0,0];
    for(var i in string) {
        var l = font[string[i]];
        if(!l) {
            console.log("Char not found: '" + string[i] + "'");
        }
        size[0] += l.width();
        if(l.height() > size[1]) {
            size[1] = l.height();
        }
    }
    return size;
}


var control = new EventEmitter();
var r = null;
function readable() {
    if(!r) return;
    var buf = r.read(4);
    if(buf) {
        var n = buf.readUInt32LE(0);
        control.emit("read", n);
        control.suspend();
    } else {
        setImmediate(readable);
    }
}


control.getOutputStream = function() {
    if(!control.ostr) {
        control.ostr = fs.createWriteStream(ctl_w);
        control.ostr.on("close", function() {
            control.ostr = null;
            setTimeout(control.resume, 500);
        });
    }
    return control.ostr;
}

control.generate_text_alert = function(string, size) {
    lwip.create(size[0], size[1], "white", function (err, image) {
        var ts = text_size(string);
        var batch = image.batch();
        var x = (size[0] - ts[0]) / 2;
        var y = (size[1] - ts[1]) / 2;
        for(var i in string) {
            var l = font[string[i]];
         if(!l) {
            console.log("Char not found: '" + string[i] + "'");
        }
            batch.paste(x, y, l);
            x += l.width();
        }
        control.suspend();
        batch.writeFile(ctl_w, 'jpg', {quality:50}, function(err) {
            if(err) control.emit("error", err);
        });
    });
}

control.resume = function() {
    if(!r) {
        r = fs.createReadStream(ctl_r);
        r.on('readable', readable);
        r.on("end", function() {
            console.log("end??");
            r = null;
        });
    }
}

control.suspend = function() {
    if(r) {
        r.close();
        r = null;
    }
}

control.start = function() {
    load_char('A','Z', function(err) {
        if(err) {
            control.emit("error", err);
        } else {
            control.emit('loaded');
            control.resume();
        }
    });
}


module.exports = control;
