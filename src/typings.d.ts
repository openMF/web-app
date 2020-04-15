/*
 * Extra typings definitions
 */

// Allow .json files imports
declare module '*.json';

// SystemJS module definition
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module '@ckeditor/ckeditor5-build-classic' { // or other CKEditor 5 build.
	const ClassicEditorBuild: any;

	export = ClassicEditorBuild;
}