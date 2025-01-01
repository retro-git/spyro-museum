// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

import KaitaiStream from "kaitai-struct";

var SpyroLevel = (function() {
  function SpyroLevel(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  SpyroLevel.prototype._read = function() {
    this.meshOffset = this._io.readU4le();
    this.textureCount = this._io.readU4le();
  }

  var XyzEntry = SpyroLevel.XyzEntry = (function() {
    function XyzEntry(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    XyzEntry.prototype._read = function() {
      this.raw = this._io.readU4le();
    }
    Object.defineProperty(XyzEntry.prototype, 'x', {
      get: function() {
        if (this._m_x !== undefined)
          return this._m_x;
        this._m_x = ((((this.raw >>> 21) & 2047) + this._parent.globalX) / 4096.0);
        return this._m_x;
      }
    });
    Object.defineProperty(XyzEntry.prototype, 'y', {
      get: function() {
        if (this._m_y !== undefined)
          return this._m_y;
        this._m_y = ((((this.raw >>> 10) & 2047) + this._parent.globalY) / 4096.0);
        return this._m_y;
      }
    });
    Object.defineProperty(XyzEntry.prototype, 'z', {
      get: function() {
        if (this._m_z !== undefined)
          return this._m_z;
        this._m_z = (((this.raw & 1023) + this._parent.globalZ) / 4096.0);
        return this._m_z;
      }
    });

    return XyzEntry;
  })();

  var LowVert = SpyroLevel.LowVert = (function() {
    function LowVert(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    LowVert.prototype._read = function() {
      this.raw = this._io.readU4le();
    }
    Object.defineProperty(LowVert.prototype, 'v0', {
      get: function() {
        if (this._m_v0 !== undefined)
          return this._m_v0;
        this._m_v0 = ((this.raw >>> 8) & 63);
        return this._m_v0;
      }
    });
    Object.defineProperty(LowVert.prototype, 'v1', {
      get: function() {
        if (this._m_v1 !== undefined)
          return this._m_v1;
        this._m_v1 = ((this.raw >>> 14) & 63);
        return this._m_v1;
      }
    });
    Object.defineProperty(LowVert.prototype, 'v2', {
      get: function() {
        if (this._m_v2 !== undefined)
          return this._m_v2;
        this._m_v2 = ((this.raw >>> 20) & 63);
        return this._m_v2;
      }
    });
    Object.defineProperty(LowVert.prototype, 'v3', {
      get: function() {
        if (this._m_v3 !== undefined)
          return this._m_v3;
        this._m_v3 = ((this.raw >>> 26) & 63);
        return this._m_v3;
      }
    });

    return LowVert;
  })();

  var ColorRgba = SpyroLevel.ColorRgba = (function() {
    function ColorRgba(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    ColorRgba.prototype._read = function() {
      this.r = this._io.readU1();
      this.g = this._io.readU1();
      this.b = this._io.readU1();
      this.a = this._io.readU1();
    }

    return ColorRgba;
  })();

  var HighPoly = SpyroLevel.HighPoly = (function() {
    function HighPoly(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    HighPoly.prototype._read = function() {
      this.vert = new HighVert(this._io, this, this._root);
      this.color = new HighColor(this._io, this, this._root);
      this.textureIndex = this._io.readU1();
      this.textureRotateDepth = this._io.readU1();
      this.depth1 = this._io.readU1();
      this.depth2 = this._io.readU1();
      this.sideFlags = this._io.readU1();
      this.depth3 = this._io.readU1();
      this.depth4 = this._io.readU1();
      this.depth5 = this._io.readU1();
    }

    /**
     * 2-bit texture rotation value
     */
    Object.defineProperty(HighPoly.prototype, 'textureRotate', {
      get: function() {
        if (this._m_textureRotate !== undefined)
          return this._m_textureRotate;
        this._m_textureRotate = (this.textureRotateDepth & 3);
        return this._m_textureRotate;
      }
    });

    /**
     * Flag indicating if polygon should be rendered on both sides
     */
    Object.defineProperty(HighPoly.prototype, 'bothSides', {
      get: function() {
        if (this._m_bothSides !== undefined)
          return this._m_bothSides;
        this._m_bothSides = ((this.sideFlags >>> 2) & 1);
        return this._m_bothSides;
      }
    });

    /**
     * Flag indicating if polygon should be rendered with inverse winding
     */
    Object.defineProperty(HighPoly.prototype, 'inverseSide', {
      get: function() {
        if (this._m_inverseSide !== undefined)
          return this._m_inverseSide;
        this._m_inverseSide = ((this.sideFlags >>> 1) & 1);
        return this._m_inverseSide;
      }
    });

    /**
     * 7-bit texture index
     */

    /**
     * texture rotation and depth information (dddd-ddrr)
     */

    /**
     * flags for inverse/both sides (dddd-dbid)
     */

    return HighPoly;
  })();

  var PartBody = SpyroLevel.PartBody = (function() {
    function PartBody(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PartBody.prototype._read = function() {
      this.globalY = this._io.readS2le();
      this.globalX = this._io.readS2le();
      this.pad = this._io.readS2le();
      this.globalZ = this._io.readS2le();
      this.lowvertCount = this._io.readU1();
      this.lowcolorCount = this._io.readU1();
      this.lowpolyCount = this._io.readU1();
      this.pad2 = this._io.readU1();
      this.highvertCount = this._io.readU1();
      this.highcolorCount = this._io.readU1();
      this.highpolyCount = this._io.readU1();
      this.pad3 = this._io.readU1();
      this.skipFf = this._io.readU4le();
      this.lowvertices = [];
      for (var i = 0; i < this.lowvertCount; i++) {
        this.lowvertices.push(new XyzEntry(this._io, this, this._root));
      }
      this.lowvertColors = [];
      for (var i = 0; i < this.lowcolorCount; i++) {
        this.lowvertColors.push(new ColorRgba(this._io, this, this._root));
      }
      this.lowpolys = [];
      for (var i = 0; i < this.lowpolyCount; i++) {
        this.lowpolys.push(new LowPoly(this._io, this, this._root));
      }
      this.highvertices = [];
      for (var i = 0; i < this.highvertCount; i++) {
        this.highvertices.push(new XyzEntry(this._io, this, this._root));
      }
      this.highvertColors = [];
      for (var i = 0; i < this.highcolorCount; i++) {
        this.highvertColors.push(new ColorRgba(this._io, this, this._root));
      }
      this.highfarColors = [];
      for (var i = 0; i < this.highcolorCount; i++) {
        this.highfarColors.push(new ColorRgba(this._io, this, this._root));
      }
      this.highpolys = [];
      for (var i = 0; i < this.highpolyCount; i++) {
        this.highpolys.push(new HighPoly(this._io, this, this._root));
      }
    }

    return PartBody;
  })();

  var LowColor = SpyroLevel.LowColor = (function() {
    function LowColor(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    LowColor.prototype._read = function() {
      this.raw = this._io.readU4le();
    }
    Object.defineProperty(LowColor.prototype, 'c0', {
      get: function() {
        if (this._m_c0 !== undefined)
          return this._m_c0;
        this._m_c0 = ((this.raw >>> 8) & 63);
        return this._m_c0;
      }
    });
    Object.defineProperty(LowColor.prototype, 'c1', {
      get: function() {
        if (this._m_c1 !== undefined)
          return this._m_c1;
        this._m_c1 = ((this.raw >>> 14) & 63);
        return this._m_c1;
      }
    });
    Object.defineProperty(LowColor.prototype, 'c2', {
      get: function() {
        if (this._m_c2 !== undefined)
          return this._m_c2;
        this._m_c2 = ((this.raw >>> 20) & 63);
        return this._m_c2;
      }
    });
    Object.defineProperty(LowColor.prototype, 'c3', {
      get: function() {
        if (this._m_c3 !== undefined)
          return this._m_c3;
        this._m_c3 = ((this.raw >>> 26) & 63);
        return this._m_c3;
      }
    });

    return LowColor;
  })();

  var HighColor = SpyroLevel.HighColor = (function() {
    function HighColor(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    HighColor.prototype._read = function() {
      this.raw = this._io.readU4le();
    }
    Object.defineProperty(HighColor.prototype, 'c0', {
      get: function() {
        if (this._m_c0 !== undefined)
          return this._m_c0;
        this._m_c0 = (this.raw & 255);
        return this._m_c0;
      }
    });
    Object.defineProperty(HighColor.prototype, 'c1', {
      get: function() {
        if (this._m_c1 !== undefined)
          return this._m_c1;
        this._m_c1 = ((this.raw >>> 8) & 255);
        return this._m_c1;
      }
    });
    Object.defineProperty(HighColor.prototype, 'c2', {
      get: function() {
        if (this._m_c2 !== undefined)
          return this._m_c2;
        this._m_c2 = ((this.raw >>> 16) & 255);
        return this._m_c2;
      }
    });
    Object.defineProperty(HighColor.prototype, 'c3', {
      get: function() {
        if (this._m_c3 !== undefined)
          return this._m_c3;
        this._m_c3 = ((this.raw >>> 24) & 255);
        return this._m_c3;
      }
    });

    return HighColor;
  })();

  var HighVert = SpyroLevel.HighVert = (function() {
    function HighVert(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    HighVert.prototype._read = function() {
      this.raw = this._io.readU4le();
    }
    Object.defineProperty(HighVert.prototype, 'v0', {
      get: function() {
        if (this._m_v0 !== undefined)
          return this._m_v0;
        this._m_v0 = (this.raw & 255);
        return this._m_v0;
      }
    });
    Object.defineProperty(HighVert.prototype, 'v1', {
      get: function() {
        if (this._m_v1 !== undefined)
          return this._m_v1;
        this._m_v1 = ((this.raw >>> 8) & 255);
        return this._m_v1;
      }
    });
    Object.defineProperty(HighVert.prototype, 'v2', {
      get: function() {
        if (this._m_v2 !== undefined)
          return this._m_v2;
        this._m_v2 = ((this.raw >>> 16) & 255);
        return this._m_v2;
      }
    });
    Object.defineProperty(HighVert.prototype, 'v3', {
      get: function() {
        if (this._m_v3 !== undefined)
          return this._m_v3;
        this._m_v3 = ((this.raw >>> 24) & 255);
        return this._m_v3;
      }
    });

    return HighVert;
  })();

  var PartHeader = SpyroLevel.PartHeader = (function() {
    function PartHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PartHeader.prototype._read = function() {
      this.partOffset = this._io.readU4le();
    }
    Object.defineProperty(PartHeader.prototype, 'body', {
      get: function() {
        if (this._m_body !== undefined)
          return this._m_body;
        var _pos = this._io.pos;
        this._io.seek((((this._root.meshOffset + 4) + this.partOffset) + 8));
        this._m_body = new PartBody(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_body;
      }
    });

    return PartHeader;
  })();

  var LowPoly = SpyroLevel.LowPoly = (function() {
    function LowPoly(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    LowPoly.prototype._read = function() {
      this.vert = new LowVert(this._io, this, this._root);
      this.color = new LowColor(this._io, this, this._root);
    }

    return LowPoly;
  })();
  Object.defineProperty(SpyroLevel.prototype, 'partCount', {
    get: function() {
      if (this._m_partCount !== undefined)
        return this._m_partCount;
      var _pos = this._io.pos;
      this._io.seek((this.meshOffset + 4));
      this._m_partCount = this._io.readU4le();
      this._io.seek(_pos);
      return this._m_partCount;
    }
  });
  Object.defineProperty(SpyroLevel.prototype, 'partHeaders', {
    get: function() {
      if (this._m_partHeaders !== undefined)
        return this._m_partHeaders;
      var _pos = this._io.pos;
      this._io.seek((this.meshOffset + 8));
      this._m_partHeaders = [];
      for (var i = 0; i < this.partCount; i++) {
        this._m_partHeaders.push(new PartHeader(this._io, this, this._root));
      }
      this._io.seek(_pos);
      return this._m_partHeaders;
    }
  });

  return SpyroLevel;
})();
export default SpyroLevel;
