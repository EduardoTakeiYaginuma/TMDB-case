# TMDB-case 🎬

Aplicação web de busca e avaliação de filmes usando a API pública do [TMDB](https://www.themoviedb.org/).

---

## Stack

| Camada       | Tecnologia                                                  |
|--------------|-------------------------------------------------------------|
| Frontend     | React 18 + TypeScript + Vite + Tailwind CSS                 |
| Estado       | Zustand                                                     |
| Roteamento   | React Router v6                                             |
| HTTP Client  | Axios                                                       |
| Backend      | Flask 3 + Flask-SQLAlchemy + Flask-Caching + Flask-CORS + Marshmallow |
| Banco        | SQLite (arquivo persistido via Docker volume)               |
| Infra        | Docker + docker-compose                                     |

---

## Como rodar com Docker (recomendado)

> Pré-requisitos: Docker e Docker Compose instalados.

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd TMDB-case

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env e adicione sua TMDB_API_KEY
# Obtenha gratuitamente em: https://www.themoviedb.org/settings/api

# 3. Suba tudo com um único comando
docker compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health

O backend aguarda o health check passar antes do frontend subir (`depends_on: service_healthy`).

---

## Como rodar localmente (sem Docker)

### Backend

```bash
cd TMDB-api
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Configure as variáveis de ambiente
cp .env.example .env             # adicione TMDB_API_KEY

python run.py
# API disponível em http://localhost:5000
```

### Frontend

```bash
cd TMDB-ui
npm install
npm run dev
# App disponível em http://localhost:3000
```

O frontend usa proxy Vite (`/api → localhost:5000`), sem necessidade de configurar CORS manualmente.

### Rodar os testes

```bash
cd TMDB-api
source .venv/bin/activate
pytest tests/ -v
```

---

## Variáveis de ambiente

| Variável         | Obrigatória | Descrição                                                  |
|------------------|-------------|-------------------------------------------------------------|
| `TMDB_API_KEY`   | **Sim**     | Chave da API TMDB (gratuita em themoviedb.org/settings/api) |
| `SECRET_KEY`     | Não         | Chave secreta Flask (padrão funciona em dev)                |
| `JWT_SECRET_KEY` | Não         | Chave para assinar tokens JWT (padrão: usa `SECRET_KEY`)    |
| `DATABASE_URL`   | Não         | SQLAlchemy URI (padrão: `sqlite:///cinerate.db`)            |
| `VITE_API_TARGET`| Não         | URL do backend para o proxy Vite (padrão: `localhost:5000`) |

---

## Endpoints da API

| Método   | Rota                                        | Descrição                             |
|----------|---------------------------------------------|---------------------------------------|
| `GET`    | `/api/health`                               | Health check                          |
| `POST`   | `/api/auth/register`                        | Cadastro — retorna user + JWT         |
| `POST`   | `/api/auth/login`                           | Login — retorna user + JWT            |
| `GET`    | `/api/movies/search?q=&page=`               | Busca filmes no TMDB                  |
| `GET`    | `/api/movies/genres`                        | Lista gêneros (cache 24h)             |
| `GET`    | `/api/movies/discover?genre_id=&year=&page=`| Filtra filmes por gênero/ano (cache 5min) |
| `GET`    | `/api/movies/trending`                      | Filmes em alta (cache 10min)          |
| `GET`    | `/api/movies/popular`                       | Filmes populares (cache 10min)        |
| `GET`    | `/api/movies/top-rated`                     | Filmes mais bem avaliados (cache 10min)|
| `GET`    | `/api/movies/<tmdb_id>`                     | Detalhes + elenco de um filme        |
| `GET`    | `/api/ratings`                              | Lista avaliações do usuário 🔒 JWT   |
| `POST`   | `/api/ratings`                              | Cria avaliação (1–5) 🔒 JWT          |
| `PUT`    | `/api/ratings/<tmdb_id>`                    | Atualiza avaliação 🔒 JWT            |
| `DELETE` | `/api/ratings/<tmdb_id>`                    | Remove avaliação 🔒 JWT              |

---

## Arquitetura do backend

```
TMDB-api/
├── app/
│   ├── config/        → Configurações e variáveis de ambiente
│   ├── controllers/   → Entrada/saída HTTP (parse request, retorna JSON)
│   ├── services/      → Regras de negócio e orquestração
│   │   ├── tmdb_client.py   → wrapper HTTP para a API TMDB (isolado)
│   │   ├── movie_service.py → normaliza dados TMDB para o frontend
│   │   └── rating_service.py → regras de negócio de avaliações
│   ├── repositories/  → Acesso ao banco de dados (SQLAlchemy)
│   ├── models/        → Modelos ORM (MovieRating)
│   ├── schemas/       → Serialização/validação (Marshmallow)
│   └── utils/         → Exceções tipadas (TMDBError, NotFoundError, etc.)
└── tests/
    ├── conftest.py          → Fixtures: app com SQLite in-memory + NullCache
    ├── test_rating_service.py → 13 testes unitários do RatingService
    └── test_movie_service.py  → 8 testes unitários do MovieService
```

**Fluxo de uma requisição:**

```
Request → Controller → Service → Repository → SQLite
                    ↓
              TMDBClient (para dados externos ao TMDB)
                    ↓
                  Cache (SimpleCache, TTL por rota)
```

**Responsabilidades:**
- **Controller** — recebe request, valida entrada via schema Marshmallow, retorna JSON com status correto
- **Service** — regras de negócio (validar nota 1–5, checar duplicatas, normalizar dados do TMDB)
- **Repository** — única camada que toca o banco; recebe e retorna objetos ORM
- **TMDBClient** — wrapper HTTP isolado; só lança `TMDBError`, nunca acessa banco

---

## Arquitetura do frontend

```
TMDB-ui/src/
├── components/        → UI reutilizável (SearchBar, MovieCard, StarRating, CastRow, modals)
├── pages/             → HomePage e RatedMoviesPage
├── services/          → axios instance + funções tipadas para movies e ratings
├── hooks/
│   ├── useDiscovery.ts  → trending/popular/top-rated em paralelo
│   ├── useMovieDetail.ts → detalhe com cancelamento de race condition
│   ├── useGenres.ts      → lista de gêneros (load único por sessão)
│   └── useDiscover.ts    → discover filtrado por gênero/ano com load more
├── store/             → Zustand: searchStore (com paginação) e ratingStore
├── types/             → interfaces Movie, Genre, Rating, etc.
└── utils/             → (reservado para futuros helpers)
```

**Estado global (Zustand):**
- `searchStore` — query, results, currentPage, totalPages, loading, loadingMore, error, hasSearched
- `ratingStore` — ratings[], loading, error, hasFetched (evita refetch desnecessário ao navegar)

---

## Features implementadas

### Backend
- [x] `POST /api/auth/register` — cadastro com username, e-mail e senha (bcrypt hash via Werkzeug)
- [x] `POST /api/auth/login` — autenticação, retorna JWT com validade de 7 dias
- [x] `GET /api/health` — health check
- [x] `GET /api/movies/search?q=&page=` — busca via TMDB com paginação
- [x] `GET /api/movies/genres` — lista de gêneros (cache 24h)
- [x] `GET /api/movies/discover?genre_id=&year=&page=` — filtra por gênero e/ou ano (cache 5min)
- [x] `GET /api/movies/trending|popular|top-rated` — discovery (cache 10min via Flask-Caching)
- [x] `GET /api/movies/<id>` — detalhes + elenco (1 request TMDB via `append_to_response`)
- [x] `GET /api/ratings` — lista avaliações ordenadas por `updated_at`
- [x] `POST /api/ratings` — cria avaliação com validação de nota 1–5 e detecção de duplicata (409)
- [x] `PUT /api/ratings/<tmdb_id>` — atualiza nota
- [x] `DELETE /api/ratings/<tmdb_id>` — remove avaliação (204 No Content)
- [x] Endpoints de ratings protegidos por `@jwt_required()` — avaliações isoladas por usuário
- [x] Tratamento de erros: TMDB timeout, connection error, 401, 404, 500
- [x] Arquitetura Controller / Service / Repository real, sem mistura de responsabilidades
- [x] Validação em dupla camada: Marshmallow (schema) + Service (regra de negócio)
- [x] **Cache** — trending/popular/top-rated em memória com TTL (Flask-Caching SimpleCache)
- [x] **Testes** — 22 testes unitários (pytest) cobrindo RatingService e MovieService, incluindo isolamento por usuário

### Frontend
- [x] Busca de filmes com campo de texto e submit por Enter ou botão
- [x] **Debounce** — auto-search após 500ms de inatividade (mínimo 2 caracteres)
- [x] Grid responsivo de cards (2 a 6 colunas conforme viewport)
- [x] Cards com pôster, título, ano de lançamento
- [x] Badge de avaliação nos cards de filmes já avaliados
- [x] Estados de loading, erro (com retry) e sem resultados
- [x] Modal de detalhes: backdrop, pôster, título, data, runtime, gêneros, nota TMDB
- [x] Sinopse e elenco (top 10) com foto circular e fallback de iniciais
- [x] Sistema de avaliação com 3 estados: criar / exibir / editar
- [x] Editar e remover avaliação a partir do modal
- [x] Fecha com Escape, clique no backdrop ou botão ✕
- [x] Página "Filmes Avaliados" com grid, estrelas e contador
- [x] **Ordenação** na página de avaliados: mais recentes, mais antigas, maior nota, menor nota
- [x] **Paginação** — "Carregar mais" nos resultados de busca (appenda resultados)
- [x] **Filtro por gênero** — chips clicáveis na tela de discovery
- [x] **Filtro por ano** — dropdown na tela de discovery
- [x] **Carregar mais** no discover filtrado por gênero/ano
- [x] Sincronização automática da store ao criar, editar e remover (atualização otimista)
- [x] Evita re-fetch desnecessário ao navegar entre páginas (`hasFetched`)
- [x] **Autenticação** — modal de login/cadastro com tabs, persistência do token em localStorage via Zustand persist
- [x] Token JWT enviado automaticamente em toda requisição protegida via interceptor Axios
- [x] Expiração de token tratada: 401 limpa estado e exibe prompt de login

---

## Features não implementadas

Todas as features obrigatórias e bônus foram implementadas.

---

## Decisões técnicas

- **SQLite:** banco de dados simples que não requer um container separado, ideal para desenvolvimento local.
- **Cache:** resultados de trending, popular e top-rated são cacheados para reduzir chamadas à API do TMDB.
- **JWT:** autenticação stateless — cada requisição valida o token sem manter sessão no servidor.
- **Docker:** facilita que qualquer pessoa execute a aplicação completa com um único comando.

---

## Uso de IA

Este projeto foi implementado com auxílio do **Claude Code (Anthropic Claude Sonnet 4.6)** como ferramenta de desenvolvimento assistido. O uso incluiu:

- Geração da estrutura inicial de boilerplate (Flask factory, Vite config, docker-compose)
- Implementação das camadas Controller / Service / Repository seguindo as especificações do teste
- Componentes React (modal, star rating, cast row) com Tailwind
- Diagnóstico e correção de erros TypeScript
- Implementação das features de bônus: cache (Flask-Caching), filtro por gênero/ano, paginação, debounce, ordenação e testes pytest

Todo o código foi revisado linha a linha, testado e é compreendido integralmente.

