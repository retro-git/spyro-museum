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

  var Clut = SpyroLevel.Clut = (function() {
    function Clut(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

      this._read();
    }
    Clut.prototype._read = function() {
      this.x = this._io.readBitsIntLe(6);
      this.y = this._io.readBitsIntLe(10);
    }

    return Clut;
  })();

  var ColorRgba = SpyroLevel.ColorRgba = (function() {
    function ColorRgba(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

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

  var HighColor = SpyroLevel.HighColor = (function() {
    function HighColor(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

      this._read();
    }
    HighColor.prototype._read = function() {
      this.c0 = this._io.readU1();
      this.c1 = this._io.readU1();
      this.c2 = this._io.readU1();
      this.c3 = this._io.readU1();
    }

    return HighColor;
  })();

  var HighPoly = SpyroLevel.HighPoly = (function() {
    function HighPoly(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

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
     * Flag indicating if polygon should be rendered on both sides
     */
    Object.defineProperty(HighPoly.prototype, 'bothSides', {
      get: function() {
        if (this._m_bothSides !== undefined)
          return this._m_bothSides;
        this._m_bothSides = this.sideFlags >>> 2 & 1;
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
        this._m_inverseSide = this.sideFlags >>> 1 & 1;
        return this._m_inverseSide;
      }
    });

    /**
     * 2-bit texture rotation value
     */
    Object.defineProperty(HighPoly.prototype, 'textureRotate', {
      get: function() {
        if (this._m_textureRotate !== undefined)
          return this._m_textureRotate;
        this._m_textureRotate = this.textureRotateDepth & 3;
        return this._m_textureRotate;
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

  var HighVert = SpyroLevel.HighVert = (function() {
    function HighVert(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

      this._read();
    }
    HighVert.prototype._read = function() {
      this.v0 = this._io.readU1();
      this.v1 = this._io.readU1();
      this.v2 = this._io.readU1();
      this.v3 = this._io.readU1();
    }

    return HighVert;
  })();

  var LowColor = SpyroLevel.LowColor = (function() {
    function LowColor(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

      this._read();
    }
    LowColor.prototype._read = function() {
      this.c0 = this._io.readU1();
      this.c1 = this._io.readU1();
      this.c2 = this._io.readU1();
      this.c3 = this._io.readU1();
    }

    return LowColor;
  })();

  var LowPoly = SpyroLevel.LowPoly = (function() {
    function LowPoly(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

      this._read();
    }
    LowPoly.prototype._read = function() {
      this.vert = new LowVert(this._io, this, this._root);
      this.color = new LowColor(this._io, this, this._root);
    }

    return LowPoly;
  })();

  var LowVert = SpyroLevel.LowVert = (function() {
    function LowVert(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

      this._read();
    }
    LowVert.prototype._read = function() {
      this.v0 = this._io.readU1();
      this.v1 = this._io.readU1();
      this.v2 = this._io.readU1();
      this.v3 = this._io.readU1();
    }

    return LowVert;
  })();

  var PartBody = SpyroLevel.PartBody = (function() {
    function PartBody(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

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

  var PartHeader = SpyroLevel.PartHeader = (function() {
    function PartHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

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
        this._io.seek(((this._root.meshOffset + 4) + this.partOffset) + 8);
        this._m_body = new PartBody(this._io, this, this._root);
        this._io.seek(_pos);
        return this._m_body;
      }
    });

    return PartHeader;
  })();

  var S1Tiledef = SpyroLevel.S1Tiledef = (function() {
    function S1Tiledef(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

      this._read();
    }
    S1Tiledef.prototype._read = function() {
      this.u0 = this._io.readU1();
      this.v0 = this._io.readU1();
      this.clut = new Clut(this._io, this, this._root);
      this.u1 = this._io.readU1();
      this.v1 = this._io.readU1();
      this.tpage = new Tpage(this._io, this, this._root);
    }

    return S1Tiledef;
  })();

  var TextureData = SpyroLevel.TextureData = (function() {
    function TextureData(_io, _parent, _root, textureIndex) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;
      this.textureIndex = textureIndex;

      this._read();
    }
    TextureData.prototype._read = function() {
    }
    Object.defineProperty(TextureData.prototype, 'initialTiles', {
      get: function() {
        if (this._m_initialTiles !== undefined)
          return this._m_initialTiles;
        var _pos = this._io.pos;
        this._io.seek(8 + this.textureIndex * 16);
        this._m_initialTiles = [];
        for (var i = 0; i < 2; i++) {
          this._m_initialTiles.push(new S1Tiledef(this._io, this, this._root));
        }
        this._io.seek(_pos);
        return this._m_initialTiles;
      }
    });
    Object.defineProperty(TextureData.prototype, 'remainingTiles', {
      get: function() {
        if (this._m_remainingTiles !== undefined)
          return this._m_remainingTiles;
        var _pos = this._io.pos;
        this._io.seek((8 + this._root.textureCount * 16) + this.textureIndex * 168);
        this._m_remainingTiles = [];
        for (var i = 0; i < 21; i++) {
          this._m_remainingTiles.push(new S1Tiledef(this._io, this, this._root));
        }
        this._io.seek(_pos);
        return this._m_remainingTiles;
      }
    });

    return TextureData;
  })();

  var Tpage = SpyroLevel.Tpage = (function() {
    function Tpage(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

      this._read();
    }
    Tpage.prototype._read = function() {
      this.x = this._io.readBitsIntLe(4);
      this.y = this._io.readBitsIntLe(1) != 0;
      this.abr = this._io.readBitsIntLe(2);
      this.tp = this._io.readBitsIntLe(2);
      this.pad = this._io.readBitsIntLe(7);
    }

    return Tpage;
  })();

  var XyzEntry = SpyroLevel.XyzEntry = (function() {
    function XyzEntry(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root;

      this._read();
    }
    XyzEntry.prototype._read = function() {
      this.raw = this._io.readU4le();
    }
    Object.defineProperty(XyzEntry.prototype, 'x', {
      get: function() {
        if (this._m_x !== undefined)
          return this._m_x;
        this._m_x = ((this.raw >>> 21 & 2047) + this._parent.globalX) / 4096.0;
        return this._m_x;
      }
    });
    Object.defineProperty(XyzEntry.prototype, 'y', {
      get: function() {
        if (this._m_y !== undefined)
          return this._m_y;
        this._m_y = ((this.raw >>> 10 & 2047) + this._parent.globalY) / 4096.0;
        return this._m_y;
      }
    });
    Object.defineProperty(XyzEntry.prototype, 'z', {
      get: function() {
        if (this._m_z !== undefined)
          return this._m_z;
        this._m_z = ((this.raw & 1023) + this._parent.globalZ) / 4096.0;
        return this._m_z;
      }
    });

    return XyzEntry;
  })();
  Object.defineProperty(SpyroLevel.prototype, 'partCount', {
    get: function() {
      if (this._m_partCount !== undefined)
        return this._m_partCount;
      var _pos = this._io.pos;
      this._io.seek(this.meshOffset + 4);
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
      this._io.seek(this.meshOffset + 8);
      this._m_partHeaders = [];
      for (var i = 0; i < this.partCount; i++) {
        this._m_partHeaders.push(new PartHeader(this._io, this, this._root));
      }
      this._io.seek(_pos);
      return this._m_partHeaders;
    }
  });
  Object.defineProperty(SpyroLevel.prototype, 'textures', {
    get: function() {
      if (this._m_textures !== undefined)
        return this._m_textures;
      this._m_textures = [];
      for (var i = 0; i < this.textureCount; i++) {
        this._m_textures.push(new TextureData(this._io, this, this._root, i));
      }
      return this._m_textures;
    }
  });

  return SpyroLevel;
})();
export default SpyroLevel;
