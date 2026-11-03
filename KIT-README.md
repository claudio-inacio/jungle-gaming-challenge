# Kit Claude Code — Desafio Kurio NFT Marketplace

Copie todo o conteúdo desta pasta para a **raiz do repositório** do desafio (antes da Fase 0).

```
CLAUDE.md                      # memória do projeto (carregada sempre)
.mcp.json                      # Figma MCP + Playwright MCP
.claude/
├─ settings.json               # permissões + hook de formatação (prettier)
├─ agents/   (9 subagentes)
├─ rules/    (12 regras, a maioria carregada só nos caminhos certos)
└─ skills/   (10 skills)
docs/challenge/                # enunciado oficial (baixado pelo script)
docs/design/                   # screenshots do Figma (opcional)
scripts/setup-claude-kit.sh    # instala graphify e prepara docs
```

## Instalação
```bash
bash scripts/setup-claude-kit.sh
claude            # abre o Claude Code
/mcp              # autentica o Figma
/graphify .       # gera graphify-out/ (rode de novo após mudanças estruturais)
```

## Uso no dia a dia
- "Use a skill implement-task para a Fase 0 do roadmap."
- "Use o frontend-architect para planejar o carrinho (Fase 6)."
- "Peça ao code-reviewer para revisar o diff atual."
- "Use o quality-auditor para rodar o Lighthouse."

## Modelos
`frontend-architect` e `code-reviewer` usam **opus** (planejamento e revisão). Os executores usam **sonnet**. A sessão principal orquestra, porque subagentes não chamam outros subagentes.
