/**
 * Gerencia os filtros da aplicação
 */

class Filters {
    constructor(dataProcessor) {
        this.dataProcessor = dataProcessor;
        this.filters = {
            data: '',
            empresa: '',
            pedido: '',
            codigo: '',
            produto: '',
            status: '',
            categoria: '',
            grupo: '',
            subgrupo: ''
        };
        this.filteredData = [];
        this.initializeEventListeners();
        this.populateFilterOptions();
    }

    /**
     * Inicializa os event listeners dos filtros
     */
    initializeEventListeners() {
        document.getElementById('filterData').addEventListener('change', (e) => {
            this.filters.data = e.target.value;
            console.log('Filtro de data alterado para:', e.target.value);
            this.applyFilters();
        });
        
        document.getElementById('filterEmpresa').addEventListener('change', (e) => {
            this.filters.empresa = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('filterPedido').addEventListener('input', (e) => {
            this.filters.pedido = e.target.value;
            this.showAutocomplete('pedido', e.target.value);
            this.applyFilters();
        });
        
        document.getElementById('filterCodigo').addEventListener('input', (e) => {
            this.filters.codigo = e.target.value;
            this.showAutocomplete('codigo', e.target.value);
            this.applyFilters();
        });
        
        document.getElementById('filterProduto').addEventListener('input', (e) => {
            this.filters.produto = e.target.value;
            this.showAutocomplete('produto', e.target.value);
            this.applyFilters();
        });
        
        document.getElementById('filterStatus').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('filterCategoria').addEventListener('change', (e) => {
            this.filters.categoria = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('filterGrupo').addEventListener('change', (e) => {
            this.filters.grupo = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('filterSubgrupo').addEventListener('change', (e) => {
            this.filters.subgrupo = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('btnClearFilters').addEventListener('click', () => {
            this.clearFilters();
        });
    }

    /**
     * Popula as opções dos filtros dropdown
     */
    populateFilterOptions() {
        console.log('========================================');
        console.log('POPULANDO FILTROS:');
        console.log('========================================');
        
        // Datas (formatadas)
        const datas = this.dataProcessor.getUniqueValues('DATA');
        console.log(`Datas encontradas para filtro (${datas.length}):`);
        datas.forEach((data, index) => {
            console.log(`  ${index + 1}. Valor original: "${data}" | Formatada: ${this.formatDateDisplay(data)}`);
        });
        
        this.populateSelect('filterData', datas, true);
        
        // Empresas
        const empresas = this.dataProcessor.getUniqueValues('EMPRESA');
        console.log(`Empresas encontradas (${empresas.length})`);
        this.populateSelect('filterEmpresa', empresas);
        
        // Categorias
        const categorias = this.dataProcessor.getUniqueValues('CATEGORIA');
        console.log(`Categorias encontradas (${categorias.length})`);
        this.populateSelect('filterCategoria', categorias);
        
        // Grupos
        const grupos = this.dataProcessor.getUniqueValues('GRUPO');
        console.log(`Grupos encontrados (${grupos.length})`);
        this.populateSelect('filterGrupo', grupos);
        
        // Subgrupos
        const subgrupos = this.dataProcessor.getUniqueValues('SUBGRUPO');
        console.log(`Subgrupos encontrados (${subgrupos.length})`);
        this.populateSelect('filterSubgrupo', subgrupos);
        
        console.log('========================================');
    }

    /**
     * Popula um select com opções
     */
    populateSelect(selectId, values, isDate = false) {
        const select = document.getElementById(selectId);
        const currentValue = select.value;
        
        // Manter a primeira opção
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            
            if (isDate) {
                option.textContent = this.formatDateDisplay(value);
            } else {
                option.textContent = value;
            }
            
            select.appendChild(option);
        });
        
        select.value = currentValue;
        
        console.log(`Select "${selectId}" populado com ${values.length} opções`);
    }

    /**
     * Formata data para exibição
     */
    formatDateDisplay(dataStr) {
        // Se for número serial do Excel
        if (typeof dataStr === 'number' || !isNaN(dataStr)) {
            const numData = parseFloat(dataStr);
            if (numData > 40000 && numData < 60000) {
                const date = new Date(Math.round((numData - 25569) * 86400 * 1000));
                return date.toLocaleDateString('pt-BR');
            }
        }
        
        // Tentar diferentes formatos
        const date = new Date(dataStr);
        if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('pt-BR');
        }
        
        return dataStr;
    }

    /**
     * Mostra autocomplete
     */
    showAutocomplete(field, value) {
        const containerId = `autocomplete${field.charAt(0).toUpperCase() + field.slice(1)}`;
        const container = document.getElementById(containerId);
        
        if (!value || value.length < 1) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }
        
        const columnMap = {
            pedido: 'NRO DO PEDIDO',
            codigo: 'CODIGO',
            produto: 'PRODUTO'
        };
        
        const column = columnMap[field];
        const values = this.dataProcessor.getUniqueValues(column);
        const matches = values.filter(v => 
            v.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 10);
        
        container.innerHTML = '';
        
        if (matches.length > 0) {
            matches.forEach(match => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = match;
                item.addEventListener('click', () => {
                    document.getElementById(`filter${field.charAt(0).toUpperCase() + field.slice(1)}`).value = match;
                    this.filters[field] = match;
                    container.innerHTML = '';
                    container.style.display = 'none';
                    this.applyFilters();
                });
                container.appendChild(item);
            });
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    }

    /**
     * Aplica os filtros aos dados
     */
    applyFilters() {
        const dataAntes = this.filteredData.length;
        
        this.filteredData = this.dataProcessor.processedData.filter(row => {
            // Filtro por data
            if (this.filters.data && row['DATA']?.toString() !== this.filters.data) {
                return false;
            }
            
            // Filtro por empresa
            if (this.filters.empresa && row['EMPRESA']?.toString() !== this.filters.empresa) {
                return false;
            }
            
            // Filtro por pedido
            if (this.filters.pedido && !row['NRO DO PEDIDO']?.toString().toLowerCase().includes(this.filters.pedido.toLowerCase())) {
                return false;
            }
            
            // Filtro por código
            if (this.filters.codigo && !row['CODIGO']?.toString().toLowerCase().includes(this.filters.codigo.toLowerCase())) {
                return false;
            }
            
            // Filtro por produto
            if (this.filters.produto && !row['PRODUTO']?.toString().toLowerCase().includes(this.filters.produto.toLowerCase())) {
                return false;
            }
            
            // Filtro por status
            if (this.filters.status && row['STATUS'] !== this.filters.status) {
                return false;
            }
            
            // Filtro por categoria
            if (this.filters.categoria && row['CATEGORIA']?.toString() !== this.filters.categoria) {
                return false;
            }
            
            // Filtro por grupo
            if (this.filters.grupo && row['GRUPO']?.toString() !== this.filters.grupo) {
                return false;
            }
            
            // Filtro por subgrupo
            if (this.filters.subgrupo && row['SUBGRUPO']?.toString() !== this.filters.subgrupo) {
                return false;
            }
            
            return true;
        });
        
        console.log(`Filtros aplicados: ${dataAntes} -> ${this.filteredData.length} registros`);
        
        // Disparar evento para atualizar tabela e cards
        document.dispatchEvent(new CustomEvent('dataFiltered', {
            detail: { filteredData: this.filteredData }
        }));
    }

    /**
     * Limpa todos os filtros
     */
    clearFilters() {
        this.filters = {
            data: '',
            empresa: '',
            pedido: '',
            codigo: '',
            produto: '',
            status: '',
            categoria: '',
            grupo: '',
            subgrupo: ''
        };
        
        // Limpar campos
        document.getElementById('filterData').value = '';
        document.getElementById('filterEmpresa').value = '';
        document.getElementById('filterPedido').value = '';
        document.getElementById('filterCodigo').value = '';
        document.getElementById('filterProduto').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterCategoria').value = '';
        document.getElementById('filterGrupo').value = '';
        document.getElementById('filterSubgrupo').value = '';
        
        // Limpar autocomplete
        document.getElementById('autocompletePedido').innerHTML = '';
        document.getElementById('autocompleteCodigo').innerHTML = '';
        document.getElementById('autocompleteProduto').innerHTML = '';
        
        console.log('Todos os filtros foram limpos');
        
        this.applyFilters();
    }

    /**
     * Obtém dados filtrados
     */
    getFilteredData() {
        return this.filteredData.length > 0 ? this.filteredData : this.dataProcessor.processedData;
    }
}

// Exportar classe
window.Filters = Filters;
