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
        
        // Mapear os nomes reais das colunas
        this.columnMapping = this.detectColumnMapping();
    }

    /**
     * Detecta o mapeamento real das colunas
     */
    detectColumnMapping() {
        const geralData = this.sheetsData[CONFIG.SHEETS.GERAL] || [];
        const firstRow = geralData[0] || {};
        
        // Log das colunas disponíveis
        console.log('Colunas disponíveis na aba GERAL:', Object.keys(firstRow));
        
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
            CATEGORIA: 'CATEGORIA',
            GRUPO: 'GRUPO',
            SUBGRUPO: 'SUBGRUPO',
            DATA: 'DATA',
            EST_DISPONIVEL: 'EST DISPONIVEL',
            CUSTO: 'CUSTO'
        };
    }

    /**
     * Processa todos os dados
     */
    process() {
        console.log('Iniciando processamento dos dados...');
        
        this.buildCorteKeys();
        this.buildAbertoKeys();
        this.buildBsCadMap();
        this.buildEstcdMap();
        this.processGeralData();
        
        console.log(`Processamento concluído. Total de registros: ${this.processedData.length}`);
        console.log('Primeiro registro processado:', this.processedData[0]);
        
        return this.processedData;
    }

    /**
     * Constrói o conjunto de chaves CAD da aba CORTE
     */
    buildCorteKeys() {
        const corteData = this.sheetsData[CONFIG.SHEETS.CORTE] || [];
        
        corteData.forEach(row => {
            const cad = this.createCADKey(
                row[this.columnMapping.NRO_PEDIDO],
                row[this.columnMapping.CODIGO],
                row[this.columnMapping.EMPRESA]
            );
            if (cad) this.corteKeys.add(cad);
        });
        
        console.log(`Chaves CORTE criadas: ${this.corteKeys.size}`);
    }

    /**
     * Constrói o conjunto de chaves CAD da aba ABERTO
     */
    buildAbertoKeys() {
        const abertoData = this.sheetsData[CONFIG.SHEETS.ABERTO] || [];
        
        abertoData.forEach(row => {
            const cad = this.createCADKey(
                row[this.columnMapping.NRO_PEDIDO],
                row[this.columnMapping.CODIGO],
                row[this.columnMapping.EMPRESA]
            );
            if (cad) this.abertoKeys.add(cad);
        });
        
        console.log(`Chaves ABERTO criadas: ${this.abertoKeys.size}`);
    }

    /**
     * Constrói o mapa de dados da aba BS CAD
     */
    buildBsCadMap() {
        const bsCadData = this.sheetsData[CONFIG.SHEETS.BS_CAD] || [];
        const firstRow = bsCadData[0] || {};
        console.log('Colunas disponíveis na aba BS CAD:', Object.keys(firstRow));
        
        bsCadData.forEach(row => {
            // Tentar diferentes nomes de colunas
            const seqProduto = row['SEQ PRODUTO'] || row['SEQPRODUTO'] || row['CÓDIGO'] || row['CODIGO'];
            const nivel1 = row['NIVEL 1'] || row['NIVEL1'] || row['NÍVEL 1'];
            const nivel2 = row['NIVEL 2'] || row['NIVEL2'] || row['NÍVEL 2'];
            const nivel3 = row['NIVEL 3'] || row['NIVEL3'] || row['NÍVEL 3'];
            const nivel4 = row['NIVEL 4'] || row['NIVEL4'] || row['NÍVEL 4'];
            
            if (seqProduto) {
                this.bsCadMap.set(seqProduto.toString(), {
                    nivel1: nivel1 || '',
                    nivel2: nivel2 || '',
                    nivel3: nivel3 || '',
                    nivel4: nivel4 || ''
                });
            }
        });
        
        console.log(`Mapa BS CAD criado: ${this.bsCadMap.size} registros`);
        if (this.bsCadMap.size > 0) {
            console.log('Exemplo BS CAD:', this.bsCadMap.entries().next().value);
        }
    }

    /**
     * Constrói o mapa de dados da aba ESTCD
     */
    buildEstcdMap() {
        const estcdData = this.sheetsData[CONFIG.SHEETS.ESTCD] || [];
        const firstRow = estcdData[0] || {};
        console.log('Colunas disponíveis na aba ESTCD:', Object.keys(firstRow));
        
        estcdData.forEach(row => {
            // Tentar diferentes nomes de colunas
            const codigoProduto = row['Código Produto'] || row['Código'] || row['CODIGO'] || row['Codigo Produto'];
            const qtdDisponivel = row['Quantidade Disponível'] || row['QTD DISPONIVEL'] || row['Qtd Disponível'];
            const precoVdaUnitario = row['Preço Vda Unitário'] || row['PRECO VDA UNITARIO'] || row['Preço Unitário'];
            
            if (codigoProduto) {
                this.estcdMap.set(codigoProduto.toString(), {
                    qtdDisponivel: qtdDisponivel || 0,
                    precoVdaUnitario: precoVdaUnitario || 0
                });
            }
        });
        
        console.log(`Mapa ESTCD criado: ${this.estcdMap.size} registros`);
        if (this.estcdMap.size > 0) {
            console.log('Exemplo ESTCD:', this.estcdMap.entries().next().value);
        }
    }

    /**
     * Processa os dados da aba GERAL
     */
    processGeralData() {
        const geralData = this.sheetsData[CONFIG.SHEETS.GERAL] || [];
        
        this.processedData = geralData.map((row, index) => {
            // Usar o mapeamento de colunas
            const nroPedido = row[this.columnMapping.NRO_PEDIDO];
            const codigo = row[this.columnMapping.CODIGO];
            const empresa = row[this.columnMapping.EMPRESA];
            
            const cad = this.createCADKey(nroPedido, codigo, empresa);
            
            // Determinar status
            let status = CONFIG.STATUS.EXPEDIDO;
            if (cad && this.corteKeys.has(cad)) {
                status = CONFIG.STATUS.CORTE;
            } else if (cad && this.abertoKeys.has(cad)) {
                status = CONFIG.STATUS.ABERTO;
            }
            
            // Buscar dados do BS CAD
            const codigoStr = codigo?.toString();
            const bsCadData = this.bsCadMap.get(codigoStr) || {};
            
            // Buscar dados do ESTCD
            const estcdData = this.estcdMap.get(codigoStr) || {};
            
            // Criar objeto processado com todos os campos
            return {
                // Campos originais
                'NRO DO PEDIDO': nroPedido,
                'CODIGO': codigo,
                'PRODUTO': row[this.columnMapping.PRODUTO],
                'EMBALAGEM': row[this.columnMapping.EMBALAGEM],
                'EMPRESA': empresa,
                'SALDO': row[this.columnMapping.SALDO],
                'QTD DISTRIBUIÇÃO': row[this.columnMapping.QTD_DISTRIBUICAO],
                'TOTAL QND UND VENDA': row[this.columnMapping.TOTAL_QND_UND_VENDA],
                'QTD EXPEDIR': row[this.columnMapping.QTD_EXPEDIR],
                'ESTOQUE DISPONIVEL': row[this.columnMapping.ESTOQUE_DISPONIVEL],
                'CATEGORIA': row[this.columnMapping.CATEGORIA],
                'GRUPO': row[this.columnMapping.GRUPO],
                'SUBGRUPO': row[this.columnMapping.SUBGRUPO],
                'DATA': row[this.columnMapping.DATA],
                'EST DISPONIVEL': row[this.columnMapping.EST_DISPONIVEL],
                'CUSTO': row[this.columnMapping.CUSTO],
                
                // Campos calculados
                'CAD': cad,
                'STATUS': status,
                'NIVEL_1': bsCadData.nivel1 || '',
                'NIVEL_2': bsCadData.nivel2 || '',
                'NIVEL_3': bsCadData.nivel3 || '',
                'NIVEL_4': bsCadData.nivel4 || '',
                'QTD_DISPONIVEL_CD': estcdData.qtdDisponivel || 0,
                'PRECO_VDA_UNITARIO': estcdData.precoVdaUnitario || 0
            };
        });
        
        console.log(`Dados processados: ${this.processedData.length} registros`);
        if (this.processedData.length > 0) {
            console.log('Exemplo de registro processado:', this.processedData[0]);
        }
    }

    /**
     * Cria a chave CAD
     */
    createCADKey(nroPedido, codigo, empresa) {
        if (nroPedido === undefined || nroPedido === null || 
            codigo === undefined || codigo === null ||
            empresa === undefined || empresa === null) {
            return null;
        }
        return `${nroPedido}-${codigo}-${empresa}`;
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
        
        return Array.from(values).sort();
    }

    /**
     * Obtém estatísticas dos dados processados
     */
    getStatistics(filteredData = null) {
        const data = filteredData || this.processedData;
        
        const totalSKUs = new Set(data.map(row => row['CODIGO'])).size;
        const totalItems = data.length;
        
        const abertoItems = data.filter(row => row['STATUS'] === CONFIG.STATUS.ABERTO).length;
        const corteItems = data.filter(row => row['STATUS'] === CONFIG.STATUS.CORTE).length;
        const expedidoItems = data.filter(row => row['STATUS'] === CONFIG.STATUS.EXPEDIDO).length;
        
        return {
            totalSKUs,
            totalItems,
            abertoItems,
            corteItems,
            expedidoItems,
            abertoPercent: totalItems > 0 ? (abertoItems / totalItems) * 100 : 0,
            cortePercent: totalItems > 0 ? (corteItems / totalItems) * 100 : 0,
            expedidoPercent: totalItems > 0 ? (expedidoItems / totalItems) * 100 : 0
        };
    }
}

// Exportar classe
window.DataProcessor = DataProcessor;