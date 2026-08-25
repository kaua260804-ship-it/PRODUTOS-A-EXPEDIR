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

    initializeEventListeners() {
        document.getElementById('filterData').addEventListener('change', (e) => {
            this.filters.data = e.target.value;
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

    populateFilterOptions() {
        const datas = this.dataProcessor.getUniqueValues('DATA');
        this.populateSelect('filterData', datas, true);
        
        const empresas = this.dataProcessor.getUniqueValues('EMPRESA');
        this.populateSelect('filterEmpresa', empresas);
        
        const categorias = this.dataProcessor.getUniqueValues('CATEGORIA');
        this.populateSelect('filterCategoria', categorias);
        
        const grupos = this.dataProcessor.getUniqueValues('GRUPO');
        this.populateSelect('filterGrupo', grupos);
        
        const subgrupos = this.dataProcessor.getUniqueValues('SUBGRUPO');
        this.populateSelect('filterSubgrupo', subgrupos);
    }

    populateSelect(selectId, values, isDate = false) {
        const select = document.getElementById(selectId);
        const currentValue = select.value;
        
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            
            if (isDate) {
                option.textContent = this.dataProcessor.formatDateDisplay(value);
            } else {
                option.textContent = value;
            }
            
            select.appendChild(option);
        });
        
        select.value = currentValue;
    }

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

    applyFilters() {
        this.filteredData = this.dataProcessor.processedData.filter(row => {
            if (this.filters.data && row['DATA']?.toString() !== this.filters.data) {
                return false;
            }
            
            if (this.filters.empresa && row['EMPRESA']?.toString() !== this.filters.empresa) {
                return false;
            }
            
            if (this.filters.pedido && !row['NRO DO PEDIDO']?.toString().toLowerCase().includes(this.filters.pedido.toLowerCase())) {
                return false;
            }
            
            if (this.filters.codigo && !row['CODIGO']?.toString().toLowerCase().includes(this.filters.codigo.toLowerCase())) {
                return false;
            }
            
            if (this.filters.produto && !row['PRODUTO']?.toString().toLowerCase().includes(this.filters.produto.toLowerCase())) {
                return false;
            }
            
            if (this.filters.status && row['STATUS'] !== this.filters.status) {
                return false;
            }
            
            if (this.filters.categoria && row['CATEGORIA']?.toString() !== this.filters.categoria) {
                return false;
            }
            
            if (this.filters.grupo && row['GRUPO']?.toString() !== this.filters.grupo) {
                return false;
            }
            
            if (this.filters.subgrupo && row['SUBGRUPO']?.toString() !== this.filters.subgrupo) {
                return false;
            }
            
            return true;
        });
        
        document.dispatchEvent(new CustomEvent('dataFiltered', {
            detail: { filteredData: this.filteredData }
        }));
    }

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
        
        document.getElementById('filterData').value = '';
        document.getElementById('filterEmpresa').value = '';
        document.getElementById('filterPedido').value = '';
        document.getElementById('filterCodigo').value = '';
        document.getElementById('filterProduto').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterCategoria').value = '';
        document.getElementById('filterGrupo').value = '';
        document.getElementById('filterSubgrupo').value = '';
        
        document.getElementById('autocompletePedido').innerHTML = '';
        document.getElementById('autocompleteCodigo').innerHTML = '';
        document.getElementById('autocompleteProduto').innerHTML = '';
        
        this.applyFilters();
    }

    getFilteredData() {
        return this.filteredData.length > 0 ? this.filteredData : this.dataProcessor.processedData;
    }
}

// Exportar classe
window.Filters = Filters;