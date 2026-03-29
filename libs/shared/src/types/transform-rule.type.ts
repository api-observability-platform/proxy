/** Single transformation rule applied to proxied HTTP traffic. */
export type TransformRule =
	| {
			type: "ADD_HEADER";
			phase: "request" | "response";
			name: string;
			value: string;
	  }
	| {
			type: "REMOVE_HEADER";
			phase: "request" | "response";
			name: string;
	  }
	| { type: "REWRITE_PATH"; pattern: string; replacement: string }
	| {
			type: "SET_BODY";
			phase: "request" | "response";
			template: string;
	  };
