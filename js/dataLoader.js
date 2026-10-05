/**
 * Carrega os dados do arquivo Excel
 */

class DataLoader {
    constructor() {
        this.workbook = null;
        this.workbookTipos = null;
        this.sheetsData = {};
        this.tiposData = {};
        this.isLoading = false;
    }

    /**
     * Carrega o arquivo Excel principal com cache busting
     */
    async loadExcelFile() {
        try {
            this.isLoading = true;
            this.showProgress(true);
            
            const timestamp = new Date().getTime();
            const filePath = `${CONFIG.EXCEL_FILE_PATH}?t=${timestamp}`;
            
            console.log('========================================');
            console.log('CARREGANDO ARQUIVO EXCEL PRINCIPAL');
            console.log('========================================');
            console.log('Caminho:', CONFIG.EXCEL_FILE_PATH);
            
            const response = await fetch(filePath, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Arquivo não encontrado: ${CONFIG.EXCEL_FILE_PATH}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            this.workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            console.log('Abas encontradas:', this.workbook.SheetNames);
            
            this.loadAllSheets();
            this.validateSheets();
            
            // Carregar arquivo de TIPOS (opcional)
            await this.loadTiposFile();
            
            this.updateLastUpdate();
            this.showProgress(false);
            
            return this.sheetsData;
        } catch (error) {
            console.error('ERRO AO CARREGAR ARQUIVO:', error);
            this.showProgress(false);
            this.showError(error.message);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Carrega o arquivo de TIPOS (opcional - não quebra se não existir)
     */
    async loadTiposFile() {
        try {
            const timestamp = new Date().getTime();
            const filePath = `${CONFIG.EXCEL_TIPOS_PATH}?t=${timestamp}`;
            
            console.log('========================================');
            console.log('CARREGANDO ARQUIVO DE TIPOS');
            console.log('========================================');
            console.log('Caminho:', CONFIG.EXCEL_TIPOS_PATH);
            
            const response = await fetch(filePath, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            if (!response.ok) {
                console.warn('Arquivo de TIPOS não encontrado. O filtro por tipo não estará disponível.');
                this.tiposData = [];
                return;
            }
            
            const arrayBuffer = await response.arrayBuffer();
            this.workbookTipos = XLSX.read(arrayBuffer, { type: 'array' });
            
            console.log('Abas do arquivo de tipos:', this.workbookTipos.SheetNames);
            
            // Tentar carregar a aba TIPOS, ou usar a primeira aba disponível
            let sheetName = this.workbookTipos.SheetNames.includes(CONFIG.SHEETS.TIPOS) 
                ? CONFIG.SHEETS.TIPOS 
                : this.workbookTipos.SheetNames[0];
            
            if (sheetName) {
                const worksheet = this.workbookTipos.Sheets[sheetName];
                this.tiposData = XLSX.utils.sheet_to_json(worksheet);
                console.log(`Aba "${sheetName}" carregada: ${this.tiposData.length} registros`);
                
                if (this.tiposData.length > 0) {
                    console.log('Colunas:', Object.keys(this.tiposData[0]));
                    console.log('Primeiros registros:', this.tiposData.slice(0, 3));
                }
            }
        } catch (error) {
            console.warn('Erro ao carregar arquivo de TIPOS:', error.message);
            this.tiposData = [];
        }
    }

    /**
     * Carrega todas as abas do arquivo principal
     */
    loadAllSheets() {
        REQUIRED_SHEETS.forEach(sheetName => {
            if (this.workbook.SheetNames.includes(sheetName)) {
                const worksheet = this.workbook.Sheets[sheetName];
                this.sheetsData[sheetName] = XLSX.utils.sheet_to_json(worksheet);
                console.log(`Aba "${sheetName}": ${this.sheetsData[sheetName].length} registros`);
            } else {
                console.warn(`Aba "${sheetName}" NÃO encontrada`);
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
     * Retorna os dados de tipos carregados
     */
    getTiposData() {
        return this.tiposData || [];
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
        this.sheetsData = {};
        this.tiposData = {};
        return await this.loadExcelFile();
    }
}

// Exportar classe
window.DataLoader = DataLoader;
