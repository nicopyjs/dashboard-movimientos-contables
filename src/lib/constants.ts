export const SPREADSHEET_IDS = {
  centros: "1XCeMZRw6bU--3SeOFRI08J5eFxaFbvVflPWWaczufQc",
  movimientos2026: "1IGN_SaV7zKqwMRGc21N_avA-pyWtI4sY6IxnADbU9oU",
  historico: "15xMsuXMCpybua22fZhunG2vL2Nbtlr-8-8rGobI-mhc",
  pnl: "1b4QPLY0otfzhSkJ7QQscJALJu7DssHi9w1XCad2LI48",
} as const;

// Tab name inside each spreadsheet holding the raw data.
export const SHEET_TABS = {
  centros: "centros_negocio",
  movimientos: "Hoja 1",
  pnl: "pnl_data",
} as const;

export const AREA_LABELS: Record<string, string> = {
  GNN: "General",
  ING: "Ingeniería",
  INT: "Instalaciones",
  RBP: "Redes de baja presión",
  RCT: "Refacciones",
  SST: "Serv. Técnico",
};
