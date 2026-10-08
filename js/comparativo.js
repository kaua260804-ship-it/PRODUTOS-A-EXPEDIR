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
            dataBase.appendChild(
