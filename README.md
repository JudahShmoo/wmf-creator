# WMF Creator

A TypeScript library for generating Windows Metafile (WMF) images programmatically. Create vector graphics with pens, brushes, and various shapes.

## Installation

```bash
npm install wmf-creator
```

## Usage

### Basic Example

```typescript
import { generateWMF, PenStyle } from 'wmf-creator';

const blob = generateWMF({
  width: 100,
  height: 75,
  pixelsPerInch: 5,
  objects: [
    {
      type: 'pen',
      penStyle: PenStyle.SOLID,
      color: 0x000000, // black
      width: 1
    },
    {
      type: 'brush',
      color: 0x00FF00 // green
    },
  ],
  entities: [
    {
      type: 'rectangle',
      x: 10,
      y: 10,
      width: 50,
      height: 30,
      pen: 0, // index of the pen object
      brush: 1 // index of the brush object
    }
  ]
});

// In browser - download the file
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'image.wmf';
a.click();
```

### Advanced Usage with Builder

```typescript
import { Builder, PenStyle, RecordType } from 'wmf-creator';

const builder = new Builder(200, 150, 600);

// Create objects
const penIndex = builder.writePen(PenStyle.SOLID, 0xFF0000, 2); // red pen
const brushIndex = builder.writeBrush(0x0000FF); // blue brush

// Select and draw
builder.selectPen(penIndex);
builder.selectBrush(brushIndex);
builder.writeCircle(50, 50, 30);

builder.endFile();
const arrayBuffer = builder.toArrayBuffer();
const blob = new Blob([arrayBuffer], { type: 'application/x-wmf' });
```

## API Reference

### Main Functions

#### `generateWMF(data: ImageObject): Blob`

Generates a WMF file from a structured image object.

### Classes

#### `Builder`

Low-level builder for creating WMF files step by step.

**Constructor:** `new Builder(width?: number, height?: number, pixelsPerInch?: number)`

**Methods:**
- `writePen(penStyle: PenStyle, color: number, width: number): number`
- `writeBrush(color: number | null): number`
- `writeFont(name: string, fontFamily: FamilyFont, height: number, weight: number, italic: boolean, underline: boolean, strikeout: boolean): number`
- `selectPen(penIndex: number): void`
- `selectBrush(brushIndex: number): void`
- `selectFont(fontIndex: number): void`
- `writeLine(x1: number, y1: number, x2: number, y2: number): void`
- `writeRectangle(x: number, y: number, width: number, height: number): void`
- `writeEllipse(x: number, y: number, width: number, height: number): void`
- `writeCircle(x: number, y: number, radius: number): void`
- `endFile(): void`
- `toArrayBuffer(): ArrayBuffer`

### Enums

#### `PenStyle`
- `SOLID`, `DASH`, `DOT`, `DASHDOT`, `DASHDOTDOT`, `NULL`, `INSIDEFRAME`

#### `FamilyFont`
- `DONTCARE`, `ROMAN`, `SWISS`, `MODERN`, `SCRIPT`, `DECORATIVE`

### Types

#### `ImageObject`
```typescript
type ImageObject = {
  width: number;
  height: number;
  pixelsPerInch: number;
  objects: Object[];
  entities: Entity[];
}
```

See the example file for detailed usage patterns.

## License

ISC
