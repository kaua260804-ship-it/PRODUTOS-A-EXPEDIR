/**
 * Gerencia o comparativo entre datas ou meses
 */

class Comparativo {
    constructor(dataProcessor) {
        this.dataProcessor = dataProcessor;
        this.tipoComparativo = 'dia'; // 'dia' ou 'mes'
        this.initializeEventListeners();
    }

    /**
     * Inicializa os event listeners
     */
    initializeEventListeners() {
        document.getElementById('btnResumo').addEventListener('click', () => {
            this.openModal();
        });
        
        document.getElementById('btnCloseModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('modalOverlay').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('btnGerarComparativo').addEventListener('click', () => {
            this.gerarComparativo();
        });
        
        // Event listeners para os botões de tipo
        document.querySelectorAll('.comparativo-tipo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.tipoComparativo = btn.dataset.tipo;
                document.querySelectorAll('.comparativo-tipo-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.atualizarSelectores();
            });
        });
    }

    /**
     * Abre o modal de comparativo
     */
    openModal() {
        const modal = document.getElementById('comparativoModal');
        modal.style.display = 'flex';
        
        // Popular as datas disponíveis
        this.atualizarSelectores();
        
        // Limpar resultado anterior
        document.getElementById('comparativoResultado').style.display = 'none';
        document.getElementById('comparativoResultado').innerHTML = '';
    }

    /**
     * Fecha o modal de comparativo
     */
    closeModal() {
        const modal = document.getElementById('comparativoModal');
        modal.style.display = 'none';
    }

    /**
     * Atualiza os selectores baseado no tipo
     */
    atualizarSelectores() {
        if (this.tipoComparativo === 'dia') {
            this.popularDatas();
        } else {
            this.popularMeses();
        }
    }

    /**
     * Popula os selects de datas
     */
    popularDatas() {
        const datas = this.dataProcessor.getUniqueValues('DATA');
        const dataBase = document.getElementById('dataBase');
        const dataComparacao = document.getElementById('dataComparacao');
        
        dataBase.innerHTML = '<option value="">Selecione a data base</option>';
        dataComparacao.innerHTML = '<option value="">Selecione a data de comparação</option>';
        
        // Ordenar datas (mais recente primeiro)
        const datasOrdenadas = datas.sort((a, b) => {
            const dateA = this.parseDate(a);
            const dateB = this.parseDate(b);
            return dateB - dateA;
        });
        
        datasOrdenadas.forEach(data => {
            const optionBase = document.createElement('option');
            optionBase.value = data;
            optionBase.textContent = this.formatDateDisplay(data);
            dataBase.appendChild(optionBase);
            
            const optionComparacao = document.createElement('option');
            optionComparacao.value = data;
            optionComparacao.textContent = this.formatDateDisplay(data);
            dataComparacao.appendChild(optionComparacao);
        });
    }

    /**
     * Popula os selects de meses
     */
    popularMeses() {
        const meses = this.getMesesDisponiveis();
        const dataBase = document.getElementById('dataBase');
        const dataComparacao = document.getElementById('dataComparacao');
        
        dataBase.innerHTML = '<option value="">Selecione o mês base</option>';
        dataComparacao.innerHTML = '<option value="">Selecione o mês de comparação</option>';
        
        meses.forEach(mes => {
            const optionBase = document.createElement('option');
            optionBase.value = mes;
            optionBase.textContent = this.formatMesDisplay(mes);
            dataBase.appendChild(optionBase);
            
            const optionComparacao = document.createElement('option');
            optionComparacao.value = mes;
            optionComparacao.textContent = this.formatMesDisplay(mes);
            dataComparacao.appendChild(optionComparacao);
        });
    }

    /**
     * Obtém meses disponíveis
     */
    getMesesDisponiveis() {
        const meses = new Set();
        
        this.dataProcessor.processedData.forEach(row => {
            const data = this.parseDate(row['DATA']);
            if (data) {
                meses.add(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`);
            }
        });
        
        return Array.from(meses).sort().reverse();
    }

    /**
     * Formata mês para exibição
     */
    formatMesDisplay(mes) {
        const [ano, mesNum] = mes.split('-');
        const nomesMeses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return `${nomesMeses[parseInt(mesNum) - 1]} ${ano}`;
    }

    /**
     * Converte data para objeto Date
     */
    parseDate(dataStr) {
        if (typeof dataStr === 'number' || !isNaN(dataStr)) {
            const numData = parseFloat(dataStr);
            if (numData > 40000 && numData < 60000) {
                return new Date(Math.round((numData - 25569) * 86400 * 1000));
            }
        }
        
        const formats = [dataStr, dataStr?.replace(/\//g, '-')];
        
        for (const format of formats) {
            const date = new Date(format);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        
        return null;
    }

    /**
     * Formata data para exibição
     */
    formatDateDisplay(dataStr) {
        const date = this.parseDate(dataStr);
        if (date) {
            return date.toLocaleDateString('pt-BR');
        }
        return dataStr;
    }

    /**
     * Gera o comparativo
     */
    gerarComparativo() {
        const dataBase = document.getElementById('dataBase').value;
        const dataComparacao = document.getElementById('dataComparacao').value;
        
        if (!dataBase || !dataComparacao) {
            alert(`Por favor, selecione os dois ${this.tipoComparativo === 'dia' ? 'datas' : 'meses'} para comparação`);
            return;
        }
        
        let dadosBase, dadosComparacao;
        
        if (this.tipoComparativo === 'dia') {
            dadosBase = this.dataProcessor.processedData.filter(row => 
                row['DATA']?.toString() === dataBase.toString()
            );
            
            dadosComparacao = this.dataProcessor.processedData.filter(row => 
                row['DATA']?.toString() === dataComparacao.toString()
            );
        } else {
            // Filtrar por mês
            dadosBase = this.dataProcessor.processedData.filter(row => {
                const data = this.parseDate(row['DATA']);
                return data && `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}` === dataBase;
            });
            
            dadosComparacao = this.dataProcessor.processedData.filter(row => {
                const data = this.parseDate(row['DATA']);
                return data && `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}` === dataComparacao;
            });
        }
        
        if (dadosBase.length === 0) {
            alert(`Não há dados para o ${this.tipoComparativo === 'dia' ? 'dia' : 'mês'} base selecionado`);
            return;
        }
        
        if (dadosComparacao.length === 0) {
            alert(`Não há dados para o ${this.tipoComparativo === 'dia' ? 'dia' : 'mês'} de comparação selecionado`);
            return;
        }
        
        const statsBase = this.calcularEstatisticas(dadosBase);
        const statsComparacao = this.calcularEstatisticas(dadosComparacao);
        
        this.exibirResultado(statsBase, statsComparacao, dataBase, dataComparacao);
    }

    /**
     * Calcula estatísticas
     */
    calcularEstatisticas(dados) {
        const totalItens = dados.length;
        const itensCortados = dados.filter(row => row['STATUS'] === 'CORTE').length;
        const itensAbertos = dados.filter(row => row['STATUS'] === 'ABERTO').length;
        const itensAtendidos = dados.filter(row => row['STATUS'] === 'EXPEDIDO').length;
        
        return {
            totalItens,
            itensCortados,
            itensAbertos,
            itensAtendidos,
            percentualCortados: totalItens > 0 ? (itensCortados / totalItens) * 100 : 0,
            percentualAbertos: totalItens > 0 ? (itensAbertos / totalItens) * 100 : 0,
            percentualAtendidos: totalItens > 0 ? (itensAtendidos / totalItens) * 100 : 0
        };
    }

    /**
     * Exibe o resultado
     */
    exibirResultado(statsBase, statsComparacao, dataBase, dataComparacao) {
        const container = document.getElementById('comparativoResultado');
        container.style.display = 'block';
        
        const periodoBase = this.tipoComparativo === 'dia' 
            ? this.formatDateDisplay(dataBase)
            : this.formatMesDisplay(dataBase);
            
        const periodoComparacao = this.tipoComparativo === 'dia'
            ? this.formatDateDisplay(dataComparacao)
            : this.formatMesDisplay(dataComparacao);
        
        const diffCortados = statsBase.percentualCortados - statsComparacao.percentualCortados;
        const diffAbertos = statsBase.percentualAbertos - statsComparacao.percentualAbertos;
        const diffAtendidos = statsBase.percentualAtendidos - statsComparacao.percentualAtendidos;
        
        const indicadorCortados = this.determinarIndicador(diffCortados, false);
        const indicadorAbertos = this.determinarIndicador(diffAbertos, false);
        const indicadorAtendidos = this.determinarIndicador(diffAtendidos, true);
        
        container.innerHTML = `
            <div class="comparativo-header">
                <h3>
                    <i class="fas fa-calendar-check"></i>
                    Comparativo: ${periodoBase} vs ${periodoComparacao}
                </h3>
            </div>
            
            <div class="comparativo-item ${indicadorCortados.tipo}">
                <div class="comparativo-item-header">
                    <div class="comparativo-item-title">
                        <i class="fas fa-times-circle"></i>
                        <span>ITENS CORTADOS:</span>
                    </div>
                    <div class="comparativo-item-values">
                        <span class="valor-principal">${statsBase.itensCortados}</span>
                        <span class="valor-percentual">equivalente a ${statsBase.percentualCortados.toFixed(1)}%</span>
                    </div>
                </div>
                <div class="comparativo-item-detail">
                    representando um 
                    <strong class="${indicadorCortados.tipo}">${indicadorCortados.texto}</strong> 
                    de ${Math.abs(diffCortados).toFixed(1)}% em relação ao período anterior.
                    <span class="indicador ${indicadorCortados.tipo}">${indicadorCortados.icone}</span>
                </div>
            </div>
            
            <div class="comparativo-item ${indicadorAbertos.tipo}">
                <div class="comparativo-item-header">
                    <div class="comparativo-item-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>ITENS EM ABERTO:</span>
                    </div>
                    <div class="comparativo-item-values">
                        <span class="valor-principal">${statsBase.itensAbertos}</span>
                        <span class="valor-percentual">equivalente a ${statsBase.percentualAbertos.toFixed(1)}%</span>
                    </div>
                </div>
                <div class="comparativo-item-detail">
                    representando uma 
                    <strong class="${indicadorAbertos.tipo}">${indicadorAbertos.texto}</strong> 
                    de ${Math.abs(diffAbertos).toFixed(1)}% em relação ao período anterior.
                    <span class="indicador ${indicadorAbertos.tipo}">${indicadorAbertos.icone}</span>
                </div>
            </div>
            
            <div class="comparativo-item ${indicadorAtendidos.tipo}">
                <div class="comparativo-item-header">
                    <div class="comparativo-item-title">
                        <i class="fas fa-check-circle"></i>
                        <span>ITENS ATENDIDOS:</span>
                    </div>
                    <div class="comparativo-item-values">
                        <span class="valor-principal">${statsBase.itensAtendidos}</span>
                        <span class="valor-percentual">equivalente a ${statsBase.percentualAtendidos.toFixed(1)}%</span>
                    </div>
                </div>
                <div class="comparativo-item-detail">
                    indicando uma 
                    <strong class="${indicadorAtendidos.tipo}">${indicadorAtendidos.texto}</strong> 
                    de ${Math.abs(diffAtendidos).toFixed(1)}% em relação ao período anterior.
                    <span class="indicador ${indicadorAtendidos.tipo}">${indicadorAtendidos.icone}</span>
                </div>
            </div>
            
            <div class="comparativo-footer">
                <div class="total-info">
                    <span>Total de Itens Pedidos: <strong>${statsBase.totalItens.toLocaleString('pt-BR')}</strong></span>
                    <span class="comparativo-data">
                        ${this.tipoComparativo === 'dia' ? 'Data Base' : 'Mês Base'}: <strong>${periodoBase}</strong>
                    </span>
                </div>
            </div>
        `;
        
        // Centralizar o modal
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.margin = 'auto';
        }
    }

    /**
     * Determina o indicador
     */
    determinarIndicador(diferenca, aumentoEhBom) {
        if (diferenca > 0) {
            if (aumentoEhBom) {
                return { texto: 'AUMENTO', tipo: 'bom', icone: '✅' };
            } else {
                return { texto: 'AUMENTO', tipo: 'ruim', icone: '❌' };
            }
        } else if (diferenca < 0) {
            if (aumentoEhBom) {
                return { texto: 'REDUÇÃO', tipo: 'ruim', icone: '❌' };
            } else {
                return { texto: 'REDUÇÃO', tipo: 'bom', icone: '✅' };
            }
        } else {
            return { texto: 'MANUTENÇÃO', tipo: 'neutro', icone: '➡️' };
        }
    }
}

// Exportar classe
window.Comparativo = Comparativo;
