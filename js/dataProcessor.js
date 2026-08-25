/**
 * Processa e cruza os dados das diferentes abas
 */

class DataProcessor {
    constructor(sheetsData) {
        this.sheetsData = sheetsData;
        this.processedData = [];
        this.corteKeys = new Set();
        this.abertoKeys = new Set();
        this.bsCadMap = new Map();
        this.estcdMap = new Map();
        
        this.columnMapping = this.detectColumnMapping();
    }

    /**
     * Detecta o mapeamento real das colunas
     */
    detectColumnMapping() {
        const geralData = this.sheetsData[CONFIG.SHEETS.GERAL] || [];
        const firstRow = geralData[0] || {};
        
        return {
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
            DATA: 'DATA',
            EST_DISPONIVEL: 'EST DISPONIVEL',
            CUSTO: 'CUSTO'
        };
    }

    /**
     * Processa todos os dados
     */
    process() {
        this.buildCorteKeys();
        this.buildAbertoKeys();
        this.buildBsCadMap();
        this.buildEstcdMap();
        this.processGeralData();
        
        return this.processedData;
    }

    /**
     * Constrói o conjunto de chaves CAD da aba CORTE
     */
    buildCorteKeys() {
        const corteData = this.sheetsData[CONFIG.SHEETS.CORTE] || [];
        
        corteData.forEach(row => {
            const nroPedido = row['NRO DO PEDIDO'] || row['NRO PEDIDO'] || row['PEDIDO'];
            const codigo = row['CODIGO'] || row['COD'];
            const empresa = row['EMPRESA'] || row['EMP'];
            
            if (nroPedido && codigo && empresa) {
                const cad = `${nroPedido}-${codigo}-${empresa}`;
                this.corteKeys.add(cad.toString());
            }
        });
    }

    /**
     * Constrói o conjunto de chaves CAD da aba ABERTO
     */
    buildAbertoKeys() {
        const abertoData = this.sheetsData[CONFIG.SHEETS.ABERTO] || [];
        
        abertoData.forEach(row => {
            const nroPedido = row['NRO DO PEDIDO'] || row['NRO PEDIDO'] || row['PEDIDO'];
            const codigo = row['CODIGO'] || row['COD'];
            const empresa = row['EMPRESA'] || row['EMP'];
            
            if (nroPedido && codigo && empresa) {
                const cad = `${nroPedido}-${codigo}-${empresa}`;
                this.abertoKeys.add(cad.toString());
            }
        });
    }

    /**
     * Constrói o mapa de dados da aba BS CAD
     */
    buildBsCadMap() {
        const bsCadData = this.sheetsData[CONFIG.SHEETS.BS_CAD] || [];
        
        bsCadData.forEach(row => {
            const seqProduto = row['SEQ PRODUTO'] || row['SEQPRODUTO'];
            const nivel1 = row['NIVEL 1'] || row['NIVEL1'];
            const nivel2 = row['NIVEL 2'] || row['NIVEL2'];
            const nivel3 = row['NIVEL 3'] || row['NIVEL3'];
            const nivel4 = row['NIVEL 4'] || row['NIVEL4'];
            const nivel5 = row['NIVEL 5'] || row['NIVEL5'];
            
            if (seqProduto) {
                this.bsCadMap.set(seqProduto.toString(), {
                    nivel1: nivel1 || '',
                    nivel2: nivel2 || '',
                    nivel3: nivel3 || '',
                    nivel4: nivel4 || '',
                    nivel5: nivel5 || ''
                });
            }
        });
    }

    /**
     * Constrói o mapa de dados da aba ESTCD
     */
    buildEstcdMap() {
        const estcdData = this.sheetsData[CONFIG.SHEETS.ESTCD] || [];
        
        estcdData.forEach(row => {
            const codigoProduto = row['Código Produto'] || row['CODIGO'];
            const qtdDisponivel = row['Quantidade Disponível'] || 0;
            const precoVdaUnitario = row['Preço Vda Unitário'] || 0;
            
            if (codigoProduto) {
                this.estcdMap.set(codigoProduto.toString(), {
                    qtdDisponivel: qtdDisponivel,
                    precoVdaUnitario: precoVdaUnitario
                });
            }
        });
    }

