// Node.js example - demonstrates how to use the WMF encoder library in Node.js
import { generateWMF, PenStyle } from "./lib.js";
import { writeFileSync } from 'fs';

const blob = generateWMF(
	{
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
				color: null // PS_NULL brush
			},
			{
				type: 'pen',
				penStyle: PenStyle.SOLID,
				color: 0xFF0000, // red
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
				x: 1,
				y: 4,
				width: 52,
				height: 30,
				pen: 0, // index of the pen object
				brush: 1 // index of the brush object
			},
			{
				type: 'line',
				x1: 10,
				y1: 10,
				x2: 90,
				y2: 60,
				pen: 0,
				brush: 1
			},
			{
				type: 'ellipse',
				x: 30,
				y: 30,
				width: 50,
				height: 10,
				pen: 0,
				brush: 3
			},
			{
				type: 'circle',
				x: 40,
				y: 40,
				radius: 20,
				pen: 2,
				brush: 1
			}
		]
	}
);

// Node.js usage - save to file
const arrayBuffer = await blob.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);
writeFileSync('output.wmf', buffer);
console.log('WMF file created successfully: output.wmf');
