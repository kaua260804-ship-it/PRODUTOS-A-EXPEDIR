/**
 * Gerencia o comparativo entre datas
 */

class Comparativo {
    constructor(dataProcessor) {
        this.dataProcessor = dataProcessor;
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
    }

    /**
     * Abre o modal de comparativo
     */
    openModal() {
        const modal = document.getElementById('comparativoModal');
        modal.style.display = 'block';
        
        // Popular as datas disponíveis
        this.popularDatas();
        
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
     * Popula os selects de datas
     */
    popularDatas() {
        const datas = this.dataProcessor.getUniqueValues('DATA');
        const dataBase = document.getElementById('dataBase');
        const dataComparacao = document.getElementById('dataComparacao');
        
        // Preservar valores atuais
        const currentBase = dataBase.value;
        const currentComparacao = dataComparacao.value;
        
        // Limpar e popular
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
        
        // Restaurar valores
        dataBase.value = currentBase;
        dataComparacao.value = currentComparacao;
    }

    /**
     * Converte data para objeto Date
     */
    parseDate(dataStr) {
        // Se for número serial do Excel
        if (typeof dataStr === 'number' || !isNaN(dataStr)) {
            const numData = parseFloat(dataStr);
            if (numData > 40000 && numData < 60000) {
                return new Date(Math.round((numData - 25569) * 86400 * 1000));
            }
        }
        
        // Tentar diferentes formatos
        const formats = [
            dataStr,
            dataStr?.replace(/\//g, '-'),
            dataStr?.split('/').reverse().join('-')
        ];
        
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
     * Gera o comparativo entre duas datas
     */
    gerarComparativo() {
        const dataBase = document.getElementById('dataBase').value;
        const dataComparacao = document.getElementById('dataComparacao').value;
        
        if (!dataBase || !dataComparacao) {
            alert('Por favor, selecione as duas datas para comparação');
            return;
        }
        
        // Filtrar dados por data
        const dadosBase = this.dataProcessor.processedData.filter(row => 
            row['DATA']?.toString() === dataBase.toString()
        );
        
        const dadosComparacao = this.dataProcessor.processedData.filter(row => 
            row['DATA']?.toString() === dataComparacao.toString()
        );
        
        if (dadosBase.length === 0) {
            alert('Não há dados para a data base selecionada');
            return;
        }
        
        if (dadosComparacao.length === 0) {
            alert('Não há dados para a data de comparação selecionada');
            return;
        }
        
        // Calcular estatísticas
        const statsBase = this.calcularEstatisticas(dadosBase);
        const statsComparacao = this.calcularEstatisticas(dadosComparacao);
        
        // Gerar resultado
        this.exibirResultado(statsBase, statsComparacao, dataBase, dataComparacao);
    }

    /**
     * Calcula estatísticas para uma data
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
     * Exibe o resultado do comparativo
     */
    exibirResultado(statsBase, statsComparacao, dataBase, dataComparacao) {
        const container = document.getElementById('comparativoResultado');
        container.style.display = 'block';
        
        const dataBaseFormatada = this.formatDateDisplay(dataBase);
        const dataComparacaoFormatada = this.formatDateDisplay(dataComparacao);
        
        // Calcular diferenças
        const diffCortados = statsBase.percentualCortados - statsComparacao.percentualCortados;
        const diffAbertos = statsBase.percentualAbertos - statsComparacao.percentualAbertos;
        const diffAtendidos = statsBase.percentualAtendidos - statsComparacao.percentualAtendidos;
        
        // Determinar indicadores
        const indicadorCortados = this.determinarIndicador(diffCortados, false); // Aumento de corte é ruim
        const indicadorAbertos = this.determinarIndicador(diffAbertos, false); // Aumento de aberto é ruim
        const indicadorAtendidos = this.determinarIndicador(diffAtendidos, true); // Aumento de atendido é bom
        
        container.innerHTML = `
            <div class="comparativo-header">
                <h3>
                    <i class="fas fa-calendar-check"></i>
                    Comparativo: ${dataBaseFormatada} vs ${dataComparacaoFormatada}
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
                    de ${Math.abs(diffCortados).toFixed(1)}% em relação ao dia anterior.
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
                    de ${Math.abs(diffAbertos).toFixed(1)}% em relação ao dia anterior.
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
                    de ${Math.abs(diffAtendidos).toFixed(1)}% em relação ao dia anterior.
                    <span class="indicador ${indicadorAtendidos.tipo}">${indicadorAtendidos.icone}</span>
                </div>
            </div>
            
            <div class="comparativo-footer">
                <div class="total-info">
                    <span>Total de Itens Pedidos: <strong>${statsBase.totalItens.toLocaleString('pt-BR')}</strong></span>
                    <span class="comparativo-data">
                        Data Base: <strong>${dataBaseFormatada}</strong>
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * Determina o indicador (aumento/redução e se é bom ou ruim)
     */
    determinarIndicador(diferenca, aumentoEhBom) {
        const absDiff = Math.abs(diferenca);
        
        if (diferenca > 0) {
            // Aumento
            if (aumentoEhBom) {
                return {
                    texto: 'AUMENTO',
                    tipo: 'bom',
                    icone: '✅'
                };
            } else {
                return {
                    texto: 'AUMENTO',
                    tipo: 'ruim',
                    icone: '❌'
                };
            }
        } else if (diferenca < 0) {
            // Redução
            if (aumentoEhBom) {
                return {
                    texto: 'REDUÇÃO',
                    tipo: 'ruim',
                    icone: '❌'
                };
            } else {
                return {
                    texto: 'REDUÇÃO',
                    tipo: 'bom',
                    icone: '✅'
                };
            }
        } else {
            // Sem mudança
            return {
                texto: 'MANUTENÇÃO',
                tipo: 'neutro',
                icone: '➡️'
            };
        }
    }
}

// Exportar classe
window.Comparativo = Comparativo;