/**
 * Comparativo por PERÍODO (dia a dia) e por SEMANA (com gráficos)
 * 
 * Acesso ao orquestrador via `this.comparativo`
 */

class ComparativoPeriodo {
    constructor(comparativo) {
        this.comparativo = comparativo;
        this.dp = comparativo.dataProcessor;
        this.charts = comparativo.charts;
    }

    // ============================================================
    // HELPERS (delegados ao comparativo)
    // ============================================================

    getDadosFiltradosBase() { return this.comparativo.getDadosFiltradosBase(); }
    calcularEstatisticas(d) { return this.comparativo.calcularEstatisticas(d); }
    agruparPorData(d) { return this.comparativo.agruparPorData(d); }
    formatDateObj(d) { return this.comparativo.formatDateObj(d); }
    getFiltrosDescricao() { return this.comparativo.getFiltrosDescricao(); }
    getClassificacaoPorPercentual(p, t) { return this.comparativo.getClassificacaoPorPercentual(p, t); }
    determinarIndicador(d, b) { return this.comparativo.determinarIndicador(d, b); }

    // ============================================================
    // POPULAR DATAS
    // ============================================================

    popularDatasPeriodo() {
        const dados = this.getDadosFiltradosBase();
        const datas = new Set();
        dados.forEach(r => {
            const d = r['DATA']?.toString();
            if (d && d.trim() !== '') datas.add(d);
        });
        
        const arr = Array.from(datas).sort((a, b) => {
            const dA = this.dp.parseDate(a), dB = this.dp.parseDate(b);
            return (dA && dB) ? dB - dA : 0;
        });
        
        const elInicio = document.getElementById('dataInicioPeriodo');
        const elFim = document.getElementById('dataFimPeriodo');
        if (!elInicio || !elFim) return;
        
        const v1 = elInicio.value, v2 = elFim.value;
        
        elInicio.innerHTML = '<option value="">Selecione a data inicial</option>';
        elFim.innerHTML = '<option value="">
