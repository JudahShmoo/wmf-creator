import Builder from './builder.js';
import type { ImageObject } from './inputStructure.js';

export default function generateWMF(data: ImageObject): Blob {
	const builder = new Builder(data.width, data.height, data.pixelsPerInch);
	data.objects.forEach((object, index) => {
		switch (object.type) {
			case 'pen':
				builder.writePen(object.penStyle, object.color, object.width);
				break;
			case 'brush':
				builder.writeBrush(object.color);
				break;
			case 'font':
				builder.writeFont(object.name, object.fontFamily, object.height, object.weight, object.italic, object.underline, object.strikeout);
				break;
		}
	});
	data.entities.forEach(entity => {
		builder.selectPen(entity.pen);
		builder.selectBrush(entity.brush);
		switch (entity.type) {
			case 'line':
				builder.writeLine(entity.x1, entity.y1, entity.x2, entity.y2);
				break;
			case 'rectangle':
				builder.writeRectangle(entity.x, entity.y, entity.width, entity.height);
				break;
			case 'ellipse':
				builder.writeEllipse(entity.x, entity.y, entity.width, entity.height);
				break;
			case 'circle':
				builder.writeCircle(entity.x, entity.y, entity.radius);
				break;
		}
	});
	builder.endFile();
	return new Blob([builder.toArrayBuffer()], { type: 'application/x-wmf' });
}
