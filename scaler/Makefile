#
#    Photoframe-2
#
#    Copyright (C) 2016  Shounak Mitra

#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.


##
# Makefile for EXIF based image scaling and rotation.
# @author Shounak Mitra <indroth@gmail.com>
#

SRC=scaler.cpp
PKGS=opencv exiv2

CFLAGS=-O4
LIBS=
CPP=g++
PKG_CONFIG=pkg-config

CFLAGS += $(shell $(PKG_CONFIG) --cflags $(PKGS))
LIBS += $(shell $(PKG_CONFIG) --libs $(PKGS))

TARGET=scaler

OBJS=$(SRC:.cpp=.o)

$(TARGET): $(OBJS)
	$(CPP) $< $(LIBS) -o $@

%.o: %.cpp
	$(CPP) $(CFLAGS) -c -o $@ $<

clean:
	-rm *.o
	-rm $(TARGET)

.PHONY: clean
