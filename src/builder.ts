import { RecordType, PenStyle, FamilyFont } from "./enums.js";

type word = number;
/** This is not actually a number array but a single number wrapped in square brackets.
 * E.g. [0x00000001] is a dword with value 0x00000001.
 */
type dword = number[];
/** This is an array of multiple words.
 * E.g. [0x0001, 0x0002, 0x0003] is a multiWordBlock with three words.
 */
type multiWordBlock = number[];

export default class Builder {
	private words: word[] = [];
	private maxRecordSize: number = 0;
	private numberOfObjects: number = 0;
	private dimensions: { width: number; height: number };
	private selectedPen: number|null = null;
	private selectedBrush: number|null = null;
	private selectedFont: number|null = null;

	public constructor(width?: number, height?: number, private pixelsPerInch: number = 1200) {
		this.dimensions = { width: width || 14030, height: height || 9920 };
		this.writeHeader();
		this.setup();
	}

	private writeHeader(): void {
		// Optional placeable header
		this.writeDWord(0x9AC6CDD7);
		this.writeWord(0); // unused handle should be 0
		this.writeWord(0); this.writeWord(0); // left, top
		this.writeWord(this.dimensions.width); this.writeWord(this.dimensions.height); // right, bottom
		this.writeWord(this.pixelsPerInch); // pixels per inch
		this.writeDWord(0); // reserved should be 0
		this.writeWord(this.words.reduce((pre, curr) => pre^curr, 0)); // placeholder checksum

		// Core WMF header (backfill later)
		this.writeWord(0x0001); // FileType (1 = WMF)
		this.writeWord(0x0009); // HeaderSize (9 words)
		this.writeWord(0x0300); // Version
		this.writeDWord(0); // FileSize placeholder
		this.writeWord(0);  // number of objects placeholder
		this.writeDWord(0); // MaxRecordSize placeholder
		this.writeWord(0); // No number of parameters
	}

	private setup(): void {
		// Coordinate system setup
		this.writeRecord(RecordType.SETWINDOWEXT, this.dimensions.height, this.dimensions.width);
		this.writeRecord(RecordType.SETWINDOWORG, 0, 0);
		this.writeRecord(RecordType.SETMAPMODE, 8); // MM_ANISOTROPIC

		// Rendering behavior
		this.writeRecord(RecordType.SETBKMODE, 1, 0); // TRANSPARENT
		this.writeRecord(RecordType.SETPOLYFILLMODE, 2, 0); // WINDING
		this.writeRecord(RecordType.SETTEXTALIGN, 0b11000, 0); // TA_BASELINE | TA_NOUPDATECP
		this.writeRecord(RecordType.SETTEXTCOLOR, 0x000000, 0); // Black
		this.writeRecord(RecordType.SETROP2, 13, 0); // R2_COPYPEN
		this.writeRecord(RecordType.ESCAPE, 23, 4, 5, 0);
	}

	public writePen(penStyle: PenStyle, color: number, width: number): number {
		this.writeRecord(RecordType.CREATEPENINDIRECT, penStyle, width, 0, [this.createRGBObject(color)]); // penStyle, width, height=0(unused), color
		this.numberOfObjects++;
		return this.numberOfObjects - 1; // return index of the created pen
	}
	public writeBrush(color: number|null): number {
		this.writeRecord(RecordType.CREATEBRUSHINDIRECT, (color ? 0 : 1), [this.createRGBObject(color ?? 0xFFFFFF)], 0); // PS_SOLID|PS_NULL, color, hatch=none
		this.numberOfObjects++;
		return this.numberOfObjects - 1; // return index of the created brush
	}
	public writeFont(font: string, fontFamily: FamilyFont, height: number, weight: number, italic: boolean, underline: boolean, strikeout: boolean): number {
		const fontFlags = (italic ? 0x01 : 0) | (underline ? 0x0100 : 0) | (strikeout ? 0x010000 : 0);
		const withNull = font + (font.endsWith('\0') ? '' : '\0'); // Ensure the font name ends with a null character
		const fontNameInWords = [];
		for (let i = 0; i < withNull.length; i+=2) {
			const low = withNull.charCodeAt(i);
			const high = withNull.charCodeAt(i+1) ?? 0;
			fontNameInWords.push(low | (high << 8));
		}
		this.writeRecord(RecordType.CREATEFONTINDIRECT, height, 0, 0, 0, weight, [fontFlags], 0, fontFamily, fontNameInWords);
		// height, width=0, escapement=0, orientation=0, weight, flags, charset=0, pitchAndFamily={pitch:0, family}, name
		this.numberOfObjects++;
		return this.numberOfObjects - 1; // return index of the created font
	}

	private createRGBObject(color: {red: number, green: number, blue: number}|number): number {
		if (typeof color === "number")
			return this.createRGBObject({
				red: (color >> 16) & 0xFF,
				green: (color >> 8) & 0xFF,
				blue: color & 0xFF
			});
		return (
			color.red & 0xFF |
			(color.green & 0xFF) << 8 |
			(color.blue & 0xFF) << 16
		);
	}

	public selectPen(penIndex: number): void {
		if (this.selectedPen === penIndex) return; // No need to select the same pen again
		this.selectedPen = penIndex;
		this.writeRecord(RecordType.SELECTOBJECT, penIndex);
	}
	public selectBrush(brushIndex: number): void {
		if (this.selectedBrush === brushIndex) return; // No need to select the same brush again
		this.selectedBrush = brushIndex;
		this.writeRecord(RecordType.SELECTOBJECT, brushIndex);
	}
	public selectFont(fontIndex: number): void {
		if (this.selectedFont === fontIndex) return; // No need to select the same font again
		this.selectedFont = fontIndex;
		this.writeRecord(RecordType.SELECTOBJECT, fontIndex);
	}


	private writeRecord(type: RecordType, ...params: (word|dword|multiWordBlock)[]): void {
		const recordSize = params.reduce(
			(sum: number, param) => sum + (Array.isArray(param) ? param.length == 1 ? 2 : param.length : 1) // 2 for dword, 1 for word, multiWordBlock is counted as its length
		, 3); // 1 for type + 2 for RecordSize, rest for params
		this.maxRecordSize = Math.max(this.maxRecordSize, recordSize);
		this.writeDWord(recordSize);
		this.writeWord(type);

		for (const param of params) {
			if (Array.isArray(param)) {
				if (param.length == 1) {
					this.writeDWord(param[0]); // dword
				} else {
					param.forEach(word => this.writeWord(word)); // multiWordBlock
				}
			} else {
				this.writeWord(param);
			}
		}
	}

	public endFile(): void {
		this.writeRecord(RecordType.EOF);
		// this.writeEndOfFile();
		 // FileSize
		this.words[14] = this.words.length & 0xFFFF;
		this.words[15] = (this.words.length >> 16) & 0xFFFF;
		// NumberOfObjects
		this.words[16] = this.numberOfObjects;
		// MaxRecordSize
		this.words[17] = this.maxRecordSize & 0xFFFF;
		this.words[18] = (this.maxRecordSize >> 16) & 0xFFFF;
	}

	private writeWord(value: number): void {
		this.words.push(value & 0xFFFF);
	}
	private writeDWord(value: number): void {
		this.writeWord(value & 0xFFFF);
		this.writeWord((value >> 16) & 0xFFFF);
	}
	public toArrayBuffer(): ArrayBuffer {
		const buffer = new ArrayBuffer(this.words.length * 2);
		const view = new Uint16Array(buffer);
		for (let i = 0; i < this.words.length; i++) {
			view[i] = this.words[i];
		}
		return buffer;
	}


	public writeLine(x1: number, y1: number, x2: number, y2: number): void {
		this.writeRecord(RecordType.MOVETO, y1, x1);
		this.writeRecord(RecordType.LINETO, y2, x2);
	}
	public writeRectangle(x: number, y: number, width: number, height: number): void {
		this.writeRecord(RecordType.RECTANGLE, y + height, x + width, y, x);
	}
	public writeEllipse(x: number, y: number, width: number, height: number): void {
		this.writeRecord(RecordType.ELLIPSE, y + height, x + width, y, x);
	}
	public writeCircle(x: number, y: number, radius: number): void {
		this.writeEllipse(x - radius, y - radius, radius * 2, radius * 2);
	}


}