/*
    Photoframe-2 -- A system to connect non-connected digital photo frames.

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
* Entry point
*/
var util = require('util');
var adv = require('./advert.js');
var images = require('./image_db.js');
var viewctl = require('./viewctl.js');
var server = require('./server.js');
var settings = require('./settings.js');
var err_handler = require('./err_handler.js');

function load_settings() {
    settings.load(process.argv[2]);
    settings.on("error", err_handler.fatal_error);
    settings.on("loaded", function() {
        util.log("Loaded settings.");        
        init_images()
    });
}

function init_images() {
    images.init();
    images.on("error", err_handler.fatal_error);
    images.on("ready", function() {
        util.log("Image database ready.");
        start_server();
    });
}

function start_server() {
    server.start();
    server.on("error", err_handler.fatal_error);
    server.on("started", function() {
        util.log("Started server.");
        adv.start();
    });
    server.on("stopped", function() {
        util.log("Stopped server.");
        adv.stop();
    });
}

process.on("exit", function(code) {
    util.log('Exiting with code ', code);
    server.stop();
});

//Go!
load_settings();

