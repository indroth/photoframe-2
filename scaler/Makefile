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
