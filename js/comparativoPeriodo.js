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
        elFim.innerHTML = '<option value="">Selecione a data final</option>';
        
        arr.forEach(d => {
            const txt = this.dp.formatDateDisplay(d);
            [elInicio, elFim].forEach(sel => {
                const opt = document.createElement('option');
                opt.value = d; opt.textContent = txt;
                sel.appendChild(opt);
            });
        });
        
        if (v1 && arr.includes(v1)) elInicio.value = v1;
        if (v2 && arr.includes(v2)) elFim.value = v2;
    }

    popularDatasSemana() {
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
        
        const ids = ['semana1De', 'semana1Ate', 'semana2De', 'semana2Ate'];
        const valores = {};
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) valores[id] = el.value;
        });
        
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            
            const ph = el.options[0];
            el.innerHTML = '';
            el.appendChild(ph);
            
            arr.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d; opt.textContent = this.dp.formatDateDisplay(d);
                el.appendChild(opt);
            });
            
            if (valores[id] && arr.includes(valores[id])) el.value = valores[id];
        });
    }

    // ============================================================
    // PERÍODO (DIA A DIA)
    // ============================================================

    gerarResumoPeriodo() {
        const dIni = document.getElementById('dataInicioPeriodo').value;
        const dFim = document.getElementById('dataFimPeriodo').value;
        
        if (!dIni || !dFim) {
            alert('Por favor, selecione a data de início e a data de fim do período');
            return;
        }
        
        const dateIni = this.dp.parseDate(dIni);
        const dateFim = this.dp.parseDate(dFim);
        
        if (!dateIni || !dateFim || dateIni > dateFim) {
            alert('Datas inválidas ou fora de ordem. Selecione novamente.');
            return;
        }
        
        let dados = this.dp.processedData.filter(row => {
            const d = this.dp.parseDate(row['DATA']);
            return d && d >= dateIni && d <= dateFim;
        });
        
        dados = this.comparativo.aplicarFiltrosComparativo(dados);
        
        if (dados.length === 0) {
            alert(`Não há dados para o período selecionado${this.getFiltrosDescricao()}.`);
            return;
        }
        
        const dadosPorData = this.agruparPorData(dados);
        const statsAcumulado = this.calcularEstatisticas(dados);
        
        this.exibirResumoPeriodo(statsAcumulado, dadosPorData, dIni, dFim);
    }

    exibirResumoPeriodo(statsAcumulado, dadosPorData, dataInicio, dataFim) {
        const container = document.getElementById('comparativoResultado');
        container.style.display = 'block';
        
        const pIni = this.dp.formatDateDisplay(dataInicio);
        const pFim = this.dp.formatDateDisplay(dataFim);
        
        // Gráficos (cada métrica em seu canvas)
        const labels = dadosPorData.map(d => d.dataFormatada);
        const valoresPedidos = dadosPorData.map(d => d.stats.totalItens);
        const valoresCortados = dadosPorData.map(d => d.stats.itensCortados);
        const valoresAbertos = dadosPorData.map(d => d.stats.itensAbertos);
        const valoresAtendidos = dadosPorData.map(d => d.stats.itensAtendidos);
        
        const pctCortados = dadosPorData.map(d => d.stats.percentualCortados);
        const pctAbertos = dadosPorData.map(d => d.stats.percentualAbertos);
        const pctAtendidos = dadosPorData.map(d => d.stats.percentualAtendidos);
        
        container.innerHTML = `
            <div class="comparativo-header-grande">
                <div class="comparativo-header-grande-icon">
                    <i class="fas fa-calendar-week"></i>
                </div>
                <h2 class="comparativo-header-grande-title">RESUMO DO PERÍODO</h2>
                <div class="comparativo-header-periodo">
                    <span>${pIni}</span>
                    <i class="fas fa-arrow-right"></i>
                    <span>${pFim}</span>
                </div>
                <div class="comparativo-header-grande-total">
                    <i class="fas fa-boxes"></i>
                    <span>ITENS PEDIDOS NO PERÍODO: <strong>${statsAcumulado.totalItens.toLocaleString('pt-BR')}</strong></span>
                </div>
            </div>

            <div class="periodo-acumulado-titulo">
                <i class="fas fa-chart-pie"></i>
                <span>ACUMULADO DO PERÍODO</span>
            </div>
            
            <div class="comparativo-grid-grande">
                ${this.comparativo.gerarCardItensPedidos(statsAcumulado, { totalItens: 0 }, 'TOTAL DE ITENS')}
                ${this.gerarCardAcumulado('ITENS CORTADOS', statsAcumulado.itensCortados, statsAcumulado.percentualCortados, 'fa-times-circle', 'corte')}
                ${this.gerarCardAcumulado('ITENS EM ABERTO', statsAcumulado.itensAbertos, statsAcumulado.percentualAbertos, 'fa-exclamation-triangle', 'aberto')}
                ${this.gerarCardAcumulado('ITENS ATENDIDOS', statsAcumulado.itensAtendidos, statsAcumulado.percentualAtendidos, 'fa-check-circle', 'atendido')}
            </div>

            <div class="periodo-tabela-titulo">
                <i class="fas fa-chart-bar"></i>
                <span>GRÁFICOS POR DIA</span>
            </div>
            
            <div class="graficos-grid">
                <div class="grafico-card">
                    <div class="grafico-card-header">
                        <i class="fas fa-times-circle grafico-icon-corte"></i>
                        <span>ITENS CORTADOS POR DIA</span>
                    </div>
                    <div class="grafico-canvas-wrapper">
                        <canvas id="graficoCortados"></canvas>
                    </div>
                </div>
                
                <div class="grafico-card">
                    <div class="grafico-card-header">
                        <i class="fas fa-exclamation-triangle grafico-icon-aberto"></i>
                        <span>ITENS EM ABERTO POR DIA</span>
                    </div>
                    <div class="grafico-canvas-wrapper">
                        <canvas id="graficoAbertos"></canvas>
                    </div>
                </div>
                
                <div class="grafico-card">
                    <div class="grafico-card-header">
                        <i class="fas fa-check-circle grafico-icon-atendido"></i>
                        <span>ITENS ATENDIDOS POR DIA</span>
                    </div>
                    <div class="grafico-canvas-wrapper">
                        <canvas id="graficoAtendidos"></canvas>
                    </div>
                </div>
                
                <div class="grafico-card">
                    <div class="grafico-card-header">
                        <i class="fas fa-boxes grafico-icon-pedidos"></i>
                        <span>ITENS PEDIDOS POR DIA</span>
                    </div>
                    <div class="grafico-canvas-wrapper">
                        <canvas id="graficoPedidos"></canvas>
                    </div>
                </div>
            </div>
        `;
        
        // Aguardar renderização do DOM e depois criar os gráficos
        setTimeout(() => {
            this.charts.criarGraficoBarras('graficoCortados', labels, valoresCortados, pctCortados, 'Itens Cortados', '#e74c3c');
            this.charts.criarGraficoBarras('graficoAbertos', labels, valoresAbertos, pctAbertos, 'Itens em Aberto', '#f39c12');
            this.charts.criarGraficoBarras('graficoAtendidos', labels, valoresAtendidos, pctAtendidos, 'Itens Atendidos', '#27ae60');
            this.charts.criarGraficoBarras('graficoPedidos', labels, valoresPedidos, valoresPedidos.map(() => 100), 'Itens Pedidos', '#3498db');
        }, 50);
        
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ============================================================
    // SEMANA (2 PERÍODOS)
    // ============================================================

    gerarComparativoSemana() {
        const s1De = document.getElementById('semana1De').value;
        const s1Ate = document.getElementById('semana1Ate').value;
        const s2De = document.getElementById('semana2De').value;
        const s2Ate = document.getElementById('semana2Ate').value;
        
        if (!s1De || !s1Ate || !s2De || !s2Ate) {
            alert('Por favor, preencha os 4 campos (Semana 1 e Semana 2, com De e Até).');
            return;
        }
        
        let d1i = this.dp.parseDate(s1De), d1f = this.dp.parseDate(s1Ate);
        let d2i = this.dp.parseDate(s2De), d2f = this.dp.parseDate(s2Ate);
        
        if (!d1i || !d1f || !d2i || !d2f) {
            alert('Datas inválidas.');
            return;
        }
        
        if (d1i > d1f) [d1i, d1f] = [d1f, d1i];
        if (d2i > d2f) [d2i, d2f] = [d2f, d2i];
        
        let dadosSem1 = this.dp.processedData.filter(r => {
            const d = this.dp.parseDate(r['DATA']);
            return d && d >= d1i && d <= d1f;
        });
        let dadosSem2 = this.dp.processedData.filter(r => {
            const d = this.dp.parseDate(r['DATA']);
            return d && d >= d2i && d <= d2f;
        });
        
        dadosSem1 = this.comparativo.aplicarFiltrosComparativo(dadosSem1);
        dadosSem2 = this.comparativo.aplicarFiltrosComparativo(dadosSem2);
        
        if (dadosSem1.length === 0 && dadosSem2.length === 0) {
            alert(`Não há dados para os períodos selecionados${this.getFiltrosDescricao()}.`);
            return;
        }
        
        if (dadosSem1.length === 0 || dadosSem2.length === 0) {
            alert(`Não há dados para uma das semanas${this.getFiltrosDescricao()}.`);
            return;
        }
        
        const statsSem1 = this.calcularEstatisticas(dadosSem1);
        const statsSem2 = this.calcularEstatisticas(dadosSem2);
        
        const dadosPorDia1 = this.agruparPorData(dadosSem1);
        const dadosPorDia2 = this.agruparPorData(dadosSem2);
        
        this.exibirResultadoSemana(statsSem1, statsSem2, d1i, d1f, d2i, d2f, dadosPorDia1, dadosPorDia2);
    }

    exibirResultadoSemana(statsSem1, statsSem2, d1i, d1f, d2i, d2f, dadosPorDia1, dadosPorDia2) {
        const container = document.getElementById('comparativoResultado');
        container.style.display = 'block';
        
        const periodo1 = `${this.formatDateObj(d1i)} a ${this.formatDateObj(d1f)}`;
        const periodo2 = `${this.formatDateObj(d2i)} a ${this.formatDateObj(d2f)}`;
        
        const diffCort = statsSem1.percentualCortados - statsSem2.percentualCortados;
        const diffAbert = statsSem1.percentualAbertos - statsSem2.percentualAbertos;
        const diffAten = statsSem1.percentualAtendidos - statsSem2.percentualAtendidos;
        
        const indCort = this.determinarIndicador(diffCort, false);
        const indAbert = this.determinarIndicador(diffAbert, false);
        const indAten = this.determinarIndicador(diffAten, true);
        
        // Preparar dados para gráficos
        const labels1 = dadosPorDia1.map(d => d.dataFormatada);
        const labels2 = dadosPorDia2.map(d => d.dataFormatada);
        
        container.innerHTML = `
            <div class="comparativo-header-grande">
                <div class="comparativo-header-grande-icon">
                    <i class="fas fa-calendar-week"></i>
                </div>
                <h2 class="comparativo-header-grande-title">COMPARATIVO DE PERÍODOS</h2>
                <div class="comparativo-header-periodo">
                    <span class="semana-tag semana-1">SEMANA 1</span>
                    <span>${periodo1}</span>
                    <i class="fas fa-arrow-right"></i>
                    <span class="semana-tag semana-2">SEMANA 2</span>
                    <span>${periodo2}</span>
                </div>
                <div class="comparativo-header-grande-total">
                    <i class="fas fa-boxes"></i>
                    <span>ITENS PEDIDOS: <strong>${statsSem1.totalItens.toLocaleString('pt-BR')}</strong> vs <strong>${statsSem2.totalItens.toLocaleString('pt-BR')}</strong></span>
                </div>
            </div>

            <!-- ========== SEMANA 1 ========== -->
            <div class="periodo-acumulado-titulo semana-1-titulo">
                <i class="fas fa-chart-pie"></i>
                <span>ACUMULADO DA SEMANA 1 (${periodo1})</span>
            </div>
            
            <div class="comparativo-grid-grande">
                ${this.comparativo.gerarCardItensPedidos(statsSem1, statsSem2, 'TOTAL DE ITENS')}
                ${this.comparativo.gerarCardSimples('ITENS CORTADOS', statsSem1.itensCortados, statsSem1.percentualCortados, 'fa-times-circle', indCort, diffCort, 'à semana 2')}
                ${this.comparativo.gerarCardSimples('ITENS EM ABERTO', statsSem1.itensAbertos, statsSem1.percentualAbertos, 'fa-exclamation-triangle', indAbert, diffAbert, 'à semana 2')}
                ${this.comparativo.gerarCardSimples('ITENS ATENDIDOS', statsSem1.itensAtendidos, statsSem1.percentualAtendidos, 'fa-check-circle', indAten, diffAten, 'à semana 2')}
            </div>

            <div class="periodo-tabela-titulo">
                <i class="fas fa-chart-bar"></i>
                <span>ITENS CORTADOS POR DIA — SEMANA 1</span>
            </div>
            
            <div class="grafico-card grafico-card-solo">
                <div class="grafico-canvas-wrapper grafico-canvas-grande">
                    <canvas id="graficoCortados1"></canvas>
                </div>
            </div>

            <div class="periodo-tabela-titulo">
                <i class="fas fa-chart-bar"></i>
                <span>ITENS CORTADOS POR DIA — SEMANA 2</span>
            </div>
            
            <div class="grafico-card grafico-card-solo">
                <div class="grafico-canvas-wrapper grafico-canvas-grande">
                    <canvas id="graficoCortados2"></canvas>
                </div>
            </div>

            <!-- ========== SEMANA 2 ========== -->
            <div class="periodo-acumulado-titulo semana-2-titulo">
                <i class="fas fa-chart-pie"></i>
                <span>ACUMULADO DA SEMANA 2 (${periodo2})</span>
            </div>
            
            <div class="comparativo-grid-grande">
                ${this.comparativo.gerarCardItensPedidos(statsSem2, statsSem1, 'TOTAL DE ITENS')}
                ${this.gerarCardAcumulado('ITENS CORTADOS', statsSem2.itensCortados, statsSem2.percentualCortados, 'fa-times-circle', 'corte')}
                ${this.gerarCardAcumulado('ITENS EM ABERTO', statsSem2.itensAbertos, statsSem2.percentualAbertos, 'fa-exclamation-triangle', 'aberto')}
                ${this.gerarCardAcumulado('ITENS ATENDIDOS', statsSem2.itensAtendidos, statsSem2.percentualAtendidos, 'fa-check-circle', 'atendido')}
            </div>
        `;
        
        // Criar gráficos após render
        setTimeout(() => {
            const v1 = dadosPorDia1.map(d => d.stats.itensCortados);
            const p1 = dadosPorDia1.map(d => d.stats.percentualCortados);
            const v2 = dadosPorDia2.map(d => d.stats.itensCortados);
            const p2 = dadosPorDia2.map(d => d.stats.percentualCortados);
            
            this.charts.criarGraficoBarras('graficoCortados1', labels1, v1, p1, 'Cortados Semana 1', '#e74c3c');
            this.charts.criarGraficoBarras('graficoCortados2', labels2, v2, p2, 'Cortados Semana 2', '#e74c3c');
        }, 50);
        
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Card de acumulado (sem indicador de variação)
     */
    gerarCardAcumulado(label, valor, percentual, icone, tipo) {
        const classe = this.getClassificacaoPorPercentual(percentual, tipo);
        return `
            <div class="comparativo-card-grande ${classe}">
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
            </div>
        `;
    }
}

window.ComparativoPeriodo = ComparativoPeriodo;
