📘 README.md - MultiComanda (Modo Simulação)
markdown
# 🍽️ MultiComanda - Sistema de Controle de Mesas

![Versão](https://img.shields.io/badge/versão-2.0.0--simulação-purple)
![Licença](https://img.shields.io/badge/licença-MIT-green)
![Status](https://img.shields.io/badge/status-demonstração-blue)
![Segurança](https://img.shields.io/badge/segurança-100%25%20simulado-success)

## 🎭 Sobre o Projeto

O **MultiComanda** é um sistema de **demonstração** para controle de mesas em restaurantes, desenvolvido para fins educacionais e de apresentação. Esta versão opera **100% em modo simulação**, sem qualquer armazenamento de dados reais ou conexão com bancos de dados.

### 🎯 Objetivo
- Demonstrar conceitos de interface para sistemas de restaurante
- Apresentar fluxos de trabalho para garçons
- Servir como material de estudo e referência
- **Sem riscos de segurança** - todos os dados são fictícios

---

## ⚠️ Aviso Importante
╔══════════════════════════════════════════════════════════════╗
║ ║
║ 🧪 MODO SIMULAÇÃO 🧪 ║
║ ║
║ Este é um sistema 100% fictício para demonstração. ║
║ Nenhum dado real é armazenado ou processado. ║
║ Todos os dados são perdidos ao recarregar a página. ║
║ ║
║ ✅ 100% SEGURO - Pode testar à vontade! ║
║ ║
╚══════════════════════════════════════════════════════════════╝

text

---

## ✨ Funcionalidades

### 🪑 **Gerenciamento de Mesas**
- Configurar quantidade de mesas (1 a 50)
- Visualização em grade ou lista
- Filtros: Todas, Ativas, Fechadas, Minhas
- Status visual por cores

### ⏱️ **Controle de Tempo**
- Timer automático ao abrir mesa
- Formato HH:MM:SS
- Pausar/retomar tempo
- Registro no histórico

### 💰 **Registro de Consumo**
- Adicionar itens com nome e valor
- Editar e excluir itens
- Cálculo automático do total
- Histórico completo

### 🧾 **Fechamento de Mesa**
- Cálculo de gorjeta percentual
- Formas de pagamento
- Feedback do cliente
- Total final com gorjeta

### 📊 **Dashboard**
- Total de mesas
- Mesas ativas e fechadas
- Faturamento do dia
- Tempo médio de atendimento
- Ticket médio
- Percentual de ocupação

### 🔄 **Transferência de Mesas**
- Mudar garçom responsável
- Verificação simulada
- Registro no histórico

---

## 🚀 Como Usar

### 1. **Acessar o Sistema**
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/multicoma.git

# Entre na pasta
cd multicoma

# Abra o arquivo index.html no navegador
# ou use um servidor local:
python -m http.server 8000
# Depois acesse: http://localhost:8000
2. Fazer Login (Simulado)
text
╔══════════════════════════════════════╗
║   QUALQUER USUÁRIO E SENHA FUNCIONA! ║
╚══════════════════════════════════════╝

Sugestões para teste:
┌────────────┬──────────┬────────────────┐
│ Usuário    │ Senha    │ Perfil         │
├────────────┼──────────┼────────────────┤
│ joao       │ 123      │ Garçom básico  │
│ maria      │ 456      │ Garçom avançado│
│ admin      │ admin    │ Supervisor     │
│ teste      │ qualquer │ Testes gerais  │
└────────────┴──────────┴────────────────┘
3. Fluxo Básico





🎯 Cenários de Teste
📋 Cenário 1: Dia Normal
text
1. Login com usuário "joao"
2. Abrir mesa 1 (2 pessoas)
3. Adicionar "Coca-Cola" (R$ 8,00)
4. Adicionar "Pizza" (R$ 45,00)
5. Abrir mesa 2 (4 pessoas)
6. Adicionar "Cerveja" (R$ 12,00)
7. Fechar mesa 1
8. Verificar dashboard
🔄 Cenário 2: Transferência
text
1. Login com usuário "joao"
2. Abrir mesa 3
3. Clicar em "Transferir"
4. Digitar "maria" como novo garçom
5. Fazer login como "maria"
6. Verificar que mesa 3 aparece como "Minha"
🎭 Cenário 3: Múltiplas Mesas
text
1. Login com usuário "admin"
2. Clicar em "Abrir Múltiplas Mesas"
3. Selecionar mesas 4,5,6,7
4. Definir 3 pessoas para todas
5. Confirmar
6. Verificar todas abertas na grade
🏗️ Estrutura do Projeto
text
multicoma/
├── 📄 index.html          # Interface principal
├── 📄 style.css           # Estilos do sistema
├── 📄 app.js              # Lógica da aplicação
└── 📄 README.md           # Este arquivo
🛠️ Tecnologias Utilizadas
Tecnologia	Versão	Finalidade
HTML5	-	Estrutura das páginas
CSS3	-	Estilização responsiva
JavaScript	ES6+	Lógica do sistema
Font Awesome	6.0.0	Ícones vetoriais
Nota: Esta versão NÃO utiliza Firebase ou qualquer banco de dados real.

🎨 Status das Mesas
Status	Cor	Significado	Ações
🟢 Livre	Verde	Disponível	Abrir
🟡 Ativa	Amarelo	Em atendimento	Pausar, Fechar, Cancelar, Transferir
🟠 Pausada	Laranja	Tempo congelado	Retomar, Fechar, Cancelar
⚪ Fechada	Cinza	Finalizada	Visualizar
📊 Exemplos de Dados (Fictícios)
Mesa em Atendimento
json
{
  "numero": 5,
  "status": "ativa",
  "pessoas": 4,
  "garcomNome": "João",
  "abertaEm": "2024-01-01T19:00:00",
  "consumo": [
    { "nome": "Coca-Cola", "valor": 8.00 },
    { "nome": "Pizza Calabresa", "valor": 45.00 },
    { "nome": "Sobremesa", "valor": 15.00 }
  ],
  "valorTotal": 68.00,
  "tempoDecorrido": "00:45:30"
}
Dashboard
json
{
  "totalMesas": 12,
  "ativas": 3,
  "fechadasHoje": 5,
  "faturamento": 450.00,
  "tempoMedio": 45,
  "ocupacao": 25
}
🔒 Segurança - Por que não há riscos?
✅ Sem Dados Reais - Tudo é gerado na memória do navegador
✅ Sem Banco de Dados - Nenhuma conexão externa
✅ Login Fictício - Qualquer usuário/senha funciona
✅ Reset Automático - Dados são perdidos ao recarregar
✅ Código Aberto - Pode ser inspecionado livremente
✅ Sem Cookies - Não utiliza rastreamento
✅ Sem Armazenamento - Nada é salvo permanentemente

❓ Perguntas Frequentes
1. Preciso instalar algo?
Não! Basta abrir o arquivo index.html no navegador.

2. Os dados são salvos em algum lugar?
Não. Todos os dados existem apenas na memória RAM durante a sessão.

3. Posso usar em produção?
Não. Esta é uma versão de demonstração. Para uso real, seria necessário implementar autenticação e banco de dados.

4. Funciona offline?
Sim! Após carregar os ícones do Font Awesome (primeiro acesso), funciona completamente offline.

5. É seguro testar?
✅ 100% seguro! Por ser uma simulação, não há riscos de vazamento de dados.

6. Como resetar os dados?
Basta recarregar a página (F5) ou fechar e abrir o navegador.

🚧 Limitações da Versão de Simulação
⚠️ Dados não persistem entre recarregamentos

⚠️ Login não é verificado (qualquer usuário funciona)

⚠️ Não há integração com banco de dados real

⚠️ Valores são apenas para demonstração

⚠️ Não recomendado para uso em produção

📝 Licença
Este projeto está sob a licença MIT - veja o arquivo LICENSE para detalhes.

text
MIT License

Copyright (c) 2026 MultiComanda

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
👥 Contribuição
Contribuições são bem-vindas! Para contribuir:

Fork o projeto

Crie uma branch (git checkout -b feature/nova-funcionalidade)

Commit suas mudanças (git commit -m 'Adiciona nova funcionalidade')

Push para a branch (git push origin feature/nova-funcionalidade)

Abra um Pull Request

📞 Contato
Issues: GitHub Issues

Email: simulacao@multicoma.com

Documentação: docs.multicoma.com

🙏 Agradecimentos
Comunidade de desenvolvedores open source

Font Awesome pelos ícones incríveis

Todos que testaram e contribuíram

🎭 Versão de Simulação
text
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🧪 MULTICOMDA - MODO SIMULAÇÃO v2.0 🧪                     ║
║                                                               ║
║   Projeto educacional sem fins comerciais                     ║
║   Criado para demonstrar conceitos de interface               ║
║   e fluxos de trabalho para sistemas de restaurante           ║
║                                                               ║
║   ✅ 100% SEGURO - Todos os dados são fictícios               ║
║   ✅ Totalmente demonstrativo - Use à vontade!                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
Desenvolvido com ❤️ para fins educacionais
Última atualização: Março 2026

text

Este README.md:

✅ **Destaca que é uma simulação** - Avisos claros no início  
✅ **Explica a segurança** - Seção dedicada sobre ausência de riscos  
✅ **Mostra como usar** - Passo a passo para testes  
✅ **Inclui cenários** - Exemplos práticos de uso  
✅ **Tem perguntas frequentes** - Responde dúvidas comuns  
✅ **Usa emojis e formatação** - Visual atraente e organizado  
✅ **É 100% informativo** - Todas as informações necessárias  

Perfeito para acompanhar o projeto no GitHub! 🚀
quero somente um texto em mardown
MultiComanda - Sistema de Controle de Mesas (Modo Simulação)
Sobre o Projeto
O MultiComanda é um sistema de demonstração para controle de mesas em restaurantes. Esta versão opera 100% em modo simulação, sem qualquer armazenamento de dados reais.

⚠️ AVISO: MODO SIMULAÇÃO - Todos os dados são fictícios e perdidos ao recarregar a página. 100% seguro para testes.

Funcionalidades
Gerenciamento de Mesas: Configurar quantidade, visualizar em grade/lista, filtrar por status

Controle de Tempo: Timer automático, pausar/retomar

Registro de Consumo: Adicionar, editar e excluir itens

Fechamento: Cálculo de gorjeta, formas de pagamento, feedback

Dashboard: Estatísticas em tempo real

Transferência: Mudar garçom responsável

Como Usar
Abra o arquivo index.html no navegador

Faça login (qualquer usuário/senha funciona)

Teste à vontade!

Sugestões de login:

joao / 123

maria / 456

admin / admin

Status das Mesas
Status	Cor	Significado
Livre	Verde	Disponível
Ativa	Amarelo	Em atendimento
Pausada	Laranja	Tempo congelado
Fechada	Cinza	Finalizada
Segurança
✅ Sem dados reais
✅ Sem banco de dados
✅ Login fictício
✅ Reset ao recarregar
✅ Código aberto

Licença
MIT License - Projeto educacional sem fins comerciais.