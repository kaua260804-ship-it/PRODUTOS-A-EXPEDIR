/**
 * Gerencia a renderização da tabela de dados
 */

class Table {
    constructor(dataProcessor) {
        this.dataProcessor = dataProcessor;
        this.currentData = [];
        this.currentPage = 1;
        this.recordsPerPage = 50;
        this.totalPages = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.globalSearchTerm = '';
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('btnPrev').addEventListener('click', () => {
            this.previousPage();
        });
        
        document.getElementById('btnNext').addEventListener('click', () => {
            this.nextPage();
        });
        
        document.getElementById('btnFirst').addEventListener('click', () => {
            this.firstPage();
        });
        
        document.getElementById('btnLast').addEventListener('click', () => {
            this.lastPage();
        });
        
        document.getElementById('btnJumpPage').addEventListener('click', () => {
            this.jumpToPage();
        });
        
        document.getElementById('pageJumpInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.jumpToPage();
            }
        });
        
        document.getElementById('recordsPerPage').addEventListener('change', (e) => {
            this.recordsPerPage = parseInt(e.target.value) || 50;
            this.currentPage = 1;
            this.render();
        });
        
        document.getElementById('globalSearch').addEventListener('input', (e) => {
            this.globalSearchTerm = e.target.value;
            this.currentPage = 1;
            this.render();
        });
        
        document.addEventListener('dataFiltered', (e) => {
            this.currentData = e.detail.filteredData;
            this.currentPage = 1;
            this.render();
        });
    }

    setData(data) {
        this.currentData = data || [];
        this.currentPage = 1;
        
        const selectElement = document.getElementById('recordsPerPage');
        if (selectElement) {
            this.recordsPerPage = parseInt(selectElement.value) || 50;
        }
        
        this.render();
    }

    getFilteredData() {
        let data = [...this.currentData];
        
        if (this.globalSearchTerm) {
            const searchTerm = this.globalSearchTerm.toLowerCase();
            data = data.filter(row => {
                return Object.values(row).some(value => 
                    value?.toString().toLowerCase().includes(searchTerm)
                );
            });
        }
        
        if (this.sortColumn) {
            data.sort((a, b) => {
                const aVal = a[this.sortColumn] || '';
                const bVal = b[this.sortColumn] || '';
                
                if (this.sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }
        
        return data;
    }

    render() {
        const filteredData = this.getFilteredData();
        this.totalPages = Math.ceil(filteredData.length / this.recordsPerPage);
        
        if (this.totalPages < 1) this.totalPages = 1;
        
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
        }
        
        if (this.currentPage < 1) {
            this.currentPage = 1;
        }
        
        const startIndex = (this.currentPage - 1) * this.recordsPerPage;
        const endIndex = Math.min(startIndex + this.recordsPerPage, filteredData.length);
        const pageData = filteredData.slice(startIndex, endIndex);
        
        this.renderHeader();
        this.renderBody(pageData);
        this.updatePagination(filteredData.length);
        this.updateRecordCount(filteredData.length);
        this.renderPageNumbers();
    }

    renderHeader() {
        const thead = document.getElementById('tableHead');
        const columns = this.getTableColumns();
        
        thead.innerHTML = '<tr>' + columns.map(col => {
            const sortIcon = this.sortColumn === col.key 
                ? `<i class="fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'}"></i>`
                : '<i class="fas fa-sort"></i>';
            
            return `<th data-column="${col.key}" style="cursor: pointer;">
                ${col.label} ${sortIcon}
            </th>`;
        }).join('') + '</tr>';
        
        thead.querySelectorAll('th').forEach(th => {
            th.addEventListener('click', () => {
                this.handleSort(th.dataset.column);
            });
        });
    }

    getTableColumns() {
        return [
            { key: 'NRO DO PEDIDO', label: 'Nº Pedido' },
            { key: 'CODIGO', label: 'Código' },
            { key: 'STATUS', label: 'Status' },
            { key: 'PRODUTO', label: 'Produto' },
            { key: 'EMBALAGEM', label: 'Embalagem' },
            { key: 'EMPRESA', label: 'Empresa' },
            { key: 'SALDO', label: 'Saldo' },
            { key: 'QTD DISTRIBUIÇÃO', label: 'Qtd Distribuição' },
            { key: 'TOTAL QND UND VENDA', label: 'Total Qnd Und Venda' },
            { key: 'QTD EXPEDIR', label: 'Qtd Expedir' },
            { key: 'ESTOQUE DISPONIVEL', label: 'Estoque Disponível' },
            { key: 'CATEGORIA', label: 'Categoria' },
            { key: 'GRUPO', label: 'Grupo' },
            { key: 'SUBGRUPO', label: 'Subgrupo' },
            { key: 'DATA', label: 'Data' },
            { key: 'EST DISPONIVEL', label: 'Est Disponível' },
            { key: 'CUSTO', label: 'Custo' },
            { key: 'QTD_DISPONIVEL_CD', label: 'Qtd Disponível CD' },
            { key: 'PRECO_VDA_UNITARIO', label: 'Preço Vda Unitário' }
        ];
    }

    renderBody(data) {
        const tbody = document.getElementById('tableBody');
        const noData = document.getElementById('noData');
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '';
            noData.style.display = 'block';
            return;
        }
        
        noData.style.display = 'none';
        
        tbody.innerHTML = data.map(row => {
            const status = row['STATUS'] || 'EXPEDIDO';
            const statusClass = `status-${status.toLowerCase()}`;
            const columns = this.getTableColumns();
            
            return `<tr class="${statusClass}">
                ${columns.map(col => {
                    const value = row[col.key];
                    
                    if (col.key === 'STATUS') {
                        return `<td><span class="status-badge ${statusClass}">${value || ''}</span></td>`;
                    }
                    
                    if (col.key === 'DATA' && value) {
                        return `<td>${this.dataProcessor.formatDateDisplay(value)}</td>`;
                    }
                    
                    let displayValue = value;
                    if (typeof value === 'number') {
                        displayValue = value.toLocaleString('pt-BR');
                    }
                    
                    return `<td>${displayValue || ''}</td>`;
                }).join('')}
            </tr>`;
        }).join('');
    }

    updatePagination(totalRecords) {
        document.getElementById('currentPage').textContent = this.currentPage;
        document.getElementById('totalPages').textContent = this.totalPages;
        document.getElementById('pageJumpInput').value = this.currentPage;
        document.getElementById('pageJumpInput').max = this.totalPages;
        
        document.getElementById('btnFirst').disabled = this.currentPage <= 1;
        document.getElementById('btnPrev').disabled = this.currentPage <= 1;
        document.getElementById('btnNext').disabled = this.currentPage >= this.totalPages;
        document.getElementById('btnLast').disabled = this.currentPage >= this.totalPages;
    }

    renderPageNumbers() {
        const container = document.getElementById('pageNumbers');
        const maxVisible = 7;
        let pages = [];
        
        if (this.totalPages <= maxVisible) {
            pages = Array.from({length: this.totalPages}, (_, i) => i + 1);
        } else {
            const start = Math.max(1, this.currentPage - 3);
            const end = Math.min(this.totalPages, this.currentPage + 3);
            
            if (start > 1) {
                pages.push(1);
                if (start > 2) pages.push('...');
            }
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            if (end < this.totalPages) {
                if (end < this.totalPages - 1) pages.push('...');
                pages.push(this.totalPages);
            }
        }
        
        container.innerHTML = pages.map(page => {
            if (page === '...') {
                return '<span class="page-ellipsis">...</span>';
            }
            return `<button class="page-number ${page === this.currentPage ? 'active' : ''}" 
                            onclick="app.table.goToPage(${page})">
                        ${page}
                    </button>`;
        }).join('');
    }

    updateRecordCount(totalRecords) {
        document.getElementById('recordCount').textContent = `${totalRecords} registros`;
    }

    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.render();
        }
    }

    firstPage() {
        this.goToPage(1);
    }

    lastPage() {
        this.goToPage(this.totalPages);
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.render();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.render();
        }
    }

    jumpToPage() {
        const input = document.getElementById('pageJumpInput');
        const page = parseInt(input.value);
        
        if (page >= 1 && page <= this.totalPages) {
            this.goToPage(page);
        } else {
            alert(`Por favor, digite um número entre 1 e ${this.totalPages}`);
            input.value = this.currentPage;
        }
    }

    handleSort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        this.render();
    }
}

// Exportar classe
window.Table = Table;