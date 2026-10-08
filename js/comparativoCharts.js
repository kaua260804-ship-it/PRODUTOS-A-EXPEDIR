/**
 * Gerencia a renderização de gráficos do comparativo (Chart.js)
 */

class ComparativoCharts {
    constructor() {
        this.charts = {};
    }

    /**
     * Cria gráfico de barras verticais com rótulo de dados e %
     * @param {string} canvasId - ID do canvas
     * @param {Array<string>} labels - Labels do eixo X (datas)
     * @param {Array<number>} valores - Valores (quantidade)
     * @param {Array<number>} percentuais - Percentuais
     * @param {string} titulo - Título do gráfico
     * @param {string} corBase - Cor principal (hex)
     */
    criarGraficoBarras(canvasId, labels, valores, percentuais, titulo, corBase) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        // Destruir gráfico anterior se existir
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        // Plugin customizado para desenhar o valor e o % em cima de cada barra
        const pluginRotulos = {
            id: 'pluginRotulos',
            afterDatasetsDraw: (chart) => {
                const ctx = chart.ctx;
                const dataset = chart.data.datasets[0];
                const meta = chart.getDatasetMeta(0);
                
                ctx.save();
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                
                meta.data.forEach((bar, index) => {
                    const valor = dataset.data[index];
                    const pct = percentuais[index];
                    
                    // Valor acima da barra
                    ctx.fillStyle = '#2c3e50';
                    ctx.fillText(valor.toLocaleString('pt-BR'), bar.x, bar.y - 18);
                    
                    // % acima do valor (em cor mais suave)
                    ctx.font = '600 11px sans-serif';
                    ctx.fillStyle = corBase;
                    ctx.fillText(`(${pct.toFixed(1)}%)`, bar.x, bar.y - 4);
                    
                    ctx.font = 'bold 12px sans-serif';
                });
                
                ctx.restore();
            }
        };
        
        const ctx = canvas.getContext('2d');
        
        // Criar gradiente vertical para as barras
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, corBase);
        gradient.addColorStop(1, this.ajustarCor(corBase, -30));
        
        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: titulo,
                    data: valores,
                    backgroundColor: gradient,
                    borderColor: this.ajustarCor(corBase, -20),
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.7,
                    categoryPercentage: 0.85
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                },
                layout: {
                    padding: {
                        top: 30,
                        bottom: 4
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'center',
                        labels: {
                            font: {
                                size: 13,
                                weight: '600'
                            },
                            color: '#2c3e50',
                            usePointStyle: true,
                            pointStyle: 'rectRounded',
                            padding: 12,
                            boxWidth: 14,
                            boxHeight: 14
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(44, 62, 80, 0.95)',
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 12,
                        cornerRadius: 6,
                        callbacks: {
                            label: (context) => {
                                const idx = context.dataIndex;
                                const valor = context.parsed.y;
                                const pct = percentuais[idx];
                                return [
                                    `  ${valor.toLocaleString('pt-BR')} itens`,
                                    `  ${pct.toFixed(1)}% do total do dia`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12,
                                weight: '600'
                            },
                            color: '#2c3e50'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            color: '#6c757d',
                            callback: (value) => value.toLocaleString('pt-BR')
                        }
                    }
                }
            },
            plugins: [pluginRotulos]
        });
        
        return this.charts[canvasId];
    }

    /**
     * Ajusta a luminosidade de uma cor hexadecimal
     */
    ajustarCor(hex, percent) {
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        
        r = Math.max(0, Math.min(255, r + percent));
        g = Math.max(0, Math.min(255, g + percent));
        b = Math.max(0, Math.min(255, b + percent));
        
        return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Destroi um gráfico específico
     */
    destruir(canvasId) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
            delete this.charts[canvasId];
        }
    }

    /**
     * Destroi todos os gráficos
     */
    destruirTodos() {
        Object.keys(this.charts).forEach(id => this.destruir(id));
    }
}

window.ComparativoCharts = ComparativoCharts;
