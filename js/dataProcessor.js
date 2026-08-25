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
        
        // Verificar colunas das outras abas
        const corteData = this.sheetsData[CONFIG.SHEETS.CORTE] || [];
        const abertoData = this.sheetsData[CONFIG.SHEETS.ABERTO] || [];
        
        if (corteData.length > 0) {
            console.log('Colunas disponíveis na aba CORTE:', Object.keys(corteData[0]));
        }
        
        if (abertoData.length > 0) {
            console.log('Colunas disponíveis na aba ABERTO:', Object.keys(abertoData[0]));
        }
        
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
        console.log('Iniciando processamento dos dados...');
        
        this.buildCorteKeys();
        this.buildAbertoKeys();
        this.buildBsCadMap();
        this.buildEstcdMap();
        this.processGeralData();
        
        console.log(`Processamento concluído. Total de registros: ${this.processedData.length}`);
        
        // Verificar se há registros com NRO DO PEDIDO inválido
        const pedidosInvalidos = this.processedData.filter(row => !row['NRO DO PEDIDO']);
        if (pedidosInvalidos.length > 0) {
            console.warn(`Registros com NRO DO PEDIDO inválido: ${pedidosInvalidos.length}`);
        }
        
        // Mostrar exemplo
        if (this.processedData.length > 0) {
            console.log('Exemplo de registro processado:', this.processedData[0]);
        }
        
        return this.processedData;
    }

    /**
     * Constrói o conjunto de chaves CAD da aba CORTE
     * A coluna B na aba CORTE já contém a chave CAD pronta
     */
    buildCorteKeys() {
        const corteData = this.sheetsData[CONFIG.SHEETS.CORTE] || [];
        
        corteData.forEach((row, index) => {
            // Verificar se existe uma coluna CAD ou similar (coluna B)
            let cad = row['CAD'] || row['CHAVE'] || row['CHAVE CAD'];
            
            // Se não encontrar, tentar criar a chave
            if (!cad) {
                // Tentar com diferentes combinações de colunas
                const nroPedido = row['NRO DO PEDIDO'] || row['NRO PEDIDO'] || row['PEDIDO'];
                const codigo = row['CODIGO'] || row['COD'] || row['CÓDIGO'];
                const empresa = row['EMPRESA'] || row['EMP'];
                
                if (nroPedido && codigo && empresa) {
                    cad = `${nroPedido}-${codigo}-${empresa}`;
                }
            }
            
            if (cad) {
                this.corteKeys.add(cad.toString());
            }
            
            // Log do primeiro registro para debug
            if (index === 0) {
                console.log('Exemplo de registro CORTE:', row);
                console.log('Chave CAD extraída:', cad);
            }
        });
        
        console.log(`Chaves CORTE criadas: ${this.corteKeys.size}`);
        if (this.corteKeys.size > 0) {
            console.log('Exemplos de chaves CORTE:', Array.from(this.corteKeys).slice(0, 5));
        }
    }

    /**
     * Constrói o conjunto de chaves CAD da aba ABERTO
     * A coluna B na aba ABERTO já contém a chave CAD pronta
     */
    buildAbertoKeys() {
        const abertoData = this.sheetsData[CONFIG.SHEETS.ABERTO] || [];
        
        abertoData.forEach((row, index) => {
            // Verificar se existe uma coluna CAD ou similar (coluna B)
            let cad = row['CAD'] || row['CHAVE'] || row['CHAVE CAD'];
            
            // Se não encontrar, tentar criar a chave
            if (!cad) {
                const nroPedido = row['NRO DO PEDIDO'] || row['NRO PEDIDO'] || row['PEDIDO'];
                const codigo = row['CODIGO'] || row['COD'] || row['CÓDIGO'];
                const empresa = row['EMPRESA'] || row['EMP'];
                
                if (nroPedido && codigo && empresa) {
                    cad = `${nroPedido}-${codigo}-${empresa}`;
                }
            }
            
            if (cad) {
                this.abertoKeys.add(cad.toString());
            }
            
            // Log do primeiro registro para debug
            if (index === 0) {
                console.log('Exemplo de registro ABERTO:', row);
                console.log('Chave CAD extraída:', cad);
            }
        });
        
        console.log(`Chaves ABERTO criadas: ${this.abertoKeys.size}`);
        if (this.abertoKeys.size > 0) {
            console.log('Exemplos de chaves ABERTO:', Array.from(this.abertoKeys).slice(0, 5));
        }
    }

    /**
     * Constrói o mapa de dados da aba BS CAD
     */
    buildBsCadMap() {
        const bsCadData = this.sheetsData[CONFIG.SHEETS.BS_CAD] || [];
        
        bsCadData.forEach(row => {
            const seqProduto = row['SEQ PRODUTO'] || row['SEQPRODUTO'] || row['CÓDIGO'] || row['CODIGO'];
            const nivel1 = row['NIVEL 1'] || row['NIVEL1'] || row['NÍVEL 1'];
            const nivel2 = row['NIVEL 2'] || row['NIVEL2'] || row['NÍVEL 2'];
            const nivel3 = row['NIVEL 3'] || row['NIVEL3'] || row['NÍVEL 3'];
            const nivel4 = row['NIVEL 4'] || row['NIVEL4'] || row['NÍVEL 4'];
            const nivel5 = row['NIVEL 5'] || row['NIVEL5'] || row['NÍVEL 5'];
            
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
        
        console.log(`Mapa BS CAD criado: ${this.bsCadMap.size} registros`);
    }

    /**
     * Constrói o mapa de dados da aba ESTCD
     */
    buildEstcdMap() {
        const estcdData = this.sheetsData[CONFIG.SHEETS.ESTCD] || [];
        
        estcdData.forEach(row => {
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
            
            // Criar chave CAD usando a fórmula: =[@[NRO DO PEDIDO]]&"-"&[@CODIGO]&"-"&[@EMPRESA]
            const cad = this.createCADKey(nroPedido, codigo, empresa);
            
            // Determinar status usando a fórmula: =SE(CONT.SE(CORTE!B:B;[@CAD])>0;"CORTE";SE(CONT.SE(ABERTO!B:B;[@CAD])>0;"ABERTO";"EXPEDIDO"))
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
            
            // Criar objeto processado
            return {
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
                'DATA': row[this.columnMapping.DATA],
                'EST DISPONIVEL': row[this.columnMapping.EST_DISPONIVEL],
                'CUSTO': row[this.columnMapping.CUSTO],
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
        
        console.log(`Dados processados: ${this.processedData.length} registros`);
    }

    /**
     * Cria a chave CAD
     * Fórmula: =[@[NRO DO PEDIDO]]&"-"&[@CODIGO]&"-"&[@EMPRESA]
     */
    createCADKey(nroPedido, codigo, empresa) {
        if (nroPedido === undefined || nroPedido === null || 
            codigo === undefined || codigo === null ||
            empresa === undefined || empresa === null) {
            return null;
        }
        
        // Garantir que os valores sejam strings e remover espaços extras
        const pedidoStr = nroPedido.toString().trim();
        const codigoStr = codigo.toString().trim();
        const empresaStr = empresa.toString().trim();
        
        return `${pedidoStr}-${codigoStr}-${empresaStr}`;
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
     * CONTAGEM NORMAL (não distinta)
     */
    getStatistics(filteredData = null) {
        const data = filteredData || this.processedData;
        
        // Contagem normal de itens (não distinta)
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
