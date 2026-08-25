# Análise de Cortes de Produtos

Sistema web para análise de cortes de produtos, permitindo visualizar, filtrar e exportar dados processados de pedidos.

## 🚀 Funcionalidades

- **Dashboard com Cards**: Visualização rápida de métricas importantes
- **Filtros Avançados**: Filtre por data, empresa, pedido, código, produto e status
- **Tabela Interativa**: Ordenação, paginação e busca global
- **Exportação**: Exporte dados para CSV e Excel
- **Responsivo**: Funciona em dispositivos móveis e desktop

## 📁 Estrutura do Projeto
ANALISE CORTES PRODUTOS/
│
├── index.html # Estrutura HTML
├── css/
│ ├── base.css # Estilos base
│ ├── components.css # Componentes reutilizáveis
│ └── layout.css # Layout geral
├── js/
│ ├── config.js # Configurações
│ ├── dataLoader.js # Carregamento de dados
│ ├── dataProcessor.js # Processamento
│ ├── filters.js # Filtros
│ ├── table.js # Tabela
│ ├── cards.js # Cards
│ ├── export.js # Exportação
│ └── main.js # Inicialização
└── dados/
└── PEDIDOS A EXPEDIR.xlsx

text

## 🛠️ Tecnologias

- HTML5
- CSS3 (Grid/Flexbox)
- JavaScript (Vanilla)
- SheetJS (xlsx)

## 📦 Instalação

1. Clone o repositório
2. Coloque o arquivo Excel em `dados/`
3. Abra `index.html` no navegador

## 🔧 Configuração

As configurações principais estão em `js/config.js`:

```javascript
EXCEL_FILE_PATH: 'dados/PEDIDOS A EXPEDIR.xlsx'
📊 Processamento de Dados
O sistema processa as seguintes abas do Excel:

GERAL: Fonte principal

CORTE: Itens cortados

ABERTO: Itens em aberto

BS CAD: Base de cadastro

ESTCD: Estoque CD

🎨 Design
Cores por status:

🟢 Expedido: Verde

🟡 Aberto: Amarelo

🔴 Corte: Vermelho

📝 Licença
MIT License

text

## Instruções de Uso

1. **Preparação**:
   - Crie a estrutura de pastas conforme especificado
   - Coloque o arquivo Excel em `dados/PEDIDOS A EXPEDIR.xlsx`
   - Certifique-se de que todas as abas estão presentes

2. **Hospedagem no GitHub Pages**:
   - Crie um repositório no GitHub
   - Faça upload dos arquivos
   - Ative o GitHub Pages nas configurações
   - O site estará disponível em `https://seu-usuario.github.io/nome-repositorio/`

3. **Características Implementadas**:
   - ✅ Carregamento automático do Excel
   - ✅ Processamento e cruzamento de dados
   - ✅ Cards com estatísticas
   - ✅ Filtros dinâmicos
   - ✅ Tabela com ordenação e paginação
   - ✅ Exportação CSV/Excel
   - ✅ Design responsivo
   - ✅ Tratamento de erros
   - ✅ Barra de progresso
   - ✅ Botão de recarregar
   - ✅ Indicador de última atualização

O sistema está pronto para uso e pode ser personalizado conforme necessário!