    /**
     * Processa os dados da aba GERAL
     */
    processGeralData() {
        const geralData = this.sheetsData[CONFIG.SHEETS.GERAL] || [];
        
        this.processedData = geralData.map(row => {
            const nroPedido = row['NRO DO PEDIDO'];
            const codigo = row['CODIGO'];
            const empresa = row['EMPRESA'];
            
            const cad = this.createCADKey(nroPedido, codigo, empresa);
            
            let status = CONFIG.STATUS.EXPEDIDO;
            if (cad && this.corteKeys.has(cad)) {
                status = CONFIG.STATUS.CORTE;
            } else if (cad && this.abertoKeys.has(cad)) {
                status = CONFIG.STATUS.ABERTO;
            }
            
            const codigoStr = codigo?.toString();
            const bsCadData = this.bsCadMap.get(codigoStr) || {};
            const estcdData = this.estcdMap.get(codigoStr) || {};
            
            return {
                'NRO DO PEDIDO': nroPedido,
                'CODIGO': codigo,
                'PRODUTO': row['PRODUTO'],
                'EMBALAGEM': row['EMBALAGEM'],
                'EMPRESA': empresa,
                'SALDO': row['SALDO'],
                'QTD DISTRIBUIÇÃO': row['QTD DISTRIBUIÇÃO'],
                'TOTAL QND UND VENDA': row['TOTAL QND UND VENDA'],
                'QTD EXPEDIR': row['QTD EXPEDIR'],
                'ESTOQUE DISPONIVEL': row['ESTOQUE DISPONIVEL'],
                'DATA': row['DATA'],
                'EST DISPONIVEL': row['EST DISPONIVEL'],
                'CUSTO': row['CUSTO'],
                'CAD': cad,
                'STATUS': status,
                'CATEGORIA': bsCadData.nivel1 || '',
                'GRUPO': bsCadData.nivel2 || '',
                'SUBGRUPO': bsCadData.nivel3 || '',
                'NIVEL_4': bsCadData.nivel4 || '',
                'NIVEL_5': bsCadData.nivel5 || '',
                'QTD_DISPONIVEL_CD': estcdData.qtdDisponivel || 0,
                'PRECO_VDA_UNITARIO': estcdData.precoVdaUnitario || 0
            };
        });
    }

    /**
     * Cria a chave CAD
     */
    createCADKey(nroPedido, codigo, empresa) {
        if (!nroPedido || !codigo || !empresa) return null;
        return `${nroPedido.toString().trim()}-${codigo.toString().trim()}-${empresa.toString().trim()}`;
    }

    /**
     * Converte data serial do Excel para objeto Date
     * CORREÇÃO: Ajuste para o fuso horário e diferença de 1 dia
     * 
     * Explicação: 
     * - Excel serial 46258 = 24/08/2026
     * - JavaScript new Date() usa UTC
     * - Ajuste: (serial - 25569 + 1) * 86400000
     * - O +1 compensa o bug do Excel que considera 1900 como ano bissexto
     */
    excelDateToDate(serial) {
        if (!serial && serial !== 0) return null;
        
        const numSerial = parseFloat(serial);
        if (isNaN(numSerial)) return null;
        
        // Se já for uma data válida, retorna
        if (numSerial > 60000) {
            const date = new Date(numSerial);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        
        // Excel serial: dias desde 01/01/1900
        // JavaScript: milissegundos desde 01/01/1970
        // Excel considera 01/01/1900 = 1, JavaScript considera 01/01/1970 = 0
        // Diferença: 25569 dias entre 01/01/1900 e 01/01/1970
        // Porém, Excel tem um bug: considera 1900 como bissexto, então há um dia extra
        // Então: (serial - 25569 + 1) * 86400000
        
        // Apenas processa números seriais do Excel (geralmente entre 40000 e 60000)
        if (numSerial < 40000 || numSerial > 60000) {
            return null;
        }
        
        const daysOffset = 25569; // dias entre 01/01/1900 e 01/01/1970
        const excelBugOffset = 1; // Excel considera 1900 como bissexto
        const millisecondsPerDay = 86400000;
        
        // Calcular timestamp em milissegundos
        const timestamp = (numSerial - daysOffset + excelBugOffset) * millisecondsPerDay;
        const date = new Date(timestamp);
        
        // Verificar se a data é válida
        if (isNaN(date.getTime())) {
            return null;
        }
        
        return date;
    }

    /**
     * Converte data serial do Excel para string formatada
     */
    excelDateToString(serial) {
        const date = this.excelDateToDate(serial);
        if (date) {
            return date.toLocaleDateString('pt-BR');
        }
        return serial?.toString() || '';
    }

    /**
     * Converte data para objeto Date (com suporte a string)
     */
    parseDate(dataStr) {
        // Se for número (serial do Excel)
        if (typeof dataStr === 'number' || (typeof dataStr === 'string' && !isNaN(parseFloat(dataStr)))) {
            const numData = parseFloat(dataStr);
            // Verifica se é um serial do Excel (geralmente entre 40000 e 60000)
            if (numData > 40000 && numData < 60000) {
                const date = this.excelDateToDate(numData);
                if (date) return date;
            }
            
            // Se for timestamp em milissegundos
            if (numData > 60000) {
                const date = new Date(numData);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
        }
        
        // Tentar parse como string
        if (typeof dataStr === 'string') {
            // Tenta diferentes formatos
            const date = new Date(dataStr);
            if (!isNaN(date.getTime())) {
                return date;
            }
            
            // Tenta formato brasileiro (dd/mm/yyyy)
            const parts = dataStr.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const year = parseInt(parts[2]);
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    const date = new Date(year, month, day);
                    if (!isNaN(date.getTime())) {
                        return date;
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Formata data para exibição
     */
    formatDateDisplay(dataStr) {
        if (!dataStr && dataStr !== 0) return '';
        
        const date = this.parseDate(dataStr);
        if (date) {
            return date.toLocaleDateString('pt-BR');
        }
        
        // Se não conseguiu parsear, retorna o valor original
        return dataStr?.toString() || '';
    }

    /**
     * Obtém dados únicos para filtros
     */
    getUniqueValues(column) {
        const values = new Set();
        
        this.processedData.forEach(row => {
            const value = row[column];
            if (value !== undefined && value !== null && value !== '') {
                values.add(value.toString());
            }
        });
        
        return Array.from(values).sort((a, b) => {
            // Ordenação especial para datas
            if (column === 'DATA') {
                const dateA = this.parseDate(a);
                const dateB = this.parseDate(b);
                if (dateA && dateB) {
                    return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
                }
            }
            return a.localeCompare(b);
        });
    }

    /**
     * Obtém estatísticas - CONTAGEM NORMAL
     */
    getStatistics(filteredData = null) {
        const data = filteredData || this.processedData;
        
        const totalItens = data.length;
        const abertoItems = data.filter(row => row['STATUS'] === CONFIG.STATUS.ABERTO).length;
        const corteItems = data.filter(row => row['STATUS'] === CONFIG.STATUS.CORTE).length;
        const expedidoItems = data.filter(row => row['STATUS'] === CONFIG.STATUS.EXPEDIDO).length;
        
        return {
            totalItens,
            abertoItems,
            corteItems,
            expedidoItems,
            abertoPercent: totalItens > 0 ? (abertoItems / totalItens) * 100 : 0,
            cortePercent: totalItens > 0 ? (corteItems / totalItens) * 100 : 0,
            expedidoPercent: totalItens > 0 ? (expedidoItems / totalItens) * 100 : 0
        };
    }

    /**
     * Obtém datas disponíveis para filtro
     */
    getAvailableDates() {
        const dates = new Set();
        
        this.processedData.forEach(row => {
            const data = row['DATA'];
            if (data !== undefined && data !== null && data !== '') {
                const formatted = this.formatDateDisplay(data);
                if (formatted) {
                    dates.add(formatted);
                }
            }
        });
        
        return Array.from(dates).sort((a, b) => {
            const dateA = this.parseDate(a);
            const dateB = this.parseDate(b);
            if (dateA && dateB) {
                return dateB.getTime() - dateA.getTime(); // Mais recente primeiro
            }
            return a.localeCompare(b);
        });
    }
}

// Exportar classe
window.DataProcessor = DataProcessor;