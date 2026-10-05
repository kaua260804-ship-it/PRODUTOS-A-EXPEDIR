/**
 * Processa e cruza os dados das diferentes abas
 */

class DataProcessor {
    constructor(sheetsData, tiposData = []) {
        this.sheetsData = sheetsData;
        this.tiposData = tiposData || [];
        this.processedData = [];
        this.corteKeys = new Set();
        this.abertoKeys = new Set();
        this.bsCadMap = new Map();
        this.estcdMap = new Map();
        this.tiposMap = new Map(); // Mapa: codigo -> tipo
        
        this.buildTiposMap();
    }

    /**
     * Constrói o mapa de TIPOS (SeqProduto -> tipo)
     */
    buildTiposMap() {
        if (!this.tiposData || this.tiposData.length === 0) {
            console.log('Nenhum dado de TIPOS disponível');
            return;
        }
        
        console.log('========================================');
        console.log('CONSTRUINDO MAPA DE TIPOS');
        console.log('========================================');
        
        this.tiposData.forEach((row, index) => {
            // Tentar diferentes nomes de coluna
            const seqProduto = row['SeqProduto'] || row['SEQ PRODUTO'] || row['SEQPRODUTO'] || row['Codigo'] || row['CODIGO'];
            const tipo = row['tipo'] || row['TIPO'] || row['Tipo'];
            
            if (seqProduto !== undefined && seqProduto !== null && seqProduto !== '') {
                const key = seqProduto.toString().trim();
                this.tiposMap.set(key, tipo || '');
            }
        });
        
        console.log('Total de tipos mapeados:', this.tiposMap.size);
        
        // Mostrar alguns exemplos
        let count = 0;
        this.tiposMap.forEach((tipo, codigo) => {
            if (count < 5) {
                console.log(`  ${codigo} -> ${tipo}`);
                count++;
            }
        });
        console.log('========================================');
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
            const tipo = this.tiposMap.get(codigoStr) || '';
            
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
                'PRECO_VDA_UNITARIO': estcdData.precoVdaUnitario || 0,
                'TIPO': tipo
            };
        });
    }

    createCADKey(nroPedido, codigo, empresa) {
        if (!nroPedido || !codigo || !empresa) return null;
        return `${nroPedido.toString().trim()}-${codigo.toString().trim()}-${empresa.toString().trim()}`;
    }

    /**
     * Retorna os tipos únicos disponíveis para filtro
     */
    getUniqueTipos() {
        const tipos = new Set();
        
        this.processedData.forEach(row => {
            const tipo = row['TIPO'];
            if (tipo && tipo.toString().trim() !== '') {
                tipos.add(tipo.toString().trim());
            }
        });
        
        return Array.from(tipos).sort();
    }

    /**
     * Converte data serial do Excel para objeto Date
     */
    excelDateToDate(serial) {
        if (!serial && serial !== 0) return null;
        
        const numSerial = parseFloat(serial);
        if (isNaN(numSerial)) return null;
        
        if (numSerial > 60000) {
            const date = new Date(numSerial);
            if (!isNaN(date.getTime())) return date;
        }
        
        if (numSerial < 40000 || numSerial > 60000) {
            return null;
        }
        
        const daysOffset = 25569;
        const excelBugOffset = 1;
        const millisecondsPerDay = 86400000;
        
        const timestamp = (numSerial - daysOffset + excelBugOffset) * millisecondsPerDay;
        const date = new Date(timestamp);
        
        if (isNaN(date.getTime())) return null;
        return date;
    }

    parseDate(dataStr) {
        if (typeof dataStr === 'number' || (typeof dataStr === 'string' && !isNaN(parseFloat(dataStr)))) {
            const numData = parseFloat(dataStr);
            if (numData > 40000 && numData < 60000) {
                const date = this.excelDateToDate(numData);
                if (date) return date;
            }
            
            if (numData > 60000) {
                const date = new Date(numData);
                if (!isNaN(date.getTime())) return date;
            }
        }
        
        if (typeof dataStr === 'string') {
            const date = new Date(dataStr);
            if (!isNaN(date.getTime())) return date;
            
            const parts = dataStr.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const year = parseInt(parts[2]);
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    const date = new Date(year, month, day);
                    if (!isNaN(date.getTime())) return date;
                }
            }
        }
        
        return null;
    }

    formatDateDisplay(dataStr) {
        if (!dataStr && dataStr !== 0) return '';
        
        const date = this.parseDate(dataStr);
        if (date) {
            return date.toLocaleDateString('pt-BR');
        }
        
        return dataStr?.toString() || '';
    }

    getUniqueValues(column) {
        const values = new Set();
        
        this.processedData.forEach(row => {
            const value = row[column];
            if (value !== undefined && value !== null && value !== '') {
                values.add(value.toString());
            }
        });
        
        return Array.from(values).sort((a, b) => {
            if (column === 'DATA') {
                const dateA = this.parseDate(a);
                const dateB = this.parseDate(b);
                if (dateA && dateB) {
                    return dateB.getTime() - dateA.getTime();
                }
            }
            return a.localeCompare(b);
        });
    }

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
}

// Exportar classe
window.DataProcessor = DataProcessor;
