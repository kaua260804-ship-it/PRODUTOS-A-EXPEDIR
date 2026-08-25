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
     * Carrega o arquivo Excel com cache busting agressivo
     */
    async loadExcelFile() {
        try {
            this.isLoading = true;
            this.showProgress(true);
            
            // Gerar timestamp único para cada carregamento
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            const filePath = `${CONFIG.EXCEL_FILE_PATH}?t=${timestamp}&r=${random}`;
            
            console.log('Carregando arquivo:', filePath);
            
            // Usar fetch com headers anti-cache
            const response = await fetch(filePath, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Arquivo não encontrado: ${CONFIG.EXCEL_FILE_PATH}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            this.workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            this.loadAllSheets();
            this.validateSheets();
            this.validateColumns();
            
            this.updateLastUpdate();
            this.showProgress(false);
            
            return this.sheetsData;
        } catch (error) {
            console.error('Erro ao carregar arquivo Excel:', error);
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
        REQUIRED_SHEETS.forEach(sheetName => {
            if (this.workbook.SheetNames.includes(sheetName)) {
                const worksheet = this.workbook.Sheets[sheetName];
                this.sheetsData[sheetName] = XLSX.utils.sheet_to_json(worksheet);
                console.log(`Aba ${sheetName} carregada: ${this.sheetsData[sheetName].length} registros`);
            } else {
                console.warn(`Aba ${sheetName} não encontrada no arquivo`);
            }
        });
    }

    /**
     * Valida se todas as abas necessárias estão presentes
     */
    validateSheets() {
        const missingSheets = REQUIRED_SHEETS.filter(sheet => !this.sheetsData[sheet]);
        
        if (missingSheets.length > 0) {
            throw new Error(`Abas ausentes: ${missingSheets.join(', ')}`);
        }
    }

    /**
     * Valida se as colunas necessárias existem
     */
    validateColumns() {
        const warnings = [];
        
        // Verificar colunas da aba GERAL
        const geralData = this.sheetsData[CONFIG.SHEETS.GERAL] || [];
        if (geralData.length > 0) {
            const geralColumns = Object.keys(geralData[0]);
            const requiredGeral = ['NRO DO PEDIDO', 'CODIGO', 'EMPRESA', 'DATA'];
            
            requiredGeral.forEach(col => {
                if (!geralColumns.includes(col)) {
                    warnings.push(`Coluna "${col}" não encontrada na aba GERAL`);
                }
            });
        }
        
        // Verificar colunas da aba CORTE
        const corteData = this.sheetsData[CONFIG.SHEETS.CORTE] || [];
        if (corteData.length > 0) {
            const corteColumns = Object.keys(corteData[0]);
            console.log('Colunas disponíveis na aba CORTE:', corteColumns);
            
            // Verificar se tem CAD ou as colunas para criar
            const hasCAD = corteColumns.includes('CAD');
            const hasNroPedido = corteColumns.includes('NRO DO PEDIDO');
            const hasCodigo = corteColumns.includes('CODIGO');
            const hasEmpresa = corteColumns.includes('EMPRESA');
            
            if (!hasCAD && !(hasNroPedido && hasCodigo && hasEmpresa)) {
                warnings.push('Aba CORTE não tem coluna CAD nem as colunas NRO DO PEDIDO, CODIGO, EMPRESA');
            }
        }
        
        // Verificar colunas da aba ABERTO
        const abertoData = this.sheetsData[CONFIG.SHEETS.ABERTO] || [];
        if (abertoData.length > 0) {
            const abertoColumns = Object.keys(abertoData[0]);
            console.log('Colunas disponíveis na aba ABERTO:', abertoColumns);
            
            const hasCAD = abertoColumns.includes('CAD');
            const hasNroPedido = abertoColumns.includes('NRO DO PEDIDO');
            const hasCodigo = abertoColumns.includes('CODIGO');
            const hasEmpresa = abertoColumns.includes('EMPRESA');
            
            if (!hasCAD && !(hasNroPedido && hasCodigo && hasEmpresa)) {
                warnings.push('Aba ABERTO não tem coluna CAD nem as colunas NRO DO PEDIDO, CODIGO, EMPRESA');
            }
        }
        
        if (warnings.length > 0) {
            console.warn('Avisos de validação:', warnings);
        }
    }

    /**
     * Atualiza o indicador de última atualização
     */
    updateLastUpdate() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        const timeStr = now.toLocaleTimeString('pt-BR');
        document.getElementById('lastUpdate').innerHTML = 
            `<i class="fas fa-clock"></i><span>Última atualização: ${dateStr} ${timeStr}</span>`;
    }

    /**
     * Mostra/oculta a barra de progresso
     */
    showProgress(show) {
        const progressContainer = document.getElementById('progressContainer');
        
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
        console.error(message);
        alert('Erro: ' + message);
    }

    /**
     * Recarrega os dados
     */
    async reload() {
        this.sheetsData = {};
        return await this.loadExcelFile();
    }
}

// Exportar classe
window.DataLoader = DataLoader;
