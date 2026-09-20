import "server-only";

/** Provider-neutral schema types used by structured AI responses. */
export const SchemaType = {
  OBJECT: "OBJECT",
  ARRAY: "ARRAY",
  STRING: "STRING",
  NUMBER: "NUMBER",
  BOOLEAN: "BOOLEAN",
} as const;

export type SchemaTypeValue = (typeof SchemaType)[keyof typeof SchemaType];

export interface Schema {
  type: SchemaTypeValue | string;
  description?: string;
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  enum?: string[];
  format?: string;
  nullable?: boolean;
}
