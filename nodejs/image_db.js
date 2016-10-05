/*
    Photoframe-2 -- Image database

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
 * Image database and cache management.
 * Allows access to available images.
 * Database contains -
 * -- TABLES -- 
 *images: 
 *    path - URL or local 
 *    cachable - indicated if caching is necessary 
 *    expires -  indicates when the image should be removed from the db
 *    source - id in clients
 * cache:
 *    image_id - foreign key into images
 *    size - cached size
 *    access_time - Last used time
 * previous:
 *    image_id - foreign key into images
 *    access_time - access_time
 * clients:
 *    id - UUID   
 *-- VIEWS --
 * next_image: (not in previous, in cache if needed)
 *    (* from images)
 */
var sqlite3 = require('sqlite3');
var events = require('events');
var url = require('url');
var fs = require('fs');
var settings = require('./settings');
var path = require('path');
var request = require('request');
var AsyncLock = require('async-lock');

function cached_image(cache_row, write) {
    return fs.createReadStream(path.join(settings.values.cache_path, cache_row.rowid));
}

function ImageDB() {    
    events.EventEmitter.call(this);
    var images = this;
    this.db = null;
    this.lock = new AsyncLock();
    /**
     * Connect to database and initialize.
     */
    this.init = function() {
        new sqlite3.Database('images.db', function(err) {
            if(err) {
                images.emit("error", err);
            } else {
                images.emit("ready");
            }
        });
    };

    /**
     * Get a random image from the database. The image is either in the cache,
     * or it is readily available at a remote URL. An "image" event with the 
     * image data in a stream object is triggered when an image is available.
     */
    this.get_image = function() {
        var done_with_cache = function() {
            console.warn("No cache lock");
        };

        function image_used(image_id) {
            images.db.run("INSERT INTO previous VALUES(?,strftime('%s','now'))",
                        image_id);
                //deletes managed by trigger
        }

        function cache_used(cache_id) {
            images.db.run("UPDATE TABLE cache SET access_time=strftime('%s','now')" +
                       " WHERE rowid=?", cache_id);                        
            done_with_cache();            
        }

        function post_result(strm, cache_id) {
            if(cache_id != null) {
                strm.on("close", function() {
                    cache_used(cache_id);
                });
            }
            images.emit("image", strm);
        }
                             
        function on_path_found(err, row) {
            if(err) {
                images.emit("error", err);
            } else if(null == row) {
                console.warn("No suitable image found.");
            } else {
                if (row.cached) {
                    //get cached image
                    images.db.get("SELECT rowid FROM cache WHERE image_id == ?",
                                row.rowid, function(err, cache_row) {                  
                        if(err) {
                            console.trace("Failed to get image.");
                            images.emit("error", err);
                        } else {
                            post_result(cached_image(cache_row), cache_row);
                            image_used(row.rowid);
                        }
                    });                
                } else {
                    done_with_cache();
                    //open URL
                    post_result(request(row.path));
                    image_used(row.rowid);
                }
            }
        }

        if(!images.db) {
            images.emit("error", new Error("Not initialized."));
        } else {
            images.lock.acquire('cache', function(done) {
                done_with_cache = done;
                images.db.serialize(function() {                
                    //Remove expired images
                    images.db.run("DELETE FROM images" + 
                                " WHERE expires > strftime('%s','now')");
                    //Get a random image from the possible next image candidates.
                    images.db.get("SELECT rowid,path,cached FROM next_image LIMIT 1" + 
                                " OFFSET abs(random())%"+
                                   "(SELECT count(rowid) FROM next_image);",
                                    null, on_path_found);
                });
            });
        }
    };

    /**
    * Check cache size and remove cached items as necessary
    */
    this.enforce_cache_size = function() {
        images.lock.acquire('cache', function(done) {
            images.db.get("SELECT sum(size) FROM cache", function(err, row) {
                if(err) {
                    done(err);
                }
            
    };

    /**
    * Add an image to the cache
    */
    this.cache_image = function(img_path, strm) {
        function write_cache_file(id, image_id, done) {
            var output_path = path.join(settings.values.cache_path, id);
            var output_file = fs.createWriteStream(output_path);
            
            function write_err(err) {
                images.db.run("DELETE FROM cache WHERE rowid=?", id);
                done(err);
            }

            output_file.on("error", write_err);
            strm.on("error", write_err);
            output_file.on('end', function() {
                images.db.run("UPDATE TABLE cache SET size=? WHERE rowid=?",
                    output_stream.bytesWritten, id);
                done();
            });
            strm.pipe(output_file);
        }

        function create_cache_row(image_id) {
            images.lock.acquire('cache', function(done) {
                images.db.run("INSERT INTO cache VALUES(?,null,0)", image_id, 
                              function(err) {
                    if(err) {
                        done(err);
                    } else {
                        write_cache_file();
                    }
                });
            }, function(err, ret) {
                if(err) {
                    images.emit("error",err);
                }
            });
        }
                  
        if(!images.db) {
            images.emit("error", new Error("Not initialized."));
        } else {
            //check if path is present.
            images.db.get("SELECT rowid FROM images WHERE rowid=?",
                         img_path, function(err, row) {
                if(err) {
                    console.trace("failed to check image id.");
                    images.raise("error", err);
                } else {
                    //create cache row and save file
                    create_cache_row(row.rowid);
                }
            });
        }
    };

    /**
    */
    this.add_image = function(im_url, 
}

ImageDB.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = new ImageDB();





