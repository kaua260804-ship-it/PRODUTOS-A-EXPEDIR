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
        
        // Animar números
        this.animateNumber('cardTotalSKUs', stats.totalSKUs);
        this.animateNumber('cardAberto', stats.abertoItems);
        this.animateNumber('cardCorte', stats.corteItems);
        this.animateNumber('cardExpedido', stats.expedidoItems);
        
        // Atualizar porcentagens
        document.getElementById('cardAbertoPct').textContent = stats.abertoPercent.toFixed(1) + '%';
        document.getElementById('cardCortePct').textContent = stats.cortePercent.toFixed(1) + '%';
        document.getElementById('cardExpedidoPct').textContent = stats.expedidoPercent.toFixed(1) + '%';
        
        console.log('Cards atualizados:', stats);
    }

    /**
     * Anima a mudança de número
     */
    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const currentValue = parseInt(element.textContent) || 0;
        const difference = targetValue - currentValue;
        
        if (difference === 0) {
            element.textContent = targetValue;
            return;
        }
        
        const duration = 500; // ms
        const startTime = performance.now();
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Easing cúbico
            
            const currentNumber = Math.round(currentValue + (difference * easeProgress));
            element.textContent = currentNumber;
            
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