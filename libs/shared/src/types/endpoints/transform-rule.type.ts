export type TransformRule = {
	type: "ADD_HEADER" | "REMOVE_HEADER" | "REWRITE_PATH" | "SET_BODY";
	phase?: "request" | "response";
	name?: string;
	value?: string;
	pattern?: string;
	replacement?: string;
	template?: string;
};
