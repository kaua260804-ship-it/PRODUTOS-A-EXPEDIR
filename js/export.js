/**
 * Gerencia a exportação de dados
 */

class Export {
    constructor(table) {
        this.table = table;
        this.initializeEventListeners();
    }

    /**
     * Inicializa os event listeners
     */
    initializeEventListeners() {
        document.getElementById('btnExportCSV').addEventListener('click', () => {
            this.exportToCSV();
        });
        
        document.getElementById('btnExportExcel').addEventListener('click', () => {
            this.exportToExcel();
        });
    }

    /**
     * Obtém os dados filtrados atuais
     */
    getCurrentData() {
        return this.table.getFilteredData();
    }

    /**
     * Exporta para CSV
     */
    exportToCSV() {
        const data = this.getCurrentData();
        
        if (data.length === 0) {
            alert('Nenhum dado para exportar');
            return;
        }
        
        const columns = this.table.getTableColumns();
        const headers = columns.map(col => col.label);
        
        // Criar conteúdo CSV
        let csv = headers.join(',') + '\n';
        
        data.forEach(row => {
            const values = columns.map(col => {
                let value = row[col.key] || '';
                // Escapar valores com vírgula
                if (value.toString().includes(',')) {
                    value = '"' + value + '"';
                }
                return value;
            });
            csv += values.join(',') + '\n';
        });
        
        // Download
        this.downloadFile(csv, 'dados_filtrados.csv', 'text/csv;charset=utf-8;');
    }

    /**
     * Exporta para Excel
     */
    exportToExcel() {
        const data = this.getCurrentData();
        
        if (data.length === 0) {
            alert('Nenhum dado para exportar');
            return;
        }
        
        const columns = this.table.getTableColumns();
        
        // Criar worksheet
        const wsData = [
            columns.map(col => col.label),
            ...data.map(row => columns.map(col => row[col.key] || ''))
        ];
        
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Dados Filtrados');
        
        // Download
        XLSX.writeFile(wb, 'dados_filtrados.xlsx');
    }

    /**
     * Faz download de um arquivo
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Exportar classe
window.Export = Export;