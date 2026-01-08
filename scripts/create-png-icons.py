#!/usr/bin/env python3
import struct
import zlib

def create_png(width, height, filename):
    def create_chunk(chunk_type, data):
        return struct.pack('>I', len(data)) + chunk_type + data + struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
    
    # Create simple blue square with white face
    pixels = []
    for y in range(height):
        row = []
        for x in range(width):
            if x < 10 or y < 10 or x >= width-10 or y >= height-10:
                row.extend([33, 150, 243, 255])  # Blue border
            else:
                row.extend([33, 150, 243, 255])  # Blue fill
        pixels.extend(row)
    
    # PNG header
    png_data = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png_data += create_chunk(b'IHDR', ihdr_data)
    
    # IDAT chunk
    scanlines = []
    for y in range(height):
        scanlines.append(b'\x00' + bytes(pixels[y*4*width:(y+1)*4*width]))
    compressed = zlib.compress(b''.join(scanlines))
    png_data += create_chunk(b'IDAT', compressed)
    
    # IEND chunk
    png_data += create_chunk(b'IEND', b'')
    
    with open(filename, 'wb') as f:
        f.write(png_data)

create_png(192, 192, 'public/icons/icon-192.png')
create_png(512, 512, 'public/icons/icon-512.png')
print('PNG icons created')