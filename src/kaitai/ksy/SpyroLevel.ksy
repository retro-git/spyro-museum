meta:
  id: spyro_level
  # Adjust file/class name to your preference
  file-extension: bin
  endian: le

seq:
  # First 4 bytes = mesh_offset
  - id: mesh_offset
    type: u4
  - id: texture_count
    type: u4

instances:
  # Read part_count at (mesh_offset + 4)
  part_count:
    pos: mesh_offset + 4
    type: u4

  # Read `part_headers` array starting at (mesh_offset + 8)
  part_headers:
    pos: mesh_offset + 8
    type: part_header
    repeat: expr
    repeat-expr: part_count

types:

  part_header:
    seq:
      # Each part header has a part_offset (relative to mesh_offset + 4),
      # which we later use to locate the actual "body" data.
      - id: part_offset
        type: u4

    instances:
      # part_body starts at (mesh_offset + 4 + part_offset + 8)
      body:
        pos: _root.mesh_offset + 4 + part_offset + 8
        type: part_body

  part_body:
    seq:
      # 4 signed shorts: global_y, global_x, pad, global_z
      - id: global_y
        type: s2
      - id: global_x
        type: s2
      - id: pad
        type: s2
      - id: global_z
        type: s2

      # Low-poly model specs: 4 bytes => lowvertCount, lowcolorCount, lowpolyCount, pad
      - id: lowvert_count
        type: u1
      - id: lowcolor_count
        type: u1
      - id: lowpoly_count
        type: u1
      - id: pad2
        type: u1

      # High-poly model specs: 4 bytes => highvertCount, highcolorCount, highpolyCount, pad
      - id: highvert_count
        type: u1
      - id: highcolor_count
        type: u1
      - id: highpoly_count
        type: u1
      - id: pad3
        type: u1

      # Skip FF FF FF FF (4 bytes)
      - id: skip_ff
        type: u4

      # Now read arrays for low poly
      # lowvertices (lowvert_count times read_xyz)
      - id: lowvertices
        type: xyz_entry
        repeat: expr
        repeat-expr: lowvert_count

      # lowvertColors (lowcolor_count times color_rgba)
      - id: lowvert_colors
        type: color_rgba
        repeat: expr
        repeat-expr: lowcolor_count

      # lowpolys (lowpoly_count times low_poly)
      - id: lowpolys
        type: low_poly
        repeat: expr
        repeat-expr: lowpoly_count

      # Now read arrays for high poly
      - id: highvertices
        type: xyz_entry
        repeat: expr
        repeat-expr: highvert_count

      # highvertColors (highcolor_count times color_rgba)
      - id: highvert_colors
        type: color_rgba
        repeat: expr
        repeat-expr: highcolor_count

      # highfarColors (another highcolor_count times color_rgba)
      - id: highfar_colors
        type: color_rgba
        repeat: expr
        repeat-expr: highcolor_count

      # highpolys (highpoly_count times high_poly)
      - id: highpolys
        type: high_poly
        repeat: expr
        repeat-expr: highpoly_count

    # You can create helper values or calculations in instances if needed
    #instances:
      # Example: you might store a "lowpoly_begin_offset" or similar if you need it
      # in a separate part of the structure. This is just an example of how you
      # can create an instance offset, but not strictly necessary.
      # lowpoly_begin_offset:
      #   pos: <wherever you want>
      #   type: u4
      #   doc: "Example instance placeholder"

  #--------------------------------------------------------------------------------
  # SUBTYPES
  #--------------------------------------------------------------------------------

  # Each read_xyz reads 4 bytes (u4) -> extracts x, y, z via bit fields
  xyz_entry:
    seq:
      - id: raw
        type: u4
    instances:
      x:
        value: (( (raw >> 21) & 0x7ff ) + _parent.global_x) / 4096.0
      y:
        value: (( (raw >> 10) & 0x7ff ) + _parent.global_y) / 4096.0
      z:
        value: ((  raw        & 0x3ff ) + _parent.global_z) / 4096.0

  # Each read_rgb reads 4 bytes -> r, g, b, a
  color_rgba:
    seq:
      - id: r
        type: u1
      - id: g
        type: u1
      - id: b
        type: u1
      - id: a
        type: u1

  # read_lowpoly -> read_lowvert + read_lowcolor
  # so we define a struct that first reads 'low_vert' then 'low_color'
  low_poly:
    seq:
      - id: vert
        type: low_vert
      - id: color
        type: low_color

  low_vert:
    seq:
      - id: v0
        type: u1
      - id: v1
        type: u1
      - id: v2
        type: u1
      - id: v3
        type: u1

  low_color:
    seq:
      - id: c0
        type: u1
      - id: c1
        type: u1
      - id: c2
        type: u1
      - id: c3
        type: u1

  # read_highpoly -> read_highvert + read_highcolor + skip 8
  high_poly:
    seq:
      - id: vert
        type: high_vert
      - id: color
        type: high_color
      - id: texture_index
        type: u1
        doc: 7-bit texture index
      - id: texture_rotate_depth
        type: u1
        doc: texture rotation and depth information (dddd-ddrr)
      - id: depth1
        type: u1
      - id: depth2
        type: u1
      - id: side_flags
        type: u1
        doc: flags for inverse/both sides (dddd-dbid)
      - id: depth3
        type: u1
      - id: depth4
        type: u1
      - id: depth5
        type: u1
    
    instances:
      # Extract rotation bits from texture_rotate_depth
      texture_rotate:
        value: texture_rotate_depth & 0x3
        doc: 2-bit texture rotation value
      
      # Extract the meaningful bits from side_flags
      both_sides:
        value: (side_flags >> 2) & 1
        doc: Flag indicating if polygon should be rendered on both sides
      inverse_side:
        value: (side_flags >> 1) & 1
        doc: Flag indicating if polygon should be rendered with inverse winding

  high_vert:
    seq:
      - id: v0
        type: u1
      - id: v1
        type: u1
      - id: v2
        type: u1
      - id: v3
        type: u1

  high_color:
    seq:
      - id: c0
        type: u1
      - id: c1
        type: u1
      - id: c2
        type: u1
      - id: c3
        type: u1
