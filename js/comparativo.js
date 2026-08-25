/**
 * Gerencia o comparativo entre datas ou meses
 */

class Comparativo {
    constructor(dataProcessor) {
        this.dataProcessor = dataProcessor;
        this.tipoComparativo = 'dia';
        this.filtrosComparativo = {
            categoria: '',
            grupo: '',
            subgrupo: ''
        };
        this.initializeEventListeners();
    }

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
        
        document.getElementById('btnTipoDia').addEventListener('click', () => {
            this.tipoComparativo = 'dia';
            document.getElementById('btnTipoDia').classList.add('active');
            document.getElementById('btnTipoMes').classList.remove('active');
            this.atualizarLabels();
            this.atualizarSelectores();
        });
        
        document.getElementById('btnTipoMes').addEventListener('click', () => {
            this.tipoComparativo = 'mes';
            document.getElementById('btnTipoMes').classList.add('active');
            document.getElementById('btnTipoDia').classList.remove('active');
            this.atualizarLabels();
            this.atualizarSelectores();
        });
        
        document.getElementById('comparativoCategoria').addEventListener('change', (e) => {
            this.filtrosComparativo.categoria = e.target.value;
        });
        
        document.getElementById('comparativoGrupo').addEventListener('change', (e) => {
            this.filtrosComparativo.grupo = e.target.value;
        });
        
