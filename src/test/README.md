# Testes

## Scripts de Teste

Para executar os testes, adicione os seguintes scripts ao package.json:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Estrutura de Testes

- **Unit Tests**: Testam funções e serviços isoladamente
- **Component Tests**: Testam componentes React
- **Integration Tests**: Testam fluxos completos da aplicação
- **Hook Tests**: Testam custom hooks

## Cobertura de Testes

- ✅ LoteriasApiService - Consumo da API
- ✅ LotteryAnalysisService - Análise estatística  
- ✅ LotteryCard - Componente principal
- ✅ useLotteryData - Hook de dados
- ✅ Integração completa da aplicação
- ✅ Utilities (cn function)

## Como Executar

```bash
# Executar todos os testes
npm run test

# Executar testes com interface visual
npm run test:ui

# Executar com cobertura
npm run test:coverage
```