export interface Filter {
  column: string;
  operator: string;
  columnValue: any;
}

export interface DataAndColumns {
  data: Record<string, unknown>[];
  columns: string[];
}
