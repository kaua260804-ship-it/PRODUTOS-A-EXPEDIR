/**
 * Comparativo - Orquestrador + Comparação Dia/Mês
 * 
 * Depende de:
 *  - js/comparativoCharts.js (gráficos)
 *  - js/comparativoPeriodo.js (período e semana)
 */

class Comparativo {
    constructor(dataProcessor) {
        this.dataProcessor = dataProcessor;
        this.tipoComparativo = 'dia';
        this.filtrosComparativo = {
            categoria: '',
            grupo: '',
            subgrupo: '',
            tipo: ''
        };
        
        this.charts = new ComparativoCharts();
        this.periodo = new ComparativoPeriodo(this);
        
        this.initializeEventListeners();
    }

    // ============================================================
    // EVENT LISTENERS
    // ============================================================

    initializeEventListeners() {
        document.getElementById('btnResumo').addEventListener('click', () => this.openModal());
        document.getElementById('btnCloseModal').addEventListener('click', () => this.closeModal());
        document.getElementById('modalOverlay').addEventListener('click', () => this.closeModal());
        document.getElementById('btnGerarComparativo').addEventListener('click', () => this.gerarComparativo());
        document.getElementById('btnGerarPeriodo').addEventListener('click', () => this.periodo.gerarResumoPeriodo());
        document.getElementById('btnGerarSemana').addEventListener('click', () => this.periodo.gerarComparativoSemana());
        
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
        
        document.getElementById('btnTipoSemana').addEventListener('click', () => {
            this.tipoComparativo = 'semana';
            this.atualizarBotoesTipo('btnTipoSemana');
            this.atualizarSelectores();
        });
        
        ['Categoria', 'Grupo', 'Subgrupo', 'Tipo'].forEach(campo => {
            const el = document.getElementById(`comparativo${campo}`);
            if (el) {
                el.addEventListener('change', (e) => {
                    this.filtrosComparativo[campo.toLowerCase()] = e.target.value;
                    this.atualizarDatasDisponiveis();
                });
            }
        });
    }

    // ============================================================
    // MODAL
    // ============================================================

    openModal() {
        const modal = document.getElementById('comparativoModal');
        modal.style.display = 'flex';
        
        this.filtrosComparativo = { categoria: '', grupo: '', subgrupo: '', tipo: '' };
        
        this.popularFiltrosComparativo();
        this.atualizarSelectores();
        
        // Destruir gráficos antigos
        this.charts.destruirTodos();
        
        document.getElementById('comparativoResultado').style.display = 'none';
        document.getElementById('comparativoResultado').innerHTML = '';
    }

    closeModal() {
        document.getElementById('comparativoModal').style.display = 'none';
        this.charts.destruirTodos();
    }

    // ============================================================
    // SELECTORES
    // ============================================================

    atualizarBotoesTipo(btnAtivoId) {
        ['btnTipoDia', 'btnTipoMes', 'btnTipoPeriodo', 'btnTipoSemana'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.toggle('active', id === btnAtivoId);
        });
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
        const selectorsSemana = document.getElementById('comparativoSelectorsSemana');
        
        if (selectorsComparativo) selectorsComparativo.style.display = 'none';
        if (selectorsPeriodo) selectorsPeriodo.style.display = 'none';
        if (selectorsSemana) selectorsSemana.style.display = 'none';
        
        if (this.tipoComparativo === 'periodo') {
            if (selectorsPeriodo) selectorsPeriodo.style.display = 'grid';
            this.periodo.popularDatasPeriodo();
        } else if (this.tipoComparativo === 'semana') {
            if (selectorsSemana) selectorsSemana.style.display = 'grid';
            this.periodo.popularDatasSemana();
        } else {
            if (selectorsComparativo) selectorsComparativo.style.display = 'grid';
            if (this.tipoComparativo === 'dia') {
                this.popularDatas();
            } else {
                this.popularMeses();
            }
        }
    }

    atualizarDatasDisponiveis() {
        const selectorsComparativo = document.querySelector('.comparativo-selectors');
        const selectorsPeriodo = document.getElementById('comparativoSelectorsPeriodo');
        const selectorsSemana = document.getElementById('comparativoSelectorsSemana');
        
        if (this.tipoComparativo === 'periodo' && selectorsPeriodo && selectorsPeriodo.style.display !== 'none') {
            this.periodo.popularDatasPeriodo();
        } else if (this.tipoComparativo === 'semana' && selectorsSemana && selectorsSemana.style.display !== 'none') {
            this.periodo.popularDatasSemana();
        } else if (selectorsComparativo && selectorsComparativo.style.display !== 'none') {
            if (this.tipoComparativo === 'dia') this.popularDatas();
            else this.popularMeses();
        }
    }

    popularFiltrosComparativo() {
        this.popularSelect('comparativoCategoria', this.dataProcessor.getUniqueValues('CATEGORIA'), 'Todas');
        this.popularSelect('comparativoGrupo', this.dataProcessor.getUniqueValues('GRUPO'), 'Todos');
        this.popularSelect('comparativoSubgrupo', this.dataProcessor.getUniqueValues('SUBGRUPO'), 'Todos');
        this.popularSelect('comparativoTipo', this.dataProcessor.getUniqueTipos(), 'Todos');
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
        const dadosFiltrados = this.getDadosFiltradosBase();
        const datas = new Set();
        dadosFiltrados.forEach(row => {
            const d = row['DATA']?.toString();
            if (d && d.trim() !== '') datas.add(d);
        });
        
        const datasArray = Array.from(datas).sort((a, b) => {
            const dateA = this.dataProcessor.parseDate(a);
            const dateB = this.dataProcessor.parseDate(b);
            return (dateA && dateB) ? dateB - dateA : 0;
        });
        
        this._popularSelectsDatas(['dataBase', 'dataComparacao'], datasArray, 
            'Selecione a data base', 'Selecione a data de comparação');
    }

    popularMeses() {
        const dadosFiltrados = this.getDadosFiltradosBase();
        const mesesSet = new Set();
        dadosFiltrados.forEach(row => {
            const data = this.dataProcessor.parseDate(row['DATA']);
            if (data) mesesSet.add(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`);
        });
        
        const meses = Array.from(mesesSet).sort().reverse();
        const dataBase = document.getElementById('dataBase');
        const dataComparacao = document.getElementById('dataComparacao');
        if (!dataBase || !dataComparacao) return;
        
        const valorBase = dataBase.value;
        const valorComparacao = dataComparacao.value;
        
        dataBase.innerHTML = '<option value="">Selecione o mês base</option>';
        dataComparacao.innerHTML = '<option value="">Selecione o mês de comparação</option>';
        
        meses.forEach(mes => {
            const display = this.formatMesDisplay(mes);
            [dataBase, dataComparacao].forEach(sel => {
                const opt = document.createElement('option');
                opt.value = mes;
                opt.textContent = display;
                sel.appendChild(opt);
            });
        });
        
        if (valorBase && meses.includes(valorBase)) dataBase.value = valorBase;
        if (valorComparacao && meses.includes(valorComparacao)) dataComparacao.value = valorComparacao;
    }

    _popularSelectsDatas(ids, datasArray, placeholder1, placeholder2) {
        const el1 = document.getElementById(ids[0]);
        const el2 = document.getElementById(ids[1]);
        if (!el1 || !el2) return;
        
        const valor1 = el1.value;
        const valor2 = el2.value;
        
        el1.innerHTML = `<option value="">${placeholder1}</option>`;
        el2.innerHTML = `<option value="">${placeholder2}</option>`;
        
        if (datasArray.length === 0) {
            [el1, el2].forEach(el => {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = 'Nenhuma data disponível';
                opt.disabled = true;
                el.appendChild(opt);
            });
            return;
        }
        
        datasArray.forEach(data => {
            const display = this.dataProcessor.formatDateDisplay(data);
            [el1, el2].forEach(sel => {
                const opt = document.createElement('option');
                opt.value = data;
                opt.textContent = display;
                sel.appendChild(opt);
            });
        });
        
        if (valor1 && datasArray.includes(valor1)) el1.value = valor1;
        if (valor2 && datasArray.includes(valor2)) el2.value = valor2;
    }

    formatMesDisplay(mes) {
        const [ano, mesNum] = mes.split('-');
        const nomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                       'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        return `${nomes[parseInt(mesNum) - 1]} ${ano}`;
    }

    // ============================================================
    // FILTROS
    // ============================================================

    getDadosFiltradosBase() {
        return this.dataProcessor.processedData.filter(row => {
            if (this.filtrosComparativo.categoria && row['CATEGORIA']?.toString() !== this.filtrosComparativo.categoria) return false;
            if (this.filtrosComparativo.grupo && row['GRUPO']?.toString() !== this.filtrosComparativo.grupo) return false;
            if (this.filtrosComparativo.subgrupo && row['SUBGRUPO']?.toString() !== this.filtrosComparativo.subgrupo) return false;
            if (this.filtrosComparativo.tipo && row['TIPO']?.toString().trim() !== this.filtrosComparativo.tipo.trim()) return false;
            return true;
        });
    }

    aplicarFiltrosComparativo(dados) {
        return this.getDadosFiltradosBase.call({ dataProcessor: this.dataProcessor, filtrosComparativo: this.filtrosComparativo })
            .constructor === Array ? dados.filter(row => {
                if (this.filtrosComparativo.categoria && row['CATEGORIA']?.toString() !== this.filtrosComparativo.categoria) return false;
                if (this.filtrosComparativo.grupo && row['GRUPO']?.toString() !== this.filtrosComparativo.grupo) return false;
                if (this.filtrosComparativo.subgrupo && row['SUBGRUPO']?.toString() !== this.filtrosComparativo.subgrupo) return false;
                if (this.filtrosComparativo.tipo && row['TIPO']?.toString().trim() !== this.filtrosComparativo.tipo.trim()) return false;
                return true;
            }) : [];
    }

    getFiltrosDescricao() {
        const filtros = [];
        if (this.filtrosComparativo.categoria) filtros.push(`Categoria: ${this.filtrosComparativo.categoria}`);
        if (this.filtrosComparativo.grupo) filtros.push(`Grupo: ${this.filtrosComparativo.grupo}`);
        if (this.filtrosComparativo.subgrupo) filtros.push(`Subgrupo: ${this.filtrosComparativo.subgrupo}`);
        if (this.filtrosComparativo.tipo) filtros.push(`Tipo: ${this.filtrosComparativo.tipo}`);
        return filtros.length > 0 ? `\n\nFiltros aplicados:\n• ${filtros.join('\n• ')}` : '';
    }

    // ============================================================
    // CÁLCULOS
    // ============================================================

    calcularEstatisticas(dados) {
        const totalItens = dados.length;
        const itensCortados = dados.filter(r => r['STATUS'] === 'CORTE').length;
        const itensAbertos = dados.filter(r => r['STATUS'] === 'ABERTO').length;
        const itensAtendidos = dados.filter(r => r['STATUS'] === 'EXPEDIDO').length;
        
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

    agruparPorData(dados) {
        const grupos = {};
        dados.forEach(row => {
            const d = row['DATA']?.toString();
            if (!d) return;
            if (!grupos[d]) grupos[d] = [];
            grupos[d].push(row);
        });
        
        return Object.keys(grupos).map(dataStr => ({
            dataOriginal: dataStr,
            dataFormatada: this.dataProcessor.formatDateDisplay(dataStr),
            dataObj: this.dataProcessor.parseDate(dataStr),
            stats: this.calcularEstatisticas(grupos[dataStr])
        })).sort((a, b) => (a.dataObj && b.dataObj) ? a.dataObj - b.dataObj : 0);
    }

    determinarIndicador(diferenca, aumentoEhBom) {
        if (diferenca > 0) {
            if (aumentoEhBom) return { texto: 'AUMENTO', tipo: 'bom', icone: '📈' };
            return { texto: 'AUMENTO', tipo: 'ruim', icone: '📈' };
        } else if (diferenca < 0) {
            if (aumentoEhBom) return { texto: 'REDUÇÃO', tipo: 'ruim', icone: '📉' };
            return { texto: 'REDUÇÃO', tipo: 'bom', icone: '📉' };
        }
        return { texto: 'MANUTENÇÃO', tipo: 'neutro', icone: '➡️' };
    }

    getClassificacaoPorPercentual(percentual, tipo) {
        if (tipo === 'atendido') {
            if (percentual >= 80) return 'bom';
            if (percentual >= 50) return 'neutro';
            return 'ruim';
        }
        if (tipo === 'corte') return percentual > 0 ? 'ruim' : 'bom';
        if (tipo === 'aberto') return percentual > 5 ? 'neutro' : 'bom';
        return 'neutro';
    }

    formatDateObj(date) {
        return date ? date.toLocaleDateString('pt-BR') : '';
    }

    // ============================================================
    // COMPARATIVO DIA / MÊS
    // ============================================================

    gerarComparativo() {
        const dataBase = document.getElementById('dataBase').value;
        const dataComparacao = document.getElementById('dataComparacao').value;
        
        if (!dataBase || !dataComparacao) {
            alert('Por favor, selecione os dois períodos para comparação');
            return;
        }
        
        let dadosBase, dadosComparacao;
        
        if (this.tipoComparativo === 'dia') {
            dadosBase = this.dataProcessor.processedData.filter(r => r['DATA']?.toString() === dataBase.toString());
            dadosComparacao = this.dataProcessor.processedData.filter(r => r['DATA']?.toString() === dataComparacao.toString());
        } else {
            dadosBase = this.dataProcessor.processedData.filter(r => {
                const d = this.dataProcessor.parseDate(r['DATA']);
                return d && `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === dataBase;
            });
            dadosComparacao = this.dataProcessor.processedData.filter(r => {
                const d = this.dataProcessor.parseDate(r['DATA']);
                return d && `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === dataComparacao;
            });
        }
        
        dadosBase = this.aplicarFiltrosComparativo(dadosBase);
        dadosComparacao = this.aplicarFiltrosComparativo(dadosComparacao);
        
        if (dadosBase.length === 0 || dadosComparacao.length === 0) {
            const filtrosDesc = this.getFiltrosDescricao();
            alert(`Não há dados para um dos períodos selecionados${filtrosDesc}.\n\nTente escolher outra data ou remover alguns filtros.`);
            return;
        }
        
        const statsBase = this.calcularEstatisticas(dadosBase);
        const statsComparacao = this.calcularEstatisticas(dadosComparacao);
        
        this.exibirResultado(statsBase, statsComparacao, dataBase, dataComparacao);
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
        
        const comp = this.tipoComparativo === 'dia' ? 'ao dia anterior' : 'ao mês anterior';
        
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
                    <span>ITENS PEDIDOS: <strong>${statsBase.totalItens.toLocaleString('pt-BR')}</strong></span>
                </div>
            </div>

            <div class="comparativo-grid-grande">
                ${this.gerarCardItensPedidos(statsBase, statsComparacao, 'TOTAL DE ITENS')}
                ${this.gerarCardSimples('ITENS CORTADOS', statsBase.itensCortados, statsBase.percentualCortados, 'fa-times-circle', indCortados, diffCortados, comp)}
                ${this.gerarCardSimples('ITENS EM ABERTO', statsBase.itensAbertos, statsBase.percentualAbertos, 'fa-exclamation-triangle', indAbertos, diffAbertos, comp)}
                ${this.gerarCardSimples('ITENS ATENDIDOS', statsBase.itensAtendidos, statsBase.percentualAtendidos, 'fa-check-circle', indAtendidos, diffAtendidos, comp)}
            </div>
        `;
        
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ============================================================
    // HELPERS DE RENDERIZAÇÃO DE CARDS
    // ============================================================

    /**
     * Card especial de ITENS PEDIDOS (só mostra o total, sem indicador de variação)
     */
    gerarCardItensPedidos(statsAtual, statsComparacao, label) {
        const diffTotal = statsAtual.totalItens - statsComparacao.totalItens;
        const diffPct = statsComparacao.totalItens > 0 
            ? (diffTotal / statsComparacao.totalItens) * 100 
            : 0;
        
        const tipo = diffTotal > 0 ? 'bom' : (diffTotal < 0 ? 'neutro' : 'neutro');
        const icone = diffTotal > 0 ? '📈' : (diffTotal < 0 ? '📉' : '➡️');
        const texto = diffTotal > 0 ? 'AUMENTO' : (diffTotal < 0 ? 'REDUÇÃO' : 'MANUTENÇÃO');
        
        return `
            <div class="comparativo-card-grande ${tipo}">
                <div class="comparativo-card-grande-header">
                    <div class="comparativo-card-grande-icon">
                        <i class="fas fa-boxes"></i>
                    </div>
                    <div class="comparativo-card-grande-label">${label}</div>
                </div>
                <div class="comparativo-card-grande-body">
                    <div class="comparativo-card-grande-number">
                        ${statsAtual.totalItens.toLocaleString('pt-BR')}
                    </div>
                    <div class="comparativo-card-grande-percent">
                        ${statsComparacao.totalItens.toLocaleString('pt-BR')} no período anterior
                    </div>
                </div>
                <div class="comparativo-card-grande-footer ${tipo}">
                    <span class="diff-icon">${icone}</span>
                    <span class="diff-big"><strong>${texto}</strong> de ${Math.abs(diffPct).toFixed(1)}%</span>
                </div>
            </div>
        `;
    }

    /**
     * Card padrão (cortados / aberto / atendidos) com indicador em destaque
     */
    gerarCardSimples(label, valor, percentual, icone, indicador, diff, comparacaoTexto) {
        return `
            <div class="comparativo-card-grande ${indicador.tipo}">
                <div class="comparativo-card-grande-header">
                    <div class="comparativo-card-grande-icon">
                        <i class="fas ${icone}"></i>
                    </div>
                    <div class="comparativo-card-grande-label">${label}</div>
                </div>
                <div class="comparativo-card-grande-body">
                    <div class="comparativo-card-grande-number">
                        ${valor.toLocaleString('pt-BR')}
                    </div>
                    <div class="comparativo-card-grande-percent">
                        ${percentual.toFixed(1)}%
                    </div>
                </div>
                <div class="comparativo-card-grande-footer ${indicador.tipo}">
                    <span class="diff-icon">${indicador.icone}</span>
                    <span class="diff-big"><strong>${indicador.texto}</strong> de ${Math.abs(diff).toFixed(1)}%</span>
                    <span class="diff-label">em relação ${comparacaoTexto}</span>
                </div>
            </div>
        `;
    }
}

window.Comparativo = Comparativo;
