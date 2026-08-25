/**
 * Gerencia os cards de resumo/dashboard
 */

class Cards {
    constructor(dataProcessor) {
        this.dataProcessor = dataProcessor;
        this.initializeEventListeners();
    }

    /**
     * Inicializa os event listeners
     */
    initializeEventListeners() {
        document.addEventListener('dataFiltered', (e) => {
            this.updateCards(e.detail.filteredData);
        });
    }

    /**
     * Atualiza os cards com dados filtrados
     */
    updateCards(filteredData) {
        const stats = this.dataProcessor.getStatistics(filteredData);
        
        // Atualizar card de total (agora é "ITENS PEDIDOS" com contagem normal)
        const totalElement = document.getElementById('cardTotalSKUs');
        totalElement.textContent = stats.totalItens.toLocaleString('pt-BR');
        
        // Atualizar label do card de total
        const totalLabel = totalElement.parentElement.querySelector('.card-label');
        if (totalLabel) {
            totalLabel.textContent = 'Itens Pedidos';
        }
        
        // Animar números dos outros cards
        this.animateNumber('cardAberto', stats.abertoItems);
        this.animateNumber('cardCorte', stats.corteItems);
        this.animateNumber('cardExpedido', stats.expedidoItems);
        
        // Atualizar porcentagens
        document.getElementById('cardAbertoPct').textContent = stats.abertoPercent.toFixed(1) + '%';
        document.getElementById('cardCortePct').textContent = stats.cortePercent.toFixed(1) + '%';
        document.getElementById('cardExpedidoPct').textContent = stats.expedidoPercent.toFixed(1) + '%';
        
        console.log('Cards atualizados:', {
            totalItens: stats.totalItens,
            aberto: stats.abertoItems,
            corte: stats.corteItems,
            expedido: stats.expedidoItems
        });
    }

    /**
     * Anima a mudança de número
     */
    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const currentValue = parseInt(element.textContent.replace(/\./g, '')) || 0;
        const difference = targetValue - currentValue;
        
        if (difference === 0) {
            element.textContent = targetValue.toLocaleString('pt-BR');
            return;
        }
        
        const duration = 500; // ms
        const startTime = performance.now();
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Easing cúbico
            
            const currentNumber = Math.round(currentValue + (difference * easeProgress));
            element.textContent = currentNumber.toLocaleString('pt-BR');
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        
        requestAnimationFrame(updateNumber);
    }

    /**
     * Define os dados iniciais dos cards
     */
    setInitialData(data) {
        this.updateCards(data);
    }
}

// Exportar classe
window.Cards = Cards;