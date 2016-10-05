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
* An opencv powered image scaler and rotator. The image is rotated as indicated
* by EXIF data, then it is scaled to fit in the specified rectangle.\
* 
* @author Shounak Mitra <indroth@gmail.com>
*/
#include <stdio.h>
#include <vector>
#include <opencv2/opencv.hpp>
#include <iostream>
#include <iomanip>
#include <exiv2/exiv2.hpp>

using namespace cv;
using namespace std;

enum Rotation {
    ROTATE_INVALID,
    ROTATE_NONE = 1,
    ROTATE_FLIP = 3,
    ROTATE_CW = 6,
    ROTATE_CCW = 8
};

/**
* Get EXIF rotation value from image.
* @param filename The filename of the image.
*/
static Rotation get_rotate(const char filename[]) {
    try {
        Exiv2::Image::AutoPtr image = Exiv2::ImageFactory::open(filename);
        if(image.get() == 0) {
            cerr << "failed" << endl;
            return ROTATE_INVALID;
        }
        image->readMetadata();

        Exiv2::ExifData &exifData = image->exifData();
        Exiv2::ExifData::iterator itr = exifData.findKey(Exiv2::ExifKey("Exif.Image.Orientation"));
        if(itr != exifData.end()) {
            return (Rotation)itr->toLong();
        } else {
            itr = exifData.findKey(Exiv2::ExifKey("Exif.Thumbnail.Orientation"));
            if(itr != exifData.end()) {
                return (Rotation)itr->toLong();
            }
            else {
                return ROTATE_NONE;
            }
        }
    } catch(Exiv2::Error &e) {
        cerr << "err" << e.what() << endl;
        return ROTATE_INVALID;
    }
}

/**
* main function.
* args: filename width height
*/
int main(int argc, const char * const argv[])
{
    if(argc < 4) {
        return -1;
    }

    unsigned int w,h;

    w = strtoul(argv[2],NULL,0);
    h = strtoul(argv[3],NULL,0);

    Mat img = imread(argv[1]);
    float scale = min((float)w / img.size[1], (float)h / img.size[0]);
    Mat out;
    resize(img, out, Size(), scale, scale, INTER_AREA);

    switch(get_rotate(argv[1])) {
        case ROTATE_NONE:
            //do nothing
            break;
        case ROTATE_CW:
            flip(out, out, 0);
            transpose(out, out);
            break;
        case ROTATE_CCW:
            flip(out, out, 1);
            transpose(out, out);
            break;
        case ROTATE_FLIP:
            flip(out, out, -1);
            break;
        default:
            cerr << argv[1] << ":Exif error. Not rotating." << endl;
            break;
    }

    vector<int> params;
    params.push_back(IMWRITE_JPEG_QUALITY);
    params.push_back(90);
    vector<uchar> buf;
    imencode(".jpg", out, buf, params);

    cout.write((char*)&buf.front(), buf.size());

    return 0;
}
