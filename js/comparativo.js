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
        
        document.getElementById('btnGerarPeriodo').addEventListener('click', () => {
            this.gerarResumoPeriodo();
        });
        
        document.getElementById('btnTipoDia').addEventListener('click', () => {
            this.tipoComparativo = 'dia';
            this.atualizarBotoesTipo('btnTipoDia');
            this.atualizarLabels();
            this.atualizarSelectores();
        });
        
        document.getElementById('btnTipoMes').addEventListener('click', () => {
            this.tipoComparativo = 'mes';
            this.atualizarBotoesTipo('btnTipoMes');
            this.atualizarLabels();
            this.atualizarSelectores();
        });
        
        document.getElementById('btnTipoPeriodo').addEventListener('click', () => {
            this.tipoComparativo = 'periodo';
            this.atualizarBotoesTipo('btnTipoPeriodo');
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

    atualizarBotoesTipo(btnAtivoId) {
        ['btnTipoDia', 'btnTipoMes', 'btnTipoPeriodo'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                if (id === btnAtivoId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
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
        const selectorsComparativo = document.querySelector('.comparativo-selectors');
        const selectorsPeriodo = document.getElementById('comparativoSelectorsPeriodo');
        
        if (this.tipoComparativo === 'periodo') {
            if (selectorsComparativo) selectorsComparativo.style.display = 'none';
            if (selectorsPeriodo) selectorsPeriodo.style.display = 'grid';
            this.popularDatasPeriodo();
        } else {
            if (selectorsComparativo) selectorsComparativo.style.display = 'grid';
            if (selectorsPeriodo) selectorsPeriodo.style.display = 'none';
            
            if (this.tipoComparativo === 'dia') {
                this.popularDatas();
            } else {
                this.popularMeses();
            }
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
        if (!select) return;
        
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

    popularDatasPeriodo() {
        const datas = this.dataProcessor.getUniqueValues('DATA');
        const dataInicio = document.getElementById('dataInicioPeriodo');
        const dataFim = document.getElementById('dataFimPeriodo');
        
        if (!dataInicio || !dataFim) return;
        
        dataInicio.innerHTML = '<option value="">Selecione a data inicial</option>';
        dataFim.innerHTML = '<option value="">Selecione a data final</option>';
        
        // Ordenar datas da mais recente para a mais antiga
        const datasOrdenadas = datas.sort((a, b) => {
            const dateA = this.dataProcessor.parseDate(a);
            const dateB = this.dataProcessor.parseDate(b);
            return dateB - dateA;
        });
        
        datasOrdenadas.forEach(data => {
            const optionInicio = document.createElement('option');
            optionInicio.value = data;
            optionInicio.textContent = this.dataProcessor.formatDateDisplay(data);
            dataInicio.appendChild(optionInicio);
            
            const optionFim = document.createElement('option');
            optionFim.value = data;
            optionFim.textContent = this.dataProcessor.formatDateDisplay(data);
            dataFim.appendChild(optionFim);
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

    /**
     * NOVO: Gera resumo por período (dia a dia)
     */
    gerarResumoPeriodo() {
        const dataInicio = document.getElementById('dataInicioPeriodo').value;
        const dataFim = document.getElementById('dataFimPeriodo').value;
        
        if (!dataInicio || !dataFim) {
            alert('Por favor, selecione a data de início e a data de fim do período');
            return;
        }
        
        const dateInicio = this.dataProcessor.parseDate(dataInicio);
        const dateFim = this.dataProcessor.parseDate(dataFim);
        
        if (!dateInicio || !dateFim) {
            alert('Datas inválidas. Por favor, selecione novamente.');
            return;
        }
        
        if (dateInicio > dateFim) {
            alert('A data de início não pode ser maior que a data de fim');
            return;
        }
        
        // Coletar todos os dados do período
        let dadosPeriodo = this.dataProcessor.processedData.filter(row => {
            const data = this.dataProcessor.parseDate(row['DATA']);
            if (!data) return false;
            return data >= dateInicio && data <= dateFim;
        });
        
        dadosPeriodo = this.aplicarFiltrosComparativo(dadosPeriodo);
        
        if (dadosPeriodo.length === 0) {
            alert('Não há dados para o período selecionado');
            return;
        }
        
        // Agrupar dados por data
        const dadosPorData = this.agruparPorData(dadosPeriodo);
        
        // Calcular acumulado total do período
        const statsAcumulado = this.calcularEstatisticas(dadosPeriodo);
        
        // Exibir resultado
        this.exibirResumoPeriodo(statsAcumulado, dadosPorData, dataInicio, dataFim);
    }

    /**
     * Agrupa os dados por data
     */
    agruparPorData(dados) {
        const grupos = {};
        
        dados.forEach(row => {
            const dataStr = row['DATA']?.toString();
            if (!dataStr) return;
            
            if (!grupos[dataStr]) {
                grupos[dataStr] = [];
            }
            grupos[dataStr].push(row);
        });
        
        // Converter para array de objetos com estatísticas
        const resultado = Object.keys(grupos).map(dataStr => {
            const dadosDoDia = grupos[dataStr];
            const stats = this.calcularEstatisticas(dadosDoDia);
            const dataObj = this.dataProcessor.parseDate(dataStr);
            
            return {
                dataOriginal: dataStr,
                dataFormatada: this.dataProcessor.formatDateDisplay(dataStr),
                dataObj: dataObj,
                stats: stats
            };
        });
        
        // Ordenar por data (mais antiga primeiro para mostrar evolução)
        resultado.sort((a, b) => {
            if (a.dataObj && b.dataObj) {
                return a.dataObj.getTime() - b.dataObj.getTime();
            }
            return 0;
        });
        
        return resultado;
    }

    /**
     * Exibe o resumo do período com acumulado e tabela dia a dia
     */
    exibirResumoPeriodo(statsAcumulado, dadosPorData, dataInicio, dataFim) {
        const container = document.getElementById('comparativoResultado');
        container.style.display = 'block';
        
        const periodoInicio = this.dataProcessor.formatDateDisplay(dataInicio);
        const periodoFim = this.dataProcessor.formatDateDisplay(dataFim);
        
        // Construir linhas da tabela
        const linhasTabela = dadosPorData.map(dia => {
            const s = dia.stats;
            return `
                <tr>
                    <td class="tabela-data">${dia.dataFormatada}</td>
                    <td class="tabela-numero">${s.totalItens.toLocaleString('pt-BR')}</td>
                    <td class="tabela-numero tabela-aberto">
                        ${s.itensAbertos.toLocaleString('pt-BR')}
                        <span class="tabela-pct">(${s.percentualAbertos.toFixed(1)}%)</span>
                    </td>
                    <td class="tabela-numero tabela-corte">
                        ${s.itensCortados.toLocaleString('pt-BR')}
                        <span class="tabela-pct">(${s.percentualCortados.toFixed(1)}%)</span>
                    </td>
                    <td class="tabela-numero tabela-expedido">
                        ${s.itensAtendidos.toLocaleString('pt-BR')}
                        <span class="tabela-pct">(${s.percentualAtendidos.toFixed(1)}%)</span>
                    </td>
                </tr>
            `;
        }).join('');
        
        container.innerHTML = `
            <!-- HEADER DO PERÍODO -->
            <div class="comparativo-header-grande">
                <div class="comparativo-header-grande-icon">
                    <i class="fas fa-calendar-week"></i>
                </div>
                <h2 class="comparativo-header-grande-title">
                    RESUMO DO PERÍODO
                </h2>
                <div class="comparativo-header-periodo">
                    <span>${periodoInicio}</span>
                    <i class="fas fa-arrow-right"></i>
                    <span>${periodoFim}</span>
                </div>
                <div class="comparativo-header-grande-total">
                    <i class="fas fa-boxes"></i>
                    <span>TOTAL DE ITENS PEDIDOS NO PERÍODO: <strong>${statsAcumulado.totalItens.toLocaleString('pt-BR')}</strong></span>
                </div>
            </div>

            <!-- ACUMULADO DO PERÍODO -->
            <div class="periodo-acumulado-titulo">
                <i class="fas fa-chart-pie"></i>
                <span>ACUMULADO DO PERÍODO</span>
            </div>
            
            <div class="comparativo-grid-grande">
                <div class="comparativo-card-grande neutro">
                    <div class="comparativo-card-grande-header">
                        <div class="comparativo-card-grande-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="comparativo-card-grande-label">ITENS EM ABERTO</div>
                    </div>
                    <div class="comparativo-card-grande-body">
                        <div class="comparativo-card-grande-number">
                            ${statsAcumulado.itensAbertos.toLocaleString('pt-BR')}
                        </div>
                        <div class="comparativo-card-grande-percent">
                            ${statsAcumulado.percentualAbertos.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div class="comparativo-card-grande ruim">
                    <div class="comparativo-card-grande-header">
                        <div class="comparativo-card-grande-icon">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <div class="comparativo-card-grande-label">ITENS CORTADOS</div>
                    </div>
                    <div class="comparativo-card-grande-body">
                        <div class="comparativo-card-grande-number">
                            ${statsAcumulado.itensCortados.toLocaleString('pt-BR')}
                        </div>
                        <div class="comparativo-card-grande-percent">
                            ${statsAcumulado.percentualCortados.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div class="comparativo-card-grande bom">
                    <div class="comparativo-card-grande-header">
                        <div class="comparativo-card-grande-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="comparativo-card-grande-label">EFICIÊNCIA DE ATENDIMENTO</div>
                    </div>
                    <div class="comparativo-card-grande-body">
                        <div class="comparativo-card-grande-number">
                            ${statsAcumulado.itensAtendidos.toLocaleString('pt-BR')}
                        </div>
                        <div class="comparativo-card-grande-percent">
                            ${statsAcumulado.percentualAtendidos.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            <!-- TABELA DIA A DIA -->
            <div class="periodo-tabela-titulo">
                <i class="fas fa-table"></i>
                <span>DETALHAMENTO POR DIA</span>
            </div>
            
            <div class="periodo-tabela-container">
                <table class="periodo-tabela">
                    <thead>
                        <tr>
                            <th>DATA</th>
                            <th>ITENS PEDIDOS</th>
                            <th>ITENS EM ABERTO</th>
                            <th>ITENS CORTADOS</th>
                            <th>EFICIÊNCIA DE ATENDIMENTO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhasTabela}
                    </tbody>
                </table>
            </div>
        `;
        
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

            <div class="comparativo-grid-grande">
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
