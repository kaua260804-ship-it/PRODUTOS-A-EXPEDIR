/**
 * Configurações e constantes do sistema
 */

const CONFIG = {
    // Caminho do arquivo Excel principal
    EXCEL_FILE_PATH: 'dados/PEDIDOS A EXPEDIR.xlsx',
    
    // Caminho do arquivo Excel de TIPOS (filtro adicional)
    EXCEL_TIPOS_PATH: 'dados/TIPOS.xlsx',
    
    // Nomes das abas
    SHEETS: {
        GERAL: 'GERAL',
        CORTE: 'CORTE',
        ABERTO: 'ABERTO',
        BS_CAD: 'BS CAD',
        ESTCD: 'ESTCD',
        TIPOS: 'TIPOS' // Nome da aba do arquivo de tipos
    },
    
    // Colunas obrigatórias
    REQUIRED_COLUMNS: {
        GERAL: ['NRO DO PEDIDO', 'CODIGO', 'EMPRESA', 'DATA'],
        CORTE: ['CAD'],
        ABERTO: ['CAD'],
        BS_CAD: ['SEQ PRODUTO', 'NIVEL 1', 'NIVEL 2', 'NIVEL 3'],
        ESTCD: ['Código Produto'],
        TIPOS: ['SeqProduto', 'Produto', 'tipo']
    },
    
    // Configurações de paginação
    PAGINATION: {
        RECORDS_PER_PAGE: 50
    },
    
    // Status possíveis
    STATUS: {
        CORTE: 'CORTE',
        ABERTO: 'ABERTO',
        EXPEDIDO: 'EXPEDIDO'
    }
};

// Constantes para validação
const REQUIRED_SHEETS = [
    CONFIG.SHEETS.GERAL,
    CONFIG.SHEETS.CORTE,
    CONFIG.SHEETS.ABERTO,
    CONFIG.SHEETS.BS_CAD,
    CONFIG.SHEETS.ESTCD
];

// Exportar configurações
window.CONFIG = CONFIG;
window.REQUIRED_SHEETS = REQUIRED_SHEETS;
