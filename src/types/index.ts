export interface Entry {
  id: number;
  [key: string]: any;
  digital: boolean;
  físico: boolean;
}

// Nuevo tipo de campo
export type FieldType = "text" | "checkbox";

export interface Field {
  name: string;
  type: FieldType;
}

export interface Section {
  name: string;
  fields: Field[];       // ahora es un array de objetos con tipo
  entries: Entry[];

  // Las propiedades de vista y filtros se eliminarán de aquí
  // defaultView: "table" | "card";
  // includeDigital: boolean;
  // includeFísico: boolean;
}
