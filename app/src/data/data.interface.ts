export interface Element {
  id?: string;
  title: string;
  description: string;
}

export interface DataJson {
  elements: Element[];
}
