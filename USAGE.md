# How to Use WMF Creator Library

## For Library Consumers

### Installation
```bash
npm install wmf-creator
```

### Browser Usage
```typescript
import { generateWMF, PenStyle } from 'wmf-creator';

const wmfBlob = generateWMF({
  width: 200,
  height: 150,
  pixelsPerInch: 96,
  objects: [
    { type: 'pen', penStyle: PenStyle.SOLID, color: 0x000000, width: 2 },
    { type: 'brush', color: 0xFF0000 }
  ],
  entities: [
    { type: 'rectangle', x: 10, y: 10, width: 100, height: 50, pen: 0, brush: 1 }
  ]
});

// Download the file
const url = URL.createObjectURL(wmfBlob);
const a = document.createElement('a');
a.href = url;
a.download = 'my-image.wmf';
a.click();
```

### Node.js Usage
```typescript
import { generateWMF, PenStyle } from 'wmf-creator';
import { writeFileSync } from 'fs';

const wmfBlob = generateWMF({
  // ... same structure as above
});

const arrayBuffer = await wmfBlob.arrayBuffer();
writeFileSync('output.wmf', Buffer.from(arrayBuffer));
```

## For Development

### Building the Library
```bash
npm run build       # Build once
npm run dev         # Build and watch for changes
```

### Testing
```bash
npm run example-node    # Test in Node.js
# Or open tester.html in browser for browser testing
```

### File Structure
- `src/lib.ts` - Main library entry point
- `src/generate.ts` - High-level API
- `src/builder.ts` - Low-level WMF builder
- `src/enums.ts` - WMF constants and enums
- `src/inputStructure.ts` - TypeScript types
- `src/example.ts` - Browser example
- `src/example-node.ts` - Node.js example
