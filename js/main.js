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
        console.log('========================================');
        console.log('INICIALIZANDO APLICAÇÃO');
        console.log('========================================');
        console.log('Data e hora:', new Date().toLocaleString('pt-BR'));
        console.log('Navegador:', navigator.userAgent);
        console.log('========================================');
        
        this.showLoading(true);
        
        try {
            // Carregar dados
            this.dataLoader = new DataLoader();
            const sheetsData = await this.dataLoader.loadExcelFile();
            
            // Processar dados
            this.dataProcessor = new DataProcessor(sheetsData);
            const processedData = this.dataProcessor.process();
            
            console.log('========================================');
            console.log('DADOS PROCESSADOS:');
            console.log('========================================');
            console.log('Total de registros:', processedData.length);
            
            // Verificar datas disponíveis
            const datas = this.dataProcessor.getUniqueValues('DATA');
            console.log('Datas disponíveis:', datas.length);
            
            if (datas.length > 0) {
                console.log('Primeira data:', datas[0]);
                console.log('Última data:', datas[datas.length - 1]);
            }
            console.log('========================================');
            
            // Inicializar componentes
            this.table = new Table(this.dataProcessor);
            this.cards = new Cards(this.dataProcessor);
            this.filters = new Filters(this.dataProcessor);
            this.export = new Export(this.table);
            this.comparativo = new Comparativo(this.dataProcessor);
            
            // Definir dados iniciais
            this.table.setData(processedData);
            this.cards.setInitialData(processedData);
            this.filters.applyFilters();
            
            // Configurar botão de recarregar
            this.setupReloadButton();
            
            // Tornar a app acessível globalmente
            window.app = this;
            
            console.log('========================================');
            console.log('APLICAÇÃO INICIALIZADA COM SUCESSO!');
            console.log('========================================');
        } catch (error) {
            console.error('========================================');
            console.error('ERRO NA INICIALIZAÇÃO:');
            console.error('========================================');
            console.error('Mensagem:', error.message);
            console.error('Stack:', error.stack);
            console.error('========================================');
            
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
            console.log('========================================');
            console.log('BOTÃO RECARREGAR CLICADO');
            console.log('========================================');
            
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
