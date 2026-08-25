/**
 * Carrega os dados do arquivo Excel
 */

class DataLoader {
    constructor() {
        this.workbook = null;
        this.sheetsData = {};
        this.isLoading = false;
    }

    /**
     * Carrega o arquivo Excel com cache busting
     */
    async loadExcelFile() {
        try {
            this.isLoading = true;
            this.showProgress(true);
            
            // Adicionar timestamp para evitar cache
            const timestamp = new Date().getTime();
            const filePath = `${CONFIG.EXCEL_FILE_PATH}?t=${timestamp}`;
            
            console.log('========================================');
            console.log('CARREGANDO ARQUIVO EXCEL');
            console.log('========================================');
            console.log('Caminho do arquivo:', CONFIG.EXCEL_FILE_PATH);
            console.log('URL com cache busting:', filePath);
            console.log('Timestamp:', new Date(timestamp).toLocaleString('pt-BR'));
            console.log('========================================');
            
            const response = await fetch(filePath, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            console.log('Status da resposta:', response.status, response.statusText);
            console.log('Headers:', {
                'content-type': response.headers.get('content-type'),
                'content-length': response.headers.get('content-length'),
                'last-modified': response.headers.get('last-modified')
            });
            
            if (!response.ok) {
                throw new Error(`Arquivo não encontrado: ${CONFIG.EXCEL_FILE_PATH}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            console.log('Tamanho do arquivo (bytes):', arrayBuffer.byteLength);
            console.log('Tamanho do arquivo (KB):', (arrayBuffer.byteLength / 1024).toFixed(2));
            
            this.workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            console.log('========================================');
            console.log('ABAS ENCONTRADAS NO ARQUIVO:');
            console.log('========================================');
            console.log('Total de abas:', this.workbook.SheetNames.length);
            this.workbook.SheetNames.forEach((sheetName, index) => {
                console.log(`${index + 1}. ${sheetName}`);
            });
            console.log('========================================');
            
            this.loadAllSheets();
            this.validateSheets();
            
            // Log das datas encontradas
            this.logDatesInfo();
            
            this.updateLastUpdate();
            this.showProgress(false);
            
            return this.sheetsData;
        } catch (error) {
            console.error('========================================');
            console.error('ERRO AO CARREGAR ARQUIVO EXCEL:');
            console.error('========================================');
            console.error('Mensagem:', error.message);
            console.error('Stack:', error.stack);
            console.error('========================================');
            
            this.showProgress(false);
            this.showError(error.message);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Carrega todas as abas do arquivo
     */
    loadAllSheets() {
        console.log('========================================');
        console.log('CARREGANDO DADOS DAS ABAS:');
        console.log('========================================');
        
        REQUIRED_SHEETS.forEach(sheetName => {
            if (this.workbook.SheetNames.includes(sheetName)) {
                const worksheet = this.workbook.Sheets[sheetName];
                this.sheetsData[sheetName] = XLSX.utils.sheet_to_json(worksheet);
                
                console.log(`Aba "${sheetName}":`);
                console.log(`  - Registros: ${this.sheetsData[sheetName].length}`);
                
                if (this.sheetsData[sheetName].length > 0) {
                    const firstRow = this.sheetsData[sheetName][0];
                    console.log(`  - Colunas (${Object.keys(firstRow).length}):`, Object.keys(firstRow));
                    
                    // Se for a aba GERAL, mostrar as primeiras datas
                    if (sheetName === CONFIG.SHEETS.GERAL) {
                        const datas = this.extractDatesFromGeral(this.sheetsData[sheetName]);
                        console.log(`  - Primeiras 5 datas:`, datas.slice(0, 5));
                        console.log(`  - Últimas 5 datas:`, datas.slice(-5));
                        console.log(`  - Total de datas únicas:`, new Set(datas).size);
                    }
                }
            } else {
                console.warn(`Aba "${sheetName}" NÃO encontrada no arquivo`);
            }
        });
        
        console.log('========================================');
    }

    /**
     * Extrai datas da aba GERAL
     */
    extractDatesFromGeral(geralData) {
        const datas = [];
        
        geralData.forEach((row, index) => {
            const data = row['DATA'] || row['Data'] || row['data'];
            if (data !== undefined && data !== null && data !== '') {
                datas.push({
                    index,
                    valorOriginal: data,
                    tipo: typeof data,
                    valorString: data.toString()
                });
            }
        });
        
        return datas;
    }

    /**
     * Log das informações de datas
     */
    logDatesInfo() {
        console.log('========================================');
        console.log('ANÁLISE DAS DATAS NA ABA GERAL:');
        console.log('========================================');
        
        const geralData = this.sheetsData[CONFIG.SHEETS.GERAL] || [];
        
        if (geralData.length === 0) {
            console.warn('Aba GERAL está vazia!');
            return;
        }
        
        // Coletar todas as datas
        const datasInfo = this.extractDatesFromGeral(geralData);
        
        console.log(`Total de registros com data: ${datasInfo.length}`);
        
        // Agrupar por valor
        const datasAgrupadas = {};
        datasInfo.forEach(info => {
            const key = info.valorString;
            if (!datasAgrupadas[key]) {
                datasAgrupadas[key] = {
                    valor: info.valorOriginal,
                    tipo: info.tipo,
                    contagem: 0,
                    exemplos: []
                };
            }
            datasAgrupadas[key].contagem++;
            if (datasAgrupadas[key].exemplos.length < 3) {
                datasAgrupadas[key].exemplos.push(info.index);
            }
        });
        
        // Mostrar todas as datas únicas
        const datasUnicas = Object.keys(datasAgrupadas).sort();
        console.log(`Datas únicas encontradas (${datasUnicas.length}):`);
        
        datasUnicas.forEach(data => {
            const info = datasAgrupadas[data];
            console.log(`  - Valor: "${data}" | Tipo: ${info.tipo} | Registros: ${info.contagem}`);
        });
        
        // Verificar datas mais recentes
        const datasNumericas = datasUnicas.filter(d => !isNaN(parseFloat(d)));
        if (datasNumericas.length > 0) {
            const maxData = Math.max(...datasNumericas.map(d => parseFloat(d)));
            const minData = Math.min(...datasNumericas.map(d => parseFloat(d)));
            
            console.log(`Data mínima (serial): ${minData}`);
            console.log(`Data máxima (serial): ${maxData}`);
            
            // Converter para data legível
            const dataMin = new Date(Math.round((minData - 25569) * 86400 * 1000));
            const dataMax = new Date(Math.round((maxData - 25569) * 86400 * 1000));
            
            console.log(`Data mínima (legível): ${dataMin.toLocaleDateString('pt-BR')}`);
            console.log(`Data máxima (legível): ${dataMax.toLocaleDateString('pt-BR')}`);
        }
        
        console.log('========================================');
    }

    /**
     * Valida se todas as abas necessárias estão presentes
     */
    validateSheets() {
        const missingSheets = REQUIRED_SHEETS.filter(sheet => !this.sheetsData[sheet]);
        
        if (missingSheets.length > 0) {
            console.error('Abas ausentes:', missingSheets);
            throw new Error(`Abas ausentes: ${missingSheets.join(', ')}`);
        }
        
        console.log('Todas as abas necessárias estão presentes!');
    }

    /**
     * Atualiza o indicador de última atualização
     */
    updateLastUpdate() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        const timeStr = now.toLocaleTimeString('pt-BR');
        const element = document.getElementById('lastUpdate');
        
        if (element) {
            element.innerHTML = 
                `<i class="fas fa-clock"></i><span>Última atualização: ${dateStr} ${timeStr}</span>`;
        }
        
        console.log(`Última atualização registrada: ${dateStr} ${timeStr}`);
    }

    /**
     * Mostra/oculta a barra de progresso
     */
    showProgress(show) {
        const progressContainer = document.getElementById('progressContainer');
        
        if (!progressContainer) return;
        
        if (show) {
            progressContainer.style.display = 'block';
            document.getElementById('progressFill').style.width = '0%';
            document.getElementById('progressText').textContent = 'Carregando dados...';
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                if (progress <= 100) {
                    document.getElementById('progressFill').style.width = progress + '%';
                }
                if (progress >= 100) {
                    clearInterval(interval);
                    document.getElementById('progressText').textContent = 'Dados carregados com sucesso!';
                }
            }, 200);
        } else {
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 1000);
        }
    }

    /**
     * Mostra mensagem de erro
     */
    showError(message) {
        console.error('Erro:', message);
        alert('Erro: ' + message);
    }

    /**
     * Recarrega os dados
     */
    async reload() {
        console.log('========================================');
        console.log('RECARREGANDO DADOS...');
        console.log('========================================');
        
        this.sheetsData = {};
        return await this.loadExcelFile();
    }
}

// Exportar classe
window.DataLoader = DataLoader;