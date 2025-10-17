export interface Entry {
  id: number;
  cover?: string; // NUEVO: campo opcional para portada, exclusivo del modo tarjetas
  [key: string]: any;
  digital: boolean;
  físico: boolean;
}

export type FieldType = "text" | "checkbox";

export interface Field {
  name: string;
  type: FieldType;
}

export interface Section {
  name: string;
  fields: Field[];
  entries: Entry[];
}
