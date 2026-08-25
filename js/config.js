/**
 * Configurações e constantes do sistema
 */

const CONFIG = {
    // Caminho do arquivo Excel
    EXCEL_FILE_PATH: 'dados/PEDIDOS A EXPEDIR.xlsx',
    
    // Nomes das abas
    SHEETS: {
        GERAL: 'GERAL',
        CORTE: 'CORTE',
        ABERTO: 'ABERTO',
        BS_CAD: 'BS CAD',
        ESTCD: 'ESTCD'
    },
    
    // Colunas da aba GERAL
    GERAL_COLUMNS: {
        NRO_PEDIDO: 'NRO DO PEDIDO',
        CODIGO: 'CODIGO',
        PRODUTO: 'PRODUTO',
        EMBALAGEM: 'EMBALAGEM',
        EMPRESA: 'EMPRESA',
        SALDO: 'SALDO',
        QTD_DISTRIBUICAO: 'QTD DISTRIBUIÇÃO',
        TOTAL_QND_UND_VENDA: 'TOTAL QND UND VENDA',
        QTD_EXPEDIR: 'QTD EXPEDIR',
        ESTOQUE_DISPONIVEL: 'ESTOQUE DISPONIVEL',
        CATEGORIA: 'CATEGORIA',
        GRUPO: 'GRUPO',
        SUBGRUPO: 'SUBGRUPO',
        DATA: 'DATA',
        EST_DISPONIVEL: 'EST DISPONIVEL',
        CUSTO: 'CUSTO'
    },
    
    // Colunas da aba BS CAD
    BS_CAD_COLUMNS: {
        SEQ_PRODUTO: 'SEQ PRODUTO',
        NIVEL_1: 'NIVEL 1',
        NIVEL_2: 'NIVEL 2',
        NIVEL_3: 'NIVEL 3',
        NIVEL_4: 'NIVEL 4'
    },
    
    // Colunas da aba ESTCD
    ESTCD_COLUMNS: {
        CODIGO_PRODUTO: 'Código Produto',
        QTD_DISPONIVEL: 'Quantidade Disponível',
        PRECO_VDA_UNITARIO: 'Preço Vda Unitário'
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
    },
    
    // Cores por status
    STATUS_COLORS: {
        CORTE: '#e74c3c',
        ABERTO: '#f39c12',
        EXPEDIDO: '#27ae60'
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