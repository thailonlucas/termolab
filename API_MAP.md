# Thermo-Guard — Mapa de APIs e Conexões Externas

> Gerado em 2026-06-15. Cobre todos os arquivos em `src/`.

---

## Visão Geral

O app depende de **um único serviço externo**: [Supabase](https://supabase.com) (`jgalaldaeicbzlifwiup.supabase.co`).  
Toda comunicação passa pelo SDK `@supabase/supabase-js`. Não há chamadas `fetch()` ou `axios` para APIs externas.

---

## 1. Configuração do Cliente

| Contexto | Arquivo | Variáveis de Ambiente |
|---|---|---|
| Client-side (browser) | `src/integrations/supabase/client.ts` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Server-side (SSR / middleware) | `src/integrations/supabase/client.server.ts` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Auth middleware (servidor) | `src/integrations/supabase/auth-middleware.ts` | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` |

### Variáveis de Ambiente Necessárias

```env
# .env (client)
VITE_SUPABASE_URL=https://jgalaldaeicbzlifwiup.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key>

# .env (server)
SUPABASE_URL=https://jgalaldaeicbzlifwiup.supabase.co
SUPABASE_PUBLISHABLE_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>  # bypassa RLS
```

---

## 2. Autenticação (Supabase Auth)

Arquivo principal: `src/lib/auth-context.tsx` · `src/routes/auth.tsx`

| Operação | Método SDK | Onde | Detalhe |
|---|---|---|---|
| Login | `auth.signInWithPassword({ email, password })` | `auth.tsx:34` | Retorna sessão com JWT |
| Cadastro | `auth.signUp({ email, password, options: { emailRedirectTo, data: { full_name } } })` | `auth.tsx:38-45` | Envia e-mail de confirmação |
| Recuperar senha | `auth.resetPasswordForEmail(email, { redirectTo })` | `auth.tsx:50-52` | Link de reset por e-mail |
| Escutar estado | `auth.onAuthStateChange(callback)` | `auth-context.tsx:24` | Subscription contínua |
| Sessão atual | `auth.getSession()` | `auth-context.tsx:28` | Mount inicial |
| Logout | `auth.signOut()` | `auth-context.tsx:42` | Limpa localStorage |
| Validar token (servidor) | `auth.getClaims(token)` | `auth-middleware.ts:63` | Middleware SSR |

**Armazenamento:** JWT salvo em `localStorage` com auto-refresh habilitado.

---

## 3. Banco de Dados — Tabelas

### `handlings`

Pendente: GET para buscar os dados pela etiqueta (numero da nota, cliente, destino, sede, volumes, medicamentos...)

| Operação | Colunas / Filtros | Arquivo | Linha |
|---|---|---|---|
| SELECT | `id` · filtro `box_id` + `created_by` | `handling-api.ts` | 22-28 |
| SELECT | `nf_key, sender, destination, locations(name)` · filtro `box_id` | `new-box.tsx` | 39-45 |
| SELECT | `id, box_id, status, started_at, next_session_at` · order `started_at DESC` | `index.tsx` | 36-40 |
| SELECT | `id` (count exact, head) · filtro data para alertas | `index.tsx` | 66-69 |
| SELECT | `id, box_id, status, started_at, next_session_at, handling_sessions(id, started_at)` | `history.index.tsx` | 32-40 |
| SELECT | `*, owners(name)` · filtro `id` | `history.$handlingId.tsx` | 301-305 |
| INSERT | `created_by, box_id, destination, sender, nf_key, draft_doc, next_session_at` | `handling-api.ts` | 43-54 |
| UPDATE | `{ next_session_at }` · filtro `id` | `handling-api.ts` | 36-38 |

### `handling_sessions`

| Operação | Colunas / Filtros | Arquivo | Linha |
|---|---|---|---|
| INSERT | `handling_id, created_by` | `handling-api.ts` | 61-64 |
| SELECT | `id` (count exact) · filtro `started_at >= since` (contagem diária) | `index.tsx` | 52-56 |
| SELECT | Nested com `movements`, `movement_types`, `movement_files` | `history.$handlingId.tsx` | 314-328 |
| UPDATE | `{ status: "approved", approved_by: user.id }` · filtro `id` | `history.$handlingId.tsx` | 359-361 |

### `movements`

| Operação | Colunas | Arquivo | Linha |
|---|---|---|---|
| INSERT | `session_id, handling_id, movement_type_id, created_by, temperature_val, notes, occurred_at, metadata` | `handling-api.ts` | 72-85 |

### `movement_types`

| Operação | Colunas / Filtros | Arquivo | Linha |
|---|---|---|---|
| SELECT | `id, name, label, description, requires_photo, requires_temperature, icon` · filtro `is_active = true` | `wizard.tsx` | 94-100 |

### `movement_files`

| Operação | Colunas | Arquivo | Linha |
|---|---|---|---|
| INSERT | `movement_id, storage_path, file_name, mime_type` | `handling-api.ts` | 96-102 |

### `profiles`

| Operação | Colunas / Filtros | Arquivo | Linha |
|---|---|---|---|
| SELECT | `id, full_name` · filtro `id IN (approverIds)` | `history.$handlingId.tsx` | 342-350 |

### `locations` *(via join)*
Referenciada como join em `handlings.select("..., locations(name)")` — sem operações diretas.
- GET de locations

### `owners` *(via join)*

Referenciada como join em `handlings.select("*, owners(name)")` — sem operações diretas.
Pendete:  GET de Owners - Donos dos pacotes, clientes da Vestra

---

## 4. Storage

**Bucket:** `handling-photos`

| Operação | Método SDK | Path do Arquivo | Arquivo | Linha |
|---|---|---|---|---|
| Upload foto | `storage.from("handling-photos").upload(path, blob, { contentType: "image/jpeg" })` | `{userId}/{movementId}/{timestamp}.jpg` | `handling-api.ts` | 92-95 |
| Gerar URL assinada | `storage.from("handling-photos").createSignedUrl(path, 3600)` | Expira em 1 hora | `handling-api.ts` | 117-121 |
| Exibir foto | Usa URL assinada retornada acima | — | `history.$handlingId.tsx` | 101, 226 |

---

## 5. Permissões RLS (Row Level Security)

| Cliente | Chave usada | Acesso |
|---|---|---|
| Browser (client) | `anon` / JWT do usuário | Restrito pelas políticas RLS |
| Servidor (SSR) | `service_role` | Bypassa RLS — operações admin |

---

## 6. Bibliotecas de Terceiros (sem chamada de rede)

| Biblioteca | Versão mínima | Propósito |
|---|---|---|
| `jsqr` | ^1.4 | Leitura de QR code via frame de vídeo — roda inteiramente no client |
| `@supabase/supabase-js` | ^2 | SDK principal para todas as operações acima |
| `@tanstack/react-query` | ^5 | Cache e estado de queries assíncronas |
| `@tanstack/react-router` | ^1 | Roteamento + SSR |
| `@tanstack/react-start` | ^1 | Framework SSR / middleware de servidor |
| `sonner` | ^1 | Toasts de feedback ao usuário |
| `recharts` | ^2 | Gráficos (disponível, não ativado) |
| `@radix-ui/*` | ^1 | Componentes UI acessíveis |
| `lucide-react` | ^0.4 | Ícones |

---

## 7. APIs de Browser Utilizadas

| API | Onde | Finalidade |
|---|---|---|
| `navigator.mediaDevices.getUserMedia` | `CameraCapture.tsx:43` | Acesso à câmera traseira para QR/fotos |
| `requestAnimationFrame` | `CameraCapture.tsx:94` | Loop de scan do QR code |
| `localStorage` | Supabase client | Persistência da sessão JWT |
| `HTMLCanvasElement.toDataURL` | `CameraCapture.tsx:149` | Converter frame de vídeo em JPEG |

> **Requisito:** A câmera só funciona em contexto seguro (**HTTPS** ou `localhost`).

---

## 8. Checklist para Novo Ambiente

- [ ] Criar projeto Supabase e copiar URL + chaves
- [ ] Configurar `.env` com as 3 variáveis de ambiente
- [ ] Criar as tabelas: `handlings`, `handling_sessions`, `movements`, `movement_types`, `movement_files`, `profiles`, `locations`, `owners`
- [ ] Criar o bucket `handling-photos` (privado, com RLS)
- [ ] Configurar políticas RLS em cada tabela
- [ ] Habilitar Supabase Auth com e-mail/senha
- [ ] Configurar `emailRedirectTo` no provider de e-mail para reset de senha
- [ ] Garantir HTTPS no deploy (obrigatório para acesso à câmera)
