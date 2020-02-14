export const negative = (rowData: any): boolean => {
  return rowData['Change(%)'] < 0;
};

export const positive = (rowData: any): boolean => {
  return rowData['Change(%)'] > 0;
};

export const changeNegative = (rowData: any): boolean => {
  return rowData['Change(%)'] < 0 && rowData['Change(%)'] > -1;
};

export const changePositive = (rowData: any): boolean => {
  return rowData['Change(%)'] > 0 && rowData['Change(%)'] < 1;
};

export const strongPositive = (rowData: any): boolean => {
  return rowData['Change(%)'] >= 1;
};

export const strongNegative = (rowData: any): boolean => {
  return rowData['Change(%)'] <= -1;
};
