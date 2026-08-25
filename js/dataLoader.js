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
            
            console.log('Carregando arquivo:', filePath);
            
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
            
            this.loadAllSheets();
            this.validateSheets();
            
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
            
            // Animar progresso
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
