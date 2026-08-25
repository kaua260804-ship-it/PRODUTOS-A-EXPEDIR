/**
 * Inicialização e orquestração da aplicação
 */

class App {
    constructor() {
        this.dataLoader = null;
        this.dataProcessor = null;
        this.filters = null;
        this.table = null;
        this.cards = null;
        this.export = null;
        this.comparativo = null;
    }

    /**
     * Inicializa a aplicação
     */
    async init() {
        console.log('Inicializando aplicação...');
        
        // Mostrar loading
        this.showLoading(true);
        
        try {
            // Carregar dados
            this.dataLoader = new DataLoader();
            const sheetsData = await this.dataLoader.loadExcelFile();
            
            // Processar dados
            this.dataProcessor = new DataProcessor(sheetsData);
            const processedData = this.dataProcessor.process();
            
            console.log('Dados processados:', processedData.length, 'registros');
            
            // Inicializar tabela primeiro
            this.table = new Table(this.dataProcessor);
            
            // Inicializar cards
            this.cards = new Cards(this.dataProcessor);
            
            // Inicializar filtros (depois da tabela)
            this.filters = new Filters(this.dataProcessor);
            
            // Inicializar exportação
            this.export = new Export(this.table);
            
            // Inicializar comparativo
            this.comparativo = new Comparativo(this.dataProcessor);
            
            // Definir dados iniciais
            this.table.setData(processedData);
            this.cards.setInitialData(processedData);
            
            // Aplicar filtros iniciais
            this.filters.applyFilters();
            
            // Configurar botão de recarregar
            this.setupReloadButton();
            
            // Tornar a app acessível globalmente para paginação
            window.app = this;
            
            console.log('Aplicação inicializada com sucesso!');
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Configura o botão de recarregar
     */
    setupReloadButton() {
        document.getElementById('btnReload').addEventListener('click', async () => {
            if (confirm('Deseja recarregar os dados?')) {
                await this.init();
            }
        });
    }

    /**
     * Mostra/oculta loading
     */
    showLoading(show) {
        if (show) {
            document.body.style.cursor = 'wait';
        } else {
            document.body.style.cursor = 'default';
        }
    }

    /**
     * Mostra erro
     */
    showError(message) {
        const errorMessage = `
            <div style="
                background-color: #f8d7da;
                color: #721c24;
                padding: 20px;
                border-radius: 8px;
                margin: 20px;
                text-align: center;
            ">
                <h3>Erro ao carregar dados</h3>
                <p>${message}</p>
                <button onclick="window.location.reload()" style="
                    background-color: #721c24;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                ">
                    Tentar novamente
                </button>
            </div>
        `;
        
        document.querySelector('.main-content').innerHTML = errorMessage;
    }
}

// Inicializar quando o DOM estiver pronto
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    app.init();
});

// Exportar para debug
window.App = App;