# Sev7n CRM — Lumix Recovery Dashboard

Dashboard de recuperação de vendas e pipeline de leads da Sev7n (produto: Cofre Americano).

Stack: React 19 · TanStack Router · Tailwind 4 · Supabase · Recharts · Vite

---

## Desenvolvimento local

```bash
npm install
cp .env.example .env   # preencher com as credenciais do Supabase
npm run dev
```

Variáveis de ambiente necessárias (ver `.env.example`):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

> `VITE_*` são embutidas no bundle em tempo de build — precisam estar disponíveis no momento do `npm run build`.

---

## Deploy no EasyPanel (VPS)

O projeto inclui `Dockerfile` multi-stage (build Node + runtime nginx servindo o SPA) e `nginx.conf` com fallback para `index.html`.

### Passo a passo

1. No EasyPanel, criar um novo **App** → tipo **Dockerfile**.
2. Conectar o repositório `LuisGuilhermeLumix/sev7n-CRM`.
3. Em **Build Settings**, configurar os **Build Args** (Vite embute em tempo de build):
   - `VITE_SUPABASE_URL` = URL do projeto Supabase
   - `VITE_SUPABASE_ANON_KEY` = anon key do projeto Supabase
4. Porta interna exposta pelo container: **80**.
5. Salvar → Deploy. O EasyPanel vai buildar a imagem e publicar.
6. Associar o domínio + ativar SSL (Let's Encrypt) pelo painel.

### Testar o build localmente via Docker

```bash
docker build \
  --build-arg VITE_SUPABASE_URL="https://xxx.supabase.co" \
  --build-arg VITE_SUPABASE_ANON_KEY="eyJhbGc..." \
  -t sev7n-crm .

docker run -p 8080:80 sev7n-crm
# abrir http://localhost:8080
```

### Atualizações

Basta um `git push` na branch conectada — o EasyPanel rebuilda automaticamente (se auto-deploy estiver ativado).

---

## Estrutura principal

```
src/
├── components/      # Sidebar, AppLayout, PageHeader, MetricCard, LeadsTable, RecoveryChart
├── hooks/           # useAuth, useFilters, useMetrics, useLeads, useChartData
├── lib/             # supabase client, tables, metrics, events, dates, format
├── routes/          # login, dashboard, pipeline (TanStack Router file-based)
└── styles.css       # Tailwind + tokens de design
```

## Dados

Tudo vem da tabela `sev7n_info_br_CRM` no Supabase. O nome fica centralizado em `src/lib/tables.ts` (`CRM_TABLE`).

Colunas específicas da Sev7n:

- `kit` (text): `Kit 1` (R$ 197), `Kit 2` (R$ 247), `Kit 3` (R$ 297) ou `null`. É o filtro "Kit" do Dashboard e a etiqueta dos cards no Pipeline.
- `upsell` (boolean): `true` quando a venda não é do Cofre Americano.

## Regras de métricas

- **Venda recuperada**: `Event = order_paid`, `utm_source` contendo `WPP` e `upsell = false`.
- **Upsell**: soma só no Faturamento Total (Front). Não conta como venda recuperada, valor recuperado, ticket médio nem comissão, mesmo com `utm_source` WPP.
- **Faturamento Total (Front)**: soma de todo `order_paid` menos o valor recuperado.
- **Comissão Lumix**: 20% sobre o valor recuperado.