        document.getElementById('comparativoSubgrupo').addEventListener('change', (e) => {
            this.filtrosComparativo.subgrupo = e.target.value;
        });
    }

    openModal() {
        const modal = document.getElementById('comparativoModal');
        modal.style.display = 'flex';
        
        this.filtrosComparativo = {
            categoria: '',
            grupo: '',
            subgrupo: ''
        };
        
        this.popularFiltrosComparativo();
        this.atualizarSelectores();
        
        document.getElementById('comparativoResultado').style.display = 'none';
        document.getElementById('comparativoResultado').innerHTML = '';
    }

    closeModal() {
        const modal = document.getElementById('comparativoModal');
        modal.style.display = 'none';
    }

    atualizarLabels() {
        const labelBase = document.getElementById('labelDataBase');
        const labelComparacao = document.getElementById('labelDataComparacao');
        
        if (this.tipoComparativo === 'dia') {
            labelBase.textContent = 'Data Base:';
            labelComparacao.textContent = 'Data Comparação:';
        } else {
            labelBase.textContent = 'Mês Base:';
            labelComparacao.textContent = 'Mês Comparação:';
        }
    }

    atualizarSelectores() {
        if (this.tipoComparativo === 'dia') {
            this.popularDatas();
        } else {
            this.popularMeses();
        }
    }

    popularFiltrosComparativo() {
        const categorias = this.dataProcessor.getUniqueValues('CATEGORIA');
        this.popularSelect('comparativoCategoria', categorias, 'Todas');
        
        const grupos = this.dataProcessor.getUniqueValues('GRUPO');
        this.popularSelect('comparativoGrupo', grupos, 'Todos');
        
        const subgrupos = this.dataProcessor.getUniqueValues('SUBGRUPO');
        this.popularSelect('comparativoSubgrupo', subgrupos, 'Todos');
    }

    popularSelect(selectId, values, placeholder) {
        const select = document.getElementById(selectId);
        select.innerHTML = `<option value="">${placeholder}</option>`;
        
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    popularDatas() {
        const datas = this.dataProcessor.getUniqueValues('DATA');
        const dataBase = document.getElementById('dataBase');
        const dataComparacao = document.getElementById('dataComparacao');
        
        dataBase.innerHTML = '<option value="">Selecione a data base</option>';
        dataComparacao.innerHTML = '<option value="">Selecione a data de comparação</option>';
        
        const datasOrdenadas = datas.sort((a, b) => {
            const dateA = this.dataProcessor.parseDate(a);
            const dateB = this.dataProcessor.parseDate(b);
            return dateB - dateA;
        });
        
        datasOrdenadas.forEach(data => {
            const optionBase = document.createElement('option');
            optionBase.value = data;
            optionBase.textContent = this.dataProcessor.formatDateDisplay(data);
            dataBase.appendChild(optionBase);
            
            const optionComparacao = document.createElement('option');
            optionComparacao.value = data;
            optionComparacao.textContent = this.dataProcessor.formatDateDisplay(data);
            dataComparacao.appendChild(optionComparacao);
        });
    }

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

    getMesesDisponiveis() {
        const meses = new Set();
        
        this.dataProcessor.processedData.forEach(row => {
            const data = this.dataProcessor.parseDate(row['DATA']);
            if (data) {
                meses.add(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`);
            }
        });
        
        return Array.from(meses).sort().reverse();
    }

    formatMesDisplay(mes) {
        const [ano, mesNum] = mes.split('-');
        const nomesMeses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return `${nomesMeses[parseInt(mesNum) - 1]} ${ano}`;
    }

    aplicarFiltrosComparativo(dados) {
        return dados.filter(row => {
            if (this.filtrosComparativo.categoria && 
                row['CATEGORIA']?.toString() !== this.filtrosComparativo.categoria) {
                return false;
            }
            
            if (this.filtrosComparativo.grupo && 
                row['GRUPO']?.toString() !== this.filtrosComparativo.grupo) {
                return false;
            }
            
            if (this.filtrosComparativo.subgrupo && 
                row['SUBGRUPO']?.toString() !== this.filtrosComparativo.subgrupo) {
                return false;
            }
            
            return true;
        });
    }

    gerarComparativo() {
        const dataBase = document.getElementById('dataBase').value;
        const dataComparacao = document.getElementById('dataComparacao').value;
        
        if (!dataBase || !dataComparacao) {
            alert(`Por favor, selecione os dois períodos para comparação`);
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
            dadosBase = this.dataProcessor.processedData.filter(row => {
                const data = this.dataProcessor.parseDate(row['DATA']);
                return data && `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}` === dataBase;
            });
            
            dadosComparacao = this.dataProcessor.processedData.filter(row => {
                const data = this.dataProcessor.parseDate(row['DATA']);
                return data && `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}` === dataComparacao;
            });
        }
        
        dadosBase = this.aplicarFiltrosComparativo(dadosBase);
        dadosComparacao = this.aplicarFiltrosComparativo(dadosComparacao);
        
        if (dadosBase.length === 0) {
            alert(`Não há dados para o período base selecionado`);
            return;
        }
        
        if (dadosComparacao.length === 0) {
            alert(`Não há dados para o período de comparação selecionado`);
            return;
        }
        
        const statsBase = this.calcularEstatisticas(dadosBase);
        const statsComparacao = this.calcularEstatisticas(dadosComparacao);
        
        this.exibirResultado(statsBase, statsComparacao, dataBase, dataComparacao);
    }

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

    exibirResultado(statsBase, statsComparacao, dataBase, dataComparacao) {
        const container = document.getElementById('comparativoResultado');
        container.style.display = 'block';
        
        const periodoBase = this.tipoComparativo === 'dia' 
            ? this.dataProcessor.formatDateDisplay(dataBase)
            : this.formatMesDisplay(dataBase);
            
        const periodoComparacao = this.tipoComparativo === 'dia'
            ? this.dataProcessor.formatDateDisplay(dataComparacao)
            : this.formatMesDisplay(dataComparacao);
        
        const diffCortados = statsBase.percentualCortados - statsComparacao.percentualCortados;
        const diffAbertos = statsBase.percentualAbertos - statsComparacao.percentualAbertos;
        const diffAtendidos = statsBase.percentualAtendidos - statsComparacao.percentualAtendidos;
        
        const indCortados = this.determinarIndicador(diffCortados, false);
        const indAbertos = this.determinarIndicador(diffAbertos, false);
        const indAtendidos = this.determinarIndicador(diffAtendidos, true);
        
        container.innerHTML = `
            <!-- HEADER GRANDÃO -->
            <div class="comparativo-header-grande">
                <div class="comparativo-header-grande-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h2 class="comparativo-header-grande-title">
                    COMPARATIVO <span>${periodoBase}</span> <span class="vs">VS</span> <span>${periodoComparacao}</span>
                </h2>
                <div class="comparativo-header-grande-total">
                    <i class="fas fa-boxes"></i>
                    <span>TOTAL DE ITENS PEDIDOS: <strong>${statsBase.totalItens.toLocaleString('pt-BR')}</strong></span>
                </div>
            </div>

            <!-- CARDS GRANDES -->
            <div class="comparativo-grid-grande">
                <!-- Card Cortados -->
                <div class="comparativo-card-grande ${indCortados.tipo}">
                    <div class="comparativo-card-grande-header">
                        <div class="comparativo-card-grande-icon">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <div class="comparativo-card-grande-label">ITENS CORTADOS</div>
                    </div>
                    <div class="comparativo-card-grande-body">
                        <div class="comparativo-card-grande-number">
                            ${statsBase.itensCortados.toLocaleString('pt-BR')}
                        </div>
                        <div class="comparativo-card-grande-percent">
                            ${statsBase.percentualCortados.toFixed(1)}%
                        </div>
                    </div>
                    <div class="comparativo-card-grande-footer ${indCortados.tipo}">
                        <span class="diff-icon">${indCortados.icone}</span>
                        <span><strong>${indCortados.texto}</strong> de ${Math.abs(diffCortados).toFixed(1)}%</span>
                        <span class="diff-label">em relação ao dia anterior</span>
                    </div>
                </div>

                <!-- Card Em Aberto -->
                <div class="comparativo-card-grande ${indAbertos.tipo}">
                    <div class="comparativo-card-grande-header">
                        <div class="comparativo-card-grande-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="comparativo-card-grande-label">ITENS EM ABERTO</div>
                    </div>
                    <div class="comparativo-card-grande-body">
                        <div class="comparativo-card-grande-number">
                            ${statsBase.itensAbertos.toLocaleString('pt-BR')}
                        </div>
                        <div class="comparativo-card-grande-percent">
                            ${statsBase.percentualAbertos.toFixed(1)}%
                        </div>
                    </div>
                    <div class="comparativo-card-grande-footer ${indAbertos.tipo}">
                        <span class="diff-icon">${indAbertos.icone}</span>
                        <span><strong>${indAbertos.texto}</strong> de ${Math.abs(diffAbertos).toFixed(1)}%</span>
                        <span class="diff-label">em relação ao dia anterior</span>
                    </div>
                </div>

                <!-- Card Atendidos -->
                <div class="comparativo-card-grande ${indAtendidos.tipo}">
                    <div class="comparativo-card-grande-header">
                        <div class="comparativo-card-grande-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="comparativo-card-grande-label">ITENS ATENDIDOS</div>
                    </div>
                    <div class="comparativo-card-grande-body">
                        <div class="comparativo-card-grande-number">
                            ${statsBase.itensAtendidos.toLocaleString('pt-BR')}
                        </div>
                        <div class="comparativo-card-grande-percent">
                            ${statsBase.percentualAtendidos.toFixed(1)}%
                        </div>
                    </div>
                    <div class="comparativo-card-grande-footer ${indAtendidos.tipo}">
                        <span class="diff-icon">${indAtendidos.icone}</span>
                        <span><strong>${indAtendidos.texto}</strong> de ${Math.abs(diffAtendidos).toFixed(1)}%</span>
                        <span class="diff-label">em relação ao dia anterior</span>
                    </div>
                </div>
            </div>
        `;
        
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    determinarIndicador(diferenca, aumentoEhBom) {
        if (diferenca > 0) {
            if (aumentoEhBom) {
                return { texto: 'AUMENTO', tipo: 'bom', icone: '📈' };
            } else {
                return { texto: 'AUMENTO', tipo: 'ruim', icone: '📈' };
            }
        } else if (diferenca < 0) {
            if (aumentoEhBom) {
                return { texto: 'REDUÇÃO', tipo: 'ruim', icone: '📉' };
            } else {
                return { texto: 'REDUÇÃO', tipo: 'bom', icone: '📉' };
            }
        } else {
            return { texto: 'MANUTENÇÃO', tipo: 'neutro', icone: '➡️' };
        }
    }
}

// Exportar classe
window.Comparativo = Comparativo;