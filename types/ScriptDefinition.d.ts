import { VoidExpression } from "typescript";

export interface ScriptDefinition {
  action: () => void;
  description: string;
}
