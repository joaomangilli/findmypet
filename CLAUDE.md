# FindMyPet — Guia para Claude

## Stack
- `/api` — Ruby on Rails 8.1 (API-only), PostgreSQL 16 + PostGIS, Sidekiq + Redis
- `/web` — Next.js 16, TypeScript, Tailwind CSS 4, Leaflet + OpenStreetMap
- Docker: PostgreSQL na porta **5434** (5432/5433 ocupadas por outros projetos)

## Comandos essenciais

### Backend (Rails)
```bash
# Sempre prefixar com RVM e variáveis de ambiente:
source ~/.rvm/scripts/rvm && rvm use 3.2.2 --quiet && \
  DB_HOST=localhost DB_PORT=5434 DB_USER=postgres DB_PASSWORD=postgres \
  DEVISE_JWT_SECRET_KEY=<secret> bundle exec <comando>

# Testes
bundle exec rails test

# Lint
bundle exec rubocop        # checar
bundle exec rubocop -A     # autocorrigir

# Migrations
rails db:migrate
RAILS_ENV=test rails db:drop db:create db:schema:load  # recriar test DB
```

### Frontend (Next.js)
```bash
cd web
npm test          # Jest (30 testes)
npm run lint      # ESLint
npm run dev       # servidor de desenvolvimento
```

### Docker
```bash
docker compose up -d   # sobe PostgreSQL (5434), Redis (6379), Evolution API (8080)
```

---

## Problemas conhecidos e soluções

### Rails

**1. `db/structure.sql` — pg_dump versão mismatch**
`pg_dump` local é v14, PostgreSQL no Docker é v16. Nunca rodar `db:schema:dump` localmente.
Para regenerar `structure.sql`:
```bash
docker exec findmypet-db-1 pg_dump --schema-only --no-privileges --no-owner \
  -T geography_columns -T geometry_columns -T spatial_ref_sys -T topology -T layer \
  -h localhost -U postgres findmypet_development > api/db/structure.sql
docker exec findmypet-db-1 psql -h localhost -U postgres -d findmypet_development -t \
  -c "SELECT 'INSERT INTO schema_migrations (version) VALUES (''' || version || ''');' \
      FROM schema_migrations ORDER BY version;" >> api/db/structure.sql
# Necessário para CI: postgis/postgis image já cria esses schemas no template
sed -i '' 's/^CREATE SCHEMA tiger;/CREATE SCHEMA IF NOT EXISTS tiger;/' api/db/structure.sql
sed -i '' 's/^CREATE SCHEMA tiger_data;/CREATE SCHEMA IF NOT EXISTS tiger_data;/' api/db/structure.sql
sed -i '' 's/^CREATE SCHEMA topology;/CREATE SCHEMA IF NOT EXISTS topology;/' api/db/structure.sql
```

**2. PostGIS no test DB**
A migração `20260414191505_enable_postgis.rb` habilita a extensão antes de criar tabelas com colunas `geography`. Sem ela, `create_announcements` falha com `type "geography" does not exist`.

**3. Testes em paralelo — segfault no pg gem (macOS ARM)**
`parallelize(workers: :number_of_processors)` causa segfault no `pg` gem no macOS ARM.
Solução: `parallelize(workers: 1)` em `test/test_helper.rb`.

**4. Active Storage — tabelas ausentes**
Rodar `rails active_storage:install` e migrar antes de qualquer teste que use `pet.photos`.

**5. Devise — sem `devise_for` as rotas ficam sem mapping**
Sem `devise_for :users` nas rotas, `Devise.mappings` fica vazio e a estratégia JWT do Warden não autentica ninguém (`current_user` sempre nil).
Solução: `devise_for :users, skip: :all` em `config/routes.rb` registra o mapping sem expor rotas Devise.

**6. `authenticate_user!` não disponível em `ActionController::API`**
`Devise::Controllers::Helpers` só é incluído em `ActionController::Base`.
Solução: definir manualmente no `ApplicationController`:
```ruby
def authenticate_user!
  render_error("Não autorizado", status: :unauthorized) unless current_user
end
```

**7. `warden` helper não disponível em `ActionController::API`**
O helper `warden` (atalho para `request.env['warden']`) não existe em API controllers.
Solução: usar `request.env["warden"].authenticate(scope: :user)` diretamente.

**8. Devise `:validatable` faz query em `users.email`**
`:validatable` gera SQL `WHERE users.email = $1`, mas a tabela não tem coluna `email` (só `phone`).
Solução: remover `:validatable` dos módulos Devise; as validações de `phone` já estão no modelo.

**9. Active Job — `assert_enqueued_with` exige adapter de teste**
Adicionar `config.active_job.queue_adapter = :test` em `config/environments/test.rb`.

**10. Faker — método inexistente**
`Faker::Name.full_name` não existe. Usar `Faker::Name.name`.

### Frontend (Next.js / ESLint)

**11. `setState` síncrono dentro de `useEffect`**
ESLint (`react-hooks/set-state-in-effect`) proíbe `setState` como primeira linha síncrona de um efeito.
Solução: usar lazy initializer do `useState`:
```tsx
// Errado:
const [x, setX] = useState(false);
useEffect(() => { setX(getValue()); ... }, []);

// Certo:
const [x] = useState(getValue);  // getValue() só é chamado na primeira renderização
```

**12. Mocks com `export default` anônimo**
ESLint (`import/no-anonymous-default-export`) rejeita `export default {}` e `export default ""`.
Solução: nomear antes de exportar:
```ts
const mock = {};
export default mock;
```
