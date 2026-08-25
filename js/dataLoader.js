/**
 * Verifica se existem datas específicas no arquivo
 */
checkSpecificDates() {
    const geralData = this.sheetsData[CONFIG.SHEETS.GERAL] || [];
    
    console.log('========================================');
    console.log('VERIFICAÇÃO DE DATAS ESPECÍFICAS:');
    console.log('========================================');
    
    // Verificar data 24/08/2026 (serial 46259)
    const dataAlvo = 46259;
    const registrosDataAlvo = geralData.filter(row => {
        const data = row['DATA'];
        return data === dataAlvo || data === '46259' || data === '24/08/2026' || data === '2026-08-24';
    });
    
    console.log(`Registros com data 24/08/2026 (serial 46259): ${registrosDataAlvo.length}`);
    
    if (registrosDataAlvo.length > 0) {
        console.log('Exemplos de registros com 24/08/2026:');
        registrosDataAlvo.slice(0, 5).forEach(row => {
            console.log('  -', {
                pedido: row['NRO DO PEDIDO'],
                codigo: row['CODIGO'],
                produto: row['PRODUTO'],
                data: row['DATA'],
                tipoData: typeof row['DATA']
            });
        });
    } else {
        console.log('Nenhum registro encontrado com data 24/08/2026');
        
        // Verificar os últimos registros da planilha
        console.log('Últimos 10 registros da planilha:');
        const ultimos10 = geralData.slice(-10);
        ultimos10.forEach((row, index) => {
            console.log(`  ${index + 1}.`, {
                pedido: row['NRO DO PEDIDO'],
                data: row['DATA'],
                tipoData: typeof row['DATA']
            });
        });
    }
    
    // Verificar todas as datas únicas
    const todasDatas = new Set();
    geralData.forEach(row => {
        if (row['DATA'] !== undefined && row['DATA'] !== null) {
            todasDatas.add(row['DATA'].toString());
        }
    });
    
    const datasArray = Array.from(todasDatas).sort((a, b) => {
        return parseFloat(a) - parseFloat(b);
    });
    
    console.log(`Todas as datas únicas (${datasArray.length}):`);
    console.log('Primeiras 5:', datasArray.slice(0, 5));
    console.log('Últimas 5:', datasArray.slice(-5));
    
    // Verificar se há datas como string
    const datasString = [];
    const datasNumber = [];
    
    geralData.forEach(row => {
        const data = row['DATA'];
        if (typeof data === 'string') {
            datasString.push(data);
        } else if (typeof data === 'number') {
            datasNumber.push(data);
        }
    });
    
    console.log(`Datas como string: ${datasString.length}`);
    console.log(`Datas como número: ${datasNumber.length}`);
    
    if (datasString.length > 0) {
        console.log('Exemplos de datas string:', datasString.slice(0, 10));
    }
    
    console.log('========================================');
}
