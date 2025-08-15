// Main library entry point
export { default as generateWMF } from './generate.js';
export { default as Builder } from './builder.js';
export { PenStyle, RecordType, FamilyFont } from './enums.js';
export type { ImageObject, Entity } from './inputStructure.js';

// Re-export the main function as default export for convenience
export { default } from './generate.js';
