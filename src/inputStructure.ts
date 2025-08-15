import { FamilyFont, PenStyle } from "./enums";

type ImageObject = {
	width: number;
	height: number;
	pixelsPerInch: number;
	objects: Object[];
	entities: Entity[];
}

type Object = {
	type: string;
} & (
	{
		type: 'pen';
		penStyle: PenStyle;
		color: number;
		width: number;
	} | {
		type: 'brush';
		color: number|null;
	} | {
		type: 'font';
		name: string;
		fontFamily: FamilyFont;
		height: number;
		weight: number;
		italic: boolean;
		underline: boolean;
		strikeout: boolean;
	}
)


type Entity = {
	type: string;
	pen: number;
	brush: number;
} & (
	{
		type: 'rectangle';
		x: number;
		y: number;
		width: number;
		height: number;
	} | {
		type: 'line';
		x1: number;
		y1: number;
		x2: number;
		y2: number;
	} | {
		type: 'circle';
		x: number;
		y: number;
		radius: number;
	} | {
		type: 'ellipse';
		x: number;
		y: number;
		width: number;
		height: number;
	}
)

export type { ImageObject, Entity };