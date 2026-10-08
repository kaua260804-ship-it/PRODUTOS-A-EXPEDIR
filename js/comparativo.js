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
            subgrupo: '',
            tipo: ''
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
        
        document.getElementById('btnGerarSemana').addEventListener('click', () => {
            this.gerarComparativoSemana();
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
        
        document.getElementById('btnTipoSemana').addEventListener('click', () => {
            this.tipoComparativo = 'semana';
            this.atualizarBotoesTipo('btnTipoSemana');
            this.atualizarSelectores();
        });
        
        document.getElementById('comparativoCategoria').addEventListener('change', (e) => {
            this.filtrosComparativo.categoria = e.target.value;
            this.atualizarDatasDisponiveis();
        });
        
        document.getElementById('comparativoGrupo').addEventListener('change', (e) => {
            this.filtrosComparativo.grupo = e.target.value;
            this.atualizarDatasDisponiveis();
        });
        
        document.getElementById('comparativoSubgrupo').addEventListener('change', (e) => {
            this.filtrosComparativo.subgrupo = e.target.value;
            this.atualizarDatasDisponiveis();
        });
        
        const comparativoTipoEl = document.getElementById('comparativoTipo');
        if (comparativoTipoEl) {
            comparativoTipoEl.addEventListener('change', (e) => {
                this.filtrosComparativo.tipo = e.target.value;
                this.atualizarDatasDisponiveis();
            });
        }
    }

    atualizarDatasDisponiveis() {
        const selectorsComparativo = document.querySelector('.comparativo-selectors');
        const selectorsPeriodo = document.getElementById('comparativoSelectorsPeriodo');
        const selectorsSemana = document.getElementById('comparativoSelectorsSemana');
        
        if (this.tipoComparativo === 'periodo') {
            if (selectorsPeriodo && selectorsPeriodo.style.display !== 'none') {
                this.popularDatasPeriodo();
            }
        } else if (this.tipoComparativo === 'semana') {
            if (selectorsSemana && selectorsSemana.style.display !== 'none') {
                this.popularDatasSemana();
            }
        } else {
            if (selectorsComparativo && selectorsComparativo.style.display !== 'none') {
                if (this.tipoComparativo === 'dia') {
                    this.popularDatas();
                } else {
                    this.popularMeses();
                }
            }
        }
    }

    atualizarBotoesTipo(btnAtivoId) {
        ['btnTipoDia', 'btnTipoMes', 'btnTipoPeriodo', 'btnTipoSemana'].forEach(id => {
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
            subgrupo: '',
            tipo: ''
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
        const selectorsSemana = document.getElementById('comparativoSelectorsSemana');
        
        // Esconde todos
        if (selectorsComparativo) selectorsComparativo.style.display = 'none';
        if (selectorsPeriodo) selectorsPeriodo.style.display = 'none';
        if (selectorsSemana) selectorsSemana.style.display = 'none';
        
        if (this.tipoComparativo === 'periodo') {
            if (selectorsPeriodo) selectorsPeriodo.style.display = 'grid';
            this.popularDatasPeriodo();
        } else if (this.tipoComparativo === 'semana') {
            if (selectorsSemana) selectorsSemana.style.display = 'grid';
            this.popularDatasSemana();
        } else {
            if (selectorsComparativo) selectorsComparativo.style.display = 'grid';
            
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
        
        const tipos = this.dataProcessor.getUniqueTipos();
        this.popularSelect('comparativoTipo', tipos, 'Todos');
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

    getDadosFiltradosBase() {
        return this.dataProcessor.processedData.filter(row => {
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
            
            if (this.filtrosComparativo.tipo && 
                row['TIPO']?.toString().trim() !== this.filtrosComparativo.tipo.trim()) {
                return false;
            }
            
            return true;
        });
    }

    popularDatas() {
        const dadosFiltrados = this.getDadosFiltradosBase();
        const datas = new Set();
        
        dadosFiltrados.forEach(row => {
            const dataStr = row['DATA']?.toString();
            if (dataStr && dataStr.trim() !== '') {
                datas.add(dataStr);
            }
        });
        
        const datasArray = Array.from(datas).sort((a, b) => {
            const dateA = this.dataProcessor.parseDate(a);
            const dateB = this.dataProcessor.parseDate(b);
            if (dateA && dateB) return dateB - dateA;
            return 0;
        });
        
        const dataBase = document.getElementById('dataBase');
        const dataComparacao = document.getElementById('dataComparacao');
        
        if (!dataBase || !dataComparacao) return;
        
        const valorBase = dataBase.value;
        const valorComparacao = dataComparacao.value;
        
        dataBase.innerHTML = '<option value="">Selecione a data base</option>';
        dataComparacao.innerHTML = '<option value="">Selecione a data de comparação</option>';
        
        if (datasArray.length === 0) {
            const optVazio = document.createElement('option');
            optVazio.value = '';
            optVazio.textContent = 'Nenhuma data disponível';
            optVazio.disabled = true;
            dataBase.appendChild(optVazio.cloneNode(true));
            dataComparacao.appendChild(optVazio.cloneNode(true));
            return;
        }
        
        datasArray.forEach(data => {
            const optionBase = document.createElement('option');
            optionBase.value = data;
            optionBase.textContent = this.dataProcessor.formatDateDisplay(data);
            dataBase.appendChild(optionBase);
            
            const optionComparacao = document.createElement('option');
            optionComparacao.value = data;
            optionComparacao.textContent = this.dataProcessor.formatDateDisplay(data);
            dataComparacao.appendChild(optionComparacao);
        });
        
        if (valorBase && datasArray.includes(valorBase)) dataBase.value = valorBase;
        if (valorComparacao && datasArray.includes(valorComparacao)) dataComparacao.value = valorComparacao;
    }

    popularDatasPeriodo() {
        const dadosFiltrados = this.getDadosFiltradosBase();
        const datas = new Set();
        
        dadosFiltrados.forEach(row => {
            const dataStr = row['DATA']?.toString();
            if (dataStr && dataStr.trim() !== '') {
                datas.add(dataStr);
            }
        });
        
        const datasArray = Array.from(datas).sort((a, b) => {
            const dateA = this.dataProcessor.parseDate(a);
            const dateB = this.dataProcessor.parseDate(b);
            if (dateA && dateB) return dateB - dateA;
            return 0;
        });
        
        const dataInicio = document.getElementById('dataInicioPeriodo');
        const dataFim = document.getElementById('dataFimPeriodo');
        
        if (!dataInicio || !dataFim) return;
        
        const valorInicio = dataInicio.value;
        const valorFim = dataFim.value;
        
        dataInicio.innerHTML = '<option value="">Selecione a data inicial</option>';
        dataFim.innerHTML = '<option value="">Selecione a data final</option>';
        
        if (datasArray.length === 0) {
            const optVazio = document.createElement('option');
            optVazio.value = '';
            optVazio.textContent = 'Nenhuma data disponível';
            optVazio.disabled = true;
            dataInicio.appendChild(optVazio.cloneNode(true));
            dataFim.appendChild(optVazio.cloneNode(true));
            return;
        }
        
        datasArray.forEach(data => {
            const optionInicio = document.createElement('option');
            optionInicio.value = data;
            optionInicio.textContent = this.dataProcessor.formatDateDisplay(data);
            dataInicio.appendChild(optionInicio);
            
            const optionFim = document.createElement('option');
            optionFim.value = data;
            optionFim.textContent = this.dataProcessor.formatDateDisplay(data);
            dataFim.appendChild(optionFim);
        });
        
        if (valorInicio && datasArray.includes(valorInicio)) dataInicio.value = valorInicio;
        if (valorFim && datasArray.includes(valorFim)) dataFim.value = valorFim;
    }

    /**
     * Popular datas para o comparativo por SEMANA (com De/Até para cada semana)
     */
    popularDatasSemana() {
        const dadosFiltrados = this.getDadosFiltradosBase();
        const datas = new Set();
        
        dadosFiltrados.forEach(row => {
            const dataStr = row['DATA']?.toString();
            if (dataStr && dataStr.trim() !== '') {
                datas.add(dataStr);
            }
        });
        
        const datasArray = Array.from(datas).sort((a, b) => {
            const dateA = this.dataProcessor.parseDate(a);
            const dateB = this.dataProcessor.parseDate(b);
            if (dateA && dateB) return dateB - dateA;
            return 0;
        });
        
        const ids = ['semana1De', 'semana1Ate', 'semana2De', 'semana2Ate'];
        const valoresAtuais = {};
        
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) valoresAtuais[id] = el.value;
        });
        
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            
            const placeholder = el.options[0];
            el.innerHTML = '';
            el.appendChild(placeholder);
            
            if (datasArray.length === 0) {
                const optVazio = document.createElement('option');
                optVazio.value = '';
                optVazio.textContent = 'Nenhuma data';
                optVazio.disabled = true;
                el.appendChild(optVazio);
                return;
            }
            
            datasArray.forEach(data => {
                const option = document.createElement('option');
                option.value = data;
                option.textContent = this.dataProcessor.formatDateDisplay(data);
                el.appendChild(option);
            });
            
            if (valoresAtuais[id] && datasArray.includes(valoresAtuais[id])) {
                el.value = valoresAtuais[id];
            }
        });
    }

    popularMeses() {
        const dadosFiltrados = this.getDadosFiltradosBase();
        const mesesSet = new Set();
        
        dadosFiltrados.forEach(row => {
            const data = this.dataProcessor.parseDate(row['DATA']);
            if (data) {
                mesesSet.add(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`);
            }
        });
        
        const meses = Array.from(mesesSet).sort().reverse();
        
        const dataBase = document.getElementById('dataBase');
        const dataComparacao = document.getElementById('dataComparacao');
        
        if (!dataBase || !dataComparacao) return;
        
        const valorBase = dataBase.value;
        const valorComparacao = dataComparacao.value;
        
        dataBase.innerHTML = '<option value="">Selecione o mês base</option>';
        dataComparacao.innerHTML = '<option value="">Selecione o mês de comparação</option>';
        
        if (meses.length === 0) {
            const optVazio = document.createElement('option');
            optVazio.value = '';
            optVazio.textContent = 'Nenhum mês disponível';
            optVazio.disabled = true;
            dataBase.appendChild(optVazio.cloneNode(true));
            dataComparacao.appendChild(optVazio.cloneNode(true));
            return;
        }
        
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
        
        if (valorBase && meses.includes(valorBase)) dataBase.value = valorBase;
        if (valorComparacao && meses.includes(valorComparacao)) dataComparacao.value = valorComparacao;
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
            
            if (this.filtrosComparativo.tipo && 
                row['TIPO']?.toString().trim() !== this.filtrosComparativo.tipo.trim()) {
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
        
        if (dadosBase.length === 0 && dadosComparacao.length === 0) {
            alert(`Não há dados para os períodos selecionados com os filtros aplicados.\n\nTente remover alguns filtros ou escolher outras datas.`);
            return;
        }
        
        if (dadosBase.length === 0) {
            const filtrosDesc = this.getFiltrosDescricao();
            alert(`Não há dados para a data base selecionada${filtrosDesc}.\n\nTente escolher outra data ou remover alguns filtros.`);
            return;
        }
        
        if (dadosComparacao.length === 0) {
            const filtrosDesc = this.getFiltrosDescricao();
            alert(`Não há dados para a data de comparação selecionada${filtrosDesc}.\n\nTente escolher outra data ou remover alguns filtros.`);
            return;
        }
        
        const statsBase = this.calcularEstatisticas(dadosBase);
        const statsComparacao = this.calcularEstatisticas(dadosComparacao);
        
        this.exibirResultado(statsBase, statsComparacao, dataBase, dataComparacao);
    }

    /**
     * Gera o comparativo entre dois PERÍODOS (Semana 1 vs Semana 2)
     * Ambos com De/Até configuráveis
     */
    gerarComparativoSemana() {
        const s1De = document.getElementById('semana1De').value;
        const s1Ate = document.getElementById('semana1Ate').value;
        const s2De = document.getElementById('semana2De').value;
        const s2Ate = document.getElementById('semana2Ate').value;
        
        if (!s1De || !s1Ate) {
            alert('Por favor, selecione o período completo da Semana 1 (De e Até)');
            return;
        }
        
        if (!s2De || !s2Ate) {
            alert('Por favor, selecione o período completo da Semana 2 (De e Até)');
            return;
        }
        
        let data1Inicio = this.dataProcessor.parseDate(s1De);
        let data1Fim = this.dataProcessor.parseDate(s1Ate);
        let data2Inicio = this.dataProcessor.parseDate(s2De);
        let data2Fim = this.dataProcessor.parseDate(s2Ate);
        
        if (!data1Inicio || !data1Fim || !data2Inicio || !data2Fim) {
            alert('Datas inválidas. Por favor, selecione novamente.');
            return;
        }
        
        // Auto-correção: se De > Até, inverte
        if (data1Inicio > data1Fim) {
            const temp = data1Inicio;
            data1Inicio = data1Fim;
            data1Fim = temp;
        }
        if (data2Inicio > data2Fim) {
            const temp = data2Inicio;
            data2Inicio = data2Fim;
            data2Fim = temp;
        }
        
        // Filtrar dados dos dois períodos
        let dadosSemana1 = this.dataProcessor.processedData.filter(row => {
            const data = this.dataProcessor.parseDate(row['DATA']);
            if (!data) return false;
            return data >= data1Inicio && data <= data1Fim;
        });
        
        let dadosSemana2 = this.dataProcessor.processedData.filter(row => {
            const data = this.dataProcessor.parseDate(row['DATA']);
            if (!data) return false;
            return data >= data2Inicio && data <= data2Fim;
        });
        
        dadosSemana1 = this.aplicarFiltrosComparativo(dadosSemana1);
        dadosSemana2 = this.aplicarFiltrosComparativo(dadosSemana2);
        
        if (dadosSemana1.length === 0 && dadosSemana2.length === 0) {
            alert(`Não há dados para os períodos selecionados com os filtros aplicados.\n\nTente remover alguns filtros ou escolher outras datas.`);
            return;
        }
        
        if (dadosSemana1.length === 0) {
            const filtrosDesc = this.getFiltrosDescricao();
            alert(`Não há dados para a Semana 1${filtrosDesc}.\n\nTente escolher outra data ou remover alguns filtros.`);
            return;
        }
        
        if (dadosSemana2.length === 0) {
            const filtrosDesc = this.getFiltrosDescricao();
            alert(`Não há dados para a Semana 2${filtrosDesc}.\n\nTente escolher outra data ou remover alguns filtros.`);
            return;
        }
        
        const statsSemana1 = this.calcularEstatisticas(dadosSemana1);
        const statsSemana2 = this.calcularEstatisticas(dadosSemana2);
        
        const dadosPorDiaSemana1 = this.agruparPorData(dadosSemana1);
        const dadosPorDiaSemana2 = this.agruparPorData(dadosSemana2);
        
        this.exibirResultadoSemana(
            statsSemana1, 
            statsSemana2, 
            data1Inicio, 
            data1Fim, 
            data2Inicio, 
            data2Fim,
            dadosPorDiaSemana1,
            dadosPorDiaSemana2
        );
    }

    formatDateObj(date) {
        if (!date) return '';
        return date.toLocaleDateString('pt-BR');
    }

    /**
     * Gera a tabela TRANSPOSTA (datas nas colunas, métricas nas linhas)
     * Apenas as datas presentes na semana 1 (para alinhamento lado a lado)
     */
    gerarTabelaTransposta(dadosPorDia1, dadosPorDia2) {
        // Mapa: data -> stats
        const mapa1 = {};
        const mapa2 = {};
        
        dadosPorDia1.forEach(d => { mapa1[d.dataFormatada] = d.stats; });
        dadosPorDia2.forEach(d => { mapa2[d.dataFormatada] = d.stats; });
        
        // Todas as datas únicas (ordenadas)
        const todasDatas = Array.from(new Set([
            ...dadosPorDia1.map(d => d.dataFormatada),
            ...dadosPorDia2.map(d => d.dataFormatada)
        ])).sort((a, b) => {
            const [dA, mA, aA] = a.split('/');
            const [dB, mB, aB] = b.split('/');
            return new Date(aA, mA - 1, dA) - new Date(aB, mB - 1, dB);
        });
        
        if (todasDatas.length === 0) {
            return '<p style="text-align:center;color:var(--text-muted);">Sem dados</p>';
        }
        
        // Construir cabeçalho: MÉTRICA | Data1 | Data2 | ...
        const cabecalho = `
            <thead>
                <tr>
                    <th class="col-metrica">MÉTRICA</th>
                    ${todasDatas.map(data => `<th class="col-data">${data}</th>`).join('')}
                </tr>
            </thead>
        `;
        
        // Linhas: cada métrica
        const linhasMetricas = [
            {
                label: 'ITENS PEDIDOS',
                valorFn: (s) => s ? s.totalItens.toLocaleString('pt-BR') : '-',
                classe: ''
            },
            {
                label: 'ITENS EM ABERTO',
                valorFn: (s) => s ? `${s.itensAbertos.toLocaleString('pt-BR')} <span class="tabela-pct">(${s.percentualAbertos.toFixed(1)}%)</span>` : '-',
                classe: 'tabela-aberto'
            },
            {
                label: 'ITENS CORTADOS',
                valorFn: (s) => s ? `${s.itensCortados.toLocaleString('pt-BR')} <span class="tabela-pct">(${s.percentualCortados.toFixed(1)}%)</span>` : '-',
                classe: 'tabela-corte'
            },
            {
                label: 'EFICIÊNCIA DE ATENDIMENTO',
                valorFn: (s) => s ? `${s.itensAtendidos.toLocaleString('pt-BR')} <span class="tabela-pct">(${s.percentualAtendidos.toFixed(1)}%)</span>` : '-',
                classe: 'tabela-expedido'
            }
        ];
        
        const linhas = linhasMetricas.map(metrica => {
            const celulas = todasDatas.map(data => {
                const stats1 = mapa1[data];
                const stats2 = mapa2[data];
                
                // Se ambos têm dados (raro), mostra os dois
                if (stats1 && stats2) {
                    return `<td class="${metrica.classe}">
                        <div class="duplo-valor">
                            <span>${metrica.valorFn(stats1)}</span>
                            <span class="duplo-sep">/</span>
                            <span>${metrica.valorFn(stats2)}</span>
                        </div>
                    </td>`;
                }
                
                const stats = stats1 || stats2;
                const origem = stats1 ? 'semana1' : 'semana2';
                
                return `<td class="${metrica.classe} ${origem}">${metrica.valorFn(stats)}</td>`;
            }).join('');
            
            return `<tr>
                <td class="col-metrica">${metrica.label}</td>
                ${celulas}
            </tr>`;
        }).join('');
        
        return `<table class="periodo-tabela tabela-transposta">${cabecalho}<tbody>${linhas}</tbody></table>`;
    }

    /**
     * Exibe o resultado do comparativo entre semanas (com TABELA TRANSPOSTA)
     */
    exibirResultadoSemana(statsSemana1, statsSemana2, data1Inicio, data1Fim, data2Inicio, data2Fim, dadosPorDia1, dadosPorDia2) {
        const container = document.getElementById('comparativoResultado');
        container.style.display = 'block';
        
        const periodo1 = `${this.formatDateObj(data1Inicio)} a ${this.formatDateObj(data1Fim)}`;
        const periodo2 = `${this.formatDateObj(data2Inicio)} a ${this.formatDateObj(data2Fim)}`;
        
        const diffCortados = statsSemana1.percentualCortados - statsSemana2.percentualCortados;
        const diffAbertos = statsSemana1.percentualAbertos - statsSemana2.percentualAbertos;
        const diffAtendidos = statsSemana1.percentualAtendidos - statsSemana2.percentualAtendidos;
        
        const indCortados = this.determinarIndicador(diffCortados, false);
        const indAbertos = this.determinarIndicador(diffAbertos, false);
        const indAtendidos = this.determinarIndicador(diffAtendidos, true);
        
        const tabelaTransposta = this.gerarTabelaTransposta(dadosPorDia1, dadosPorDia2);
        
        container.innerHTML = `
            <div class="comparativo-header-grande">
                <div class="comparativo-header-grande-icon">
                    <i class="fas fa-calendar-week"></i>
                </div>
                <h2 class="comparativo-header-grande-title">
                    COMPARATIVO DE PERÍODOS
                </h2>
                <div class="comparativo-header-periodo">
                    <span class="semana-tag semana-1">SEMANA 1</span>
                    <span>${periodo1}</span>
                    <i class="fas fa-arrow-right"></i>
                    <span class="semana-tag semana-2">SEMANA 2</span>
                    <span>${periodo2}</span>
                </div>
                <div class="comparativo-header-grande-total">
                    <i class="fas fa-boxes"></i>
                    <span>ITENS PEDIDOS: <strong>${statsSemana1.totalItens.toLocaleString('pt-BR')}</strong> vs <strong>${statsSemana2.totalItens.toLocaleString('pt-BR')}</strong></span>
                </div>
            </div>

            <div class="periodo-acumulado-titulo">
                <i class="fas fa-chart-pie"></i>
                <span>ACUMULADO DA SEMANA 1 (${periodo1})</span>
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
                            ${statsSemana1.itensCortados.toLocaleString('pt-BR')}
                        </div>
                        <div class="comparativo-card-grande-percent">
                            ${statsSemana1.percentualCortados.toFixed(1)}%
                        </div>
                    </div>
                    <div class="comparativo-card-grande-footer ${indCortados.tipo}">
                        <span class="diff-icon">${indCortados.icone}</span>
                        <span><strong>${indCortados.texto}</strong> de ${Math.abs(diffCortados).toFixed(1)}%</span>
                        <span class="diff-label">em relação à semana anterior</span>
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
                            ${statsSemana1.itensAbertos.toLocaleString('pt-BR')}
                        </div>
                        <div class="comparativo-card-grande-percent">
                            ${statsSemana1.percentualAbertos.toFixed(1)}%
                        </div>
                    </div>
                    <div class="comparativo-card-grande-footer ${indAbertos.tipo}">
                        <span class="diff-icon">${indAbertos.icone}</span>
                        <span><strong>${indAbertos.texto}</strong> de ${Math.abs(diffAbertos).toFixed(1)}%</span>
                        <span class="diff-label">em relação à semana anterior</span>
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
                            ${statsSemana1.itensAtendidos.toLocaleString('pt-BR')}
                        </div>
                        <div class="comparativo-card-grande-percent">
                            ${statsSemana1.percentualAtendidos.toFixed(1)}%
                        </div>
                    </div>
                    <div class="comparativo-card-grande-footer ${indAtendidos.tipo}">
                        <span class="diff-icon">${indAtendidos.icone}</span>
                        <span><strong>${indAtendidos.texto}</strong> de ${Math.abs(diffAtendidos).toFixed(1)}%</span>
                        <span class="diff-label">em relação à semana anterior</span>
                    </div>
                </div>
            </div>

            <div class="periodo-tabela-titulo">
                <i class="fas fa-table"></i>
                <span>DETALHAMENTO POR DIA (SEMANA 1)</span>
            </div>
            
            <div class="periodo-tabela-container tabela-transposta-container">
                ${tabelaTransposta}
            </div>

            <div class="periodo-acumulado-titulo">
                <i class="fas fa-chart-pie"></i>
                <span>ACUMULADO DA SEMANA 2 (${periodo2})</span>
            </div>
            
            <div class="comparativo-grid-grande">
                <div class="comparativo-card-grande ${this.getClassificacaoPorPercentual(statsSemana2.percentualCortados, 'corte')}">
                    <div class="comparativo-card-grande-header">
                        <div class="comparativo-card-grande-icon">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <div class="comparativo-card-grande-label">ITENS CORTADOS</div>
                    </div>
                    <div class="comparativo-card-grande-body">
                        <div class="comparativo-card-grande-number">
                            ${statsSemana2.itensCortados.toLocaleString('pt-BR')}
                        </div>
                        <div class="comparativo-card-grande-percent">
                            ${statsSemana2.percentualCortados.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div class="comparativo-card-grande ${this.getClassificacaoPorPercentual(statsSemana2.percentualAbertos, 'aberto')}">
                    <div class="comparativo-card-grande-header">
                        <div class="comparativo-card-grande-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="comparativo-card-grande-label">ITENS EM ABERTO</div>
                    </div>
                    <div class="comparativo-card-grande-body">
                        <div class="comparativo-card-grande-number">
                            ${statsSemana2.itensAbertos.toLocaleString('pt-BR')}
                        </div>
                        <div class="comparativo-card-grande-percent">
                            ${statsSemana2.percentualAbertos.toFixed(1)}%
                        </div>
                    </div>
                </div>

                <div class="comparativo-card-grande ${this.getClassificacaoPorPercentual(statsSemana2.percentualAtendidos, 'atendido')}">
                    <div class="comparativo-card-grande-header">
                        <div class="comparativo-card-grande-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="comparativo-card-grande-label">ITENS ATENDIDOS</div>
                    </div>
                    <div class="comparativo-card-grande-body">
                        <div class="comparativo-card-grande-number">
                            ${statsSemana2.itensAtendidos.toLocaleString('pt-BR')}
                        </div>
                        <div class="comparativo-card-grande-percent">
                            ${statsSemana2.percentualAtendidos.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            <div class="periodo-tabela-titulo">
                <i class="fas fa-table"></i>
                <span>DETALHAMENTO POR DIA (SEMANA 2)</span>
            </div>
            
            <div class="periodo-tabela-container tabela-transposta-container">
                ${tabelaTransposta}
            </div>
        `;
        
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    getFiltrosDescricao() {
        const filtros = [];
        if (this.filtrosComparativo.categoria) filtros.push(`Categoria: ${this.filtrosComparativo.categoria}`);
        if (this.filtrosComparativo.grupo) filtros.push(`Grupo: ${this.filtrosComparativo.grupo}`);
        if (this.filtrosComparativo.subgrupo) filtros.push(`Subgrupo: ${this.filtrosComparativo.subgrupo}`);
        if (this.filtrosComparativo.tipo) filtros.push(`Tipo: ${this.filtrosComparativo.tipo}`);
        
        if (filtros.length > 0) {
            return `\n\nFiltros aplicados:\n• ${filtros.join('\n• ')}`;
        }
        return '';
    }

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
        
        let dadosPeriodo = this.dataProcessor.processedData.filter(row => {
            const data = this.dataProcessor.parseDate(row['DATA']);
            if (!data) return false;
            return data >= dateInicio && data <= dateFim;
        });
        
        dadosPeriodo = this.aplicarFiltrosComparativo(dadosPeriodo);
        
        if (dadosPeriodo.length === 0) {
            const filtrosDesc = this.getFiltrosDescricao();
            alert(`Não há dados para o período selecionado${filtrosDesc}.\n\nTente escolher outro período ou remover alguns filtros.`);
            return;
        }
        
        const dadosPorData = this.agruparPorData(dadosPeriodo);
        const statsAcumulado = this.calcularEstatisticas(dadosPeriodo);
        
        this.exibirResumoPeriodo(statsAcumulado, dadosPorData, dataInicio, dataFim);
    }

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
        
        resultado.sort((a, b) => {
            if (a.dataObj && b.dataObj) {
                return a.dataObj.getTime() - b.dataObj.getTime();
            }
            return 0;
        });
        
        return resultado;
    }

    exibirResumoPeriodo(statsAcumulado, dadosPorData, dataInicio, dataFim) {
        const container = document.getElementById('comparativoResultado');
        container.style.display = 'block';
        
        const periodoInicio = this.dataProcessor.formatDateDisplay(dataInicio);
        const periodoFim = this.dataProcessor.formatDateDisplay(dataFim);
        
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

            <div class="periodo-acumulado-titulo">
                <i class="fas fa-chart-pie"></i>
                <span>ACUMULADO DO PERÍODO</span>
            </div>
            
            <div class="comparativo-grid-grande">
                <div class="comparativo-card-grande ${this.getClassificacaoPorPercentual(statsAcumulado.percentualAbertos, 'aberto')}">
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

                <div class="comparativo-card-grande ${this.getClassificacaoPorPercentual(statsAcumulado.percentualCortados, 'corte')}">
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

                <div class="comparativo-card-grande ${this.getClassificacaoPorPercentual(statsAcumulado.percentualAtendidos, 'atendido')}">
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

    getClassificacaoPorPercentual(percentual, tipo) {
        if (tipo === 'atendido') {
            if (percentual >= 80) return 'bom';
            if (percentual >= 50) return 'neutro';
            return 'ruim';
        }
        if (tipo === 'corte') {
            if (percentual > 0) return 'ruim';
            return 'bom';
        }
        if (tipo === 'aberto') {
            if (percentual > 5) return 'neutro';
            return 'bom';
        }
        return 'neutro';
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
                        <span class="diff-label">em relação ao período anterior</span>
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
                        <span class="diff-label">em relação ao período anterior</span>
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
                        <span class="diff-label">em relação ao período anterior</span>
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
