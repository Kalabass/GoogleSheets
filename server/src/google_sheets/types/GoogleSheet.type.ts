export interface GoogleSheet {
  id: number;
  sheet_id: string;
}

export interface GoogleSheetData extends Omit<GoogleSheet, 'id'> {}
