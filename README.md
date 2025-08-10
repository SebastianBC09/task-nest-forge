# Tasks Backend — Forge Task 🚀

[![NestJS](https://img.shields.io/badge/NestJS-9.x-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Postgres](https://img.shields.io/badge/Postgres-17-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-4.x-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Google Cloud Run](https://img.shields.io/badge/Cloud%20Run-GCP-4285F4?style=flat-square&logo=googlecloud)](https://cloud.google.com/run)

Backend para la prueba técnica **Forge Task** — API REST para gestor de tareas personales desarrollada con NestJS, Prisma y PostgreSQL 17. Implementa arquitectura hexagonal con separación clara de responsabilidades y despliegue en Google Cloud Run.

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Funcionalidades](#-funcionalidades)
- [Arquitectura](#-arquitectura)
  - [Estructura de Directorios](#-estructura-de-directorios)
  - [Diagrama de Alto Nivel](#diagrama-de-alto-nivel)
  - [POJOs, DTOs y Responsabilidades por Capa](#pojos-dtos-y-responsabilidades-por-capa)
- [Tecnologías](#-tecnologías-y-dependencias)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación-local-y-ejecución)
- [Configuración de Prisma](#-prisma--setup-y-migraciones)
- [Docker y Despliegue](#-docker-y-despliegue-a-google-cloud-run)
- [Endpoints Principales](#-endpoints-principales--ejemplos-curl)
- [Scripts Disponibles](#-scripts-disponibles)
- [Decisiones Técnicas](#-decisiones-técnicas)
- [Buenas Prácticas](#-buenas-prácticas)
- [Seguridad](#-seguridad)
- [Checklist para Entrega](#-checklist-para-entrega)
- [Riesgos y Recomendaciones](#-riesgos-y-recomendaciones-para-producción)
- [Contacto](#-contacto)

---

## 📖 Descripción

Backend para la gestión de tareas personales desarrollado con arquitectura hexagonal y mejores prácticas de desarrollo. La API REST permite operaciones CRUD completas con separación por usuario y persistencia robusta.

### ✨ Funcionalidades

**Funcionalidades principales:**

- **CRUD completo de tareas**: Crear, listar, actualizar parcial y eliminar (soft delete)
- **Gestión de estados**: Marcar tareas como `COMPLETED` / `PENDING` vía endpoint dedicado
- **Separación por usuario**: Cada petición requiere header `x-user-id` (UUID) para aislamiento de datos
- **Persistencia robusta**: PostgreSQL con Prisma como ORM/Client
- **Arquitectura hexagonal**: Separación clara entre dominio, aplicación e infraestructura

La autenticación se maneja mediante headers personalizados y cada usuario solo puede acceder a sus propias tareas.

---

## 🏗️ Arquitectura

### 📁 Estructura de Directorios

```
server/
├─ src/
│   ├─ domain/                     # Lógica de negocio y reglas de dominio
│   │   ├─ entities/               # Task, User (con métodos de negocio)
│   │   ├─ value-objects/          # Title, UserId, etc.
│   │   └─ repositories/           # Interfaces (TaskRepository, UserRepository)
│   ├─ application/                # Casos de uso y servicios de aplicación
│   │   ├─ dtos/                   # Commands y DTOs de aplicación
│   │   └─ services/               # Create/Update/List/Delete/ChangeStatus
│   ├─ infrastructure/             # Implementaciones técnicas
│   │   ├─ persistence/            # PrismaService, módulos de persistencia
│   │   ├─ http/                   # Controllers y DTOs HTTP
│   │   └─ auth/                   # HeaderUserGuard (x-user-id)
│   ├─ common/                     # Pipes, filters, guards compartidos
│   ├─ config/                     # Configuraciones de la aplicación
│   ├─ app.module.ts               # Módulo raíz de la aplicación
│   └─ main.ts                     # Bootstrap de la aplicación
├─ prisma/                         # Configuración y migraciones de BD
│   └─ schema.prisma               # Esquema de base de datos
├─ Dockerfile                      # Imagen Docker para despliegue
├─ entrypoint.sh                   # Script de inicialización del contenedor
└─ README.md                       # Documentación del proyecto
```

### Diagrama de Alto Nivel

```mermaid
flowchart TB
  subgraph Client["Cliente"]
    C[Flutter App]
  end

  subgraph HTTP["Capa HTTP"]
    Ctrl[TasksController]
    Guard[HeaderUserGuard]
    ValidationPipe[ValidationPipe]
  end

  subgraph App["Capa de Aplicación"]
    CreateSvc[CreateTaskService]
    ListSvc[ListTasksService]
    UpdateSvc[UpdateTaskService]
    DeleteSvc[DeleteTaskService]
    StatusSvc[ChangeStatusService]
  end

  subgraph Domain["Capa de Dominio"]
    TaskEntity[Task Entity]
    UserEntity[User Entity]
    TaskRepo[TaskRepository Interface]
    UserRepo[UserRepository Interface]
  end

  subgraph Infra["Infraestructura"]
    TaskRepoImpl[TaskPrismaRepository]
    UserRepoImpl[UserPrismaRepository]
    Prisma[PrismaService]
    Postgres[(PostgreSQL)]
  end

  C -->|x-user-id + JSON| Guard
  Guard --> ValidationPipe
  ValidationPipe --> Ctrl
  Ctrl --> CreateSvc & ListSvc & UpdateSvc & DeleteSvc & StatusSvc
  CreateSvc --> TaskRepo & UserRepo
  ListSvc --> TaskRepo
  UpdateSvc --> TaskRepo
  DeleteSvc --> TaskRepo
  StatusSvc --> TaskRepo
  TaskRepo --> TaskRepoImpl
  UserRepo --> UserRepoImpl
  TaskRepoImpl --> Prisma
  UserRepoImpl --> Prisma
  Prisma --> Postgres
  CreateSvc --> TaskEntity
  ListSvc --> TaskEntity
  UpdateSvc --> TaskEntity
  DeleteSvc --> TaskEntity
  StatusSvc --> TaskEntity
  Ctrl -->|Task.toResponseDto()| C
```

### POJOs, DTOs y Responsabilidades por Capa

```mermaid
graph LR
    subgraph "HTTP Layer (Infrastructure)"
        A[CreateTaskDto] --> B[ValidationPipe]
        C[UpdateTaskDto] --> B
        D[ChangeStatusDto] --> B
    end

    subgraph "Application Layer"
        E[CreateTaskCommand] --> F[Services]
        G[UpdateTaskCommand] --> F
        H[ChangeStatusCommand] --> F
    end

    subgraph "Domain Layer"
        I[Task Entity] --> J[Business Logic]
        K[User Entity] --> J
        L[Value Objects] --> J
    end

    B --> E
    B --> G
    B --> H
    F --> I
    F --> K
```

**Responsabilidades por capa:**

- **DTOs HTTP (infrastructure/http/dtos)**: Validación en el límite con `class-validator` (`CreateTaskDto`, `UpdateTaskDto`, `ChangeStatusDto`). Viven en `infrastructure` porque son la capa de transporte
- **Application Commands (application/dtos)**: Tipos que definen lo que consumen los servicios (`CreateTaskCommand`, `UpdateTaskCommand`). Útiles para desacoplar la forma HTTP del núcleo de aplicación
- **Entidades (domain)**: Objetos de dominio ricos con comportamiento y validación (`Task`, `User`) con métodos `fromPersistence(record)` y `toResponseDto()` para producir el POJO devuelto al cliente
- **Repositorios (domain/interfaces)**: Contratos (puertos) consumidos por servicios. Las implementaciones concretas (Prisma) viven solo en `infrastructure/persistence`

---

## 🧰 Tecnologías y Dependencias

| Categoría          | Tecnología        | Versión | Propósito                                    |
| ------------------ | ----------------- | ------- | -------------------------------------------- |
| **Framework**      | NestJS            | 11.x    | Framework principal con arquitectura modular |
| **Lenguaje**       | TypeScript        | 5.0+    | Tipado estático y desarrollo robusto         |
| **Base de Datos**  | PostgreSQL        | 17      | Base de datos relacional principal           |
| **ORM**            | Prisma            | 4.x     | Cliente de base de datos y migraciones       |
| **Validación**     | class-validator   | -       | Validación de DTOs y entrada de datos        |
| **Transformación** | class-transformer | -       | Transformación de objetos y serialización    |
| **Cloud**          | Google Cloud Run  | -       | Plataforma de despliegue serverless          |
| **Contenedor**     | Docker            | -       | Containerización para despliegue             |

---

## ⚙️ Requisitos Previos

- [Node.js](https://nodejs.org/) (v20+ recomendado)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (opcional, para build de imagen)
- [gcloud SDK](https://cloud.google.com/sdk) (si vas a desplegar en Google Cloud Run)
- [PostgreSQL](https://www.postgresql.org/) local (opcional para desarrollo) o Cloud SQL

---

## ⚙️ Instalación Local y Ejecución

### Pasos de Instalación

1. **Clonar el repositorio:**

```bash
git clone <url-del-repositorio>
cd server
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Crear archivo de configuración `.env` para desarrollo:**

```bash
# Ejemplo de configuración local
DATABASE_URL="postgresql://forge_user:CHANGEME@localhost:5432/forge_task_db?schema=public"
PORT=3000
NODE_ENV=development
```

> **⚠️ IMPORTANTE**: NO commitear `.env`. Usar Secret Manager en GCP para producción.

4. **Generar Prisma Client (si cambiaste el schema):**

```bash
npx prisma generate
```

5. **Ejecutar migraciones (desarrollo local):**

```bash
npx prisma migrate dev --name init
```

6. **Iniciar servidor de desarrollo:**

```bash
npm run start:dev
```

7. **Verificar que el servidor funciona en:**

```
http://localhost:3000
```

---

## 🗃️ Prisma — Setup y Migraciones

### Configuración del Schema

- Asegurar que `prisma/schema.prisma` define `User` y `Task`
- Usar `id String @id @default(uuid())` y relación `tasks Task[]` en `User`

### Comandos Útiles

| Comando                              | Descripción                              |
| ------------------------------------ | ---------------------------------------- |
| `npx prisma migrate dev --name init` | Crear migración y aplicar localmente     |
| `npx prisma migrate deploy`          | Aplicar migraciones en producción        |
| `npx prisma studio`                  | Inspeccionar BD localmente               |
| `npx prisma generate`                | Generar cliente Prisma                   |
| `npx prisma db seed`                 | Ejecutar seeders (si están configurados) |

### Estructura de la Base de Datos

```mermaid
erDiagram
    User {
        string id PK
        string email
        string name
        datetime createdAt
        datetime updatedAt
    }

    Task {
        string id PK
        string title
        string description
        enum status
        string ownerId FK
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    User ||--o{ Task : owns
```

---

## 🐳 Docker y Despliegue a Google Cloud Run

### 1. Habilitar APIs Requeridas

```bash
gcloud services enable run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com

gcloud config set project forge-task
```

### 2. Crear Instancia Cloud SQL

```bash
gcloud sql instances create forge-task-sql \
  --database-version=POSTGRES_17 \
  --cpu=1 --memory=3840MB \
  --region=us-central1
```

### 3. Crear Base de Datos y Usuario

```bash
gcloud sql databases create forge_task_db --instance=forge-task-sql

gcloud sql users create forge_user \
  --instance=forge-task-sql \
  --password="CAMBIAR_POR_PASSWORD_SEGURO"
```

> **⚠️ Seguridad**: Reemplazar la contraseña con una fuerte y almacenarla en Secret Manager.

### 4. Obtener INSTANCE_CONNECTION_NAME

```bash
gcloud sql instances describe forge-task-sql --format="value(connectionName)"
# Esperado: forge-task:us-central1:forge-task-sql
```

### 5. Crear Secret Manager para DATABASE_URL

```bash
DB_USER=forge_user
DB_PASS='CAMBIAR_POR_PASSWORD_SEGURO'
DB_NAME=forge_task_db
INSTANCE_CONN=forge-task:us-central1:forge-task-sql

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@/${DB_NAME}?host=/cloudsql/${INSTANCE_CONN}"

echo -n "${DATABASE_URL}" | gcloud secrets create DATABASE_URL --data-file=-
```

### 6. Otorgar Permisos IAM

```bash
gcloud projects add-iam-policy-binding forge-task \
  --member="serviceAccount:my-cloudrun-sa@forge-task.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding forge-task \
  --member="serviceAccount:my-cloudrun-sa@forge-task.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 7. Build y Push de Imagen

```bash
gcloud builds submit --tag gcr.io/forge-task/tasks-backend:latest
```

### 8. Deploy a Cloud Run

```bash
gcloud run deploy tasks-backend \
  --image=gcr.io/forge-task/tasks-backend:latest \
  --region=us-central1 \
  --platform=managed \
  --add-cloudsql-instances=forge-task:us-central1:forge-task-sql \
  --set-secrets=DATABASE_URL=DATABASE_URL:latest \
  --service-account=my-cloudrun-sa@forge-task.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --memory=512Mi \
  --concurrency=10
```

### 9. Obtener URL del Servicio

```bash
gcloud run services describe tasks-backend \
  --region=us-central1 \
  --format="value(status.url)"
```

---

## 🛠️ Endpoints Principales & Ejemplos cURL

### Headers Requeridos

Todas las peticiones requieren el header `x-user-id` con un UUID válido:

```bash
-H "x-user-id: 123e4567-e89b-12d3-a456-426614174000"
```

### Crear Tarea

```bash
curl -X POST "https://<SERVICE_URL>/tasks" \
  -H "Content-Type: application/json" \
  -H "x-user-id: 123e4567-e89b-12d3-a456-426614174000" \
  -d '{
    "title": "Comprar leche",
    "description": "2 litros descremada"
  }'
```

### Listar Tareas

```bash
curl "https://<SERVICE_URL>/tasks" \
  -H "x-user-id: 123e4567-e89b-12d3-a456-426614174000"
```

### Actualizar Tarea

```bash
curl -X PATCH "https://<SERVICE_URL>/tasks/<TASK_ID>" \
  -H "Content-Type: application/json" \
  -H "x-user-id: 123e4567-e89b-12d3-a456-426614174000" \
  -d '{
    "title": "Nuevo título actualizado"
  }'
```

### Cambiar Estado de Tarea

```bash
curl -X PATCH "https://<SERVICE_URL>/tasks/<TASK_ID>/status" \
  -H "Content-Type: application/json" \
  -H "x-user-id: 123e4567-e89b-12d3-a456-426614174000" \
  -d '{
    "status": "COMPLETED"
  }'
```

### Eliminar Tarea (Soft Delete)

```bash
curl -X DELETE "https://<SERVICE_URL>/tasks/<TASK_ID>" \
  -H "x-user-id: 123e4567-e89b-12d3-a456-426614174000"
```

### Respuestas de la API

**Respuesta exitosa (ejemplo):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "title": "Comprar leche",
  "description": "2 litros descremada",
  "status": "PENDING",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Respuesta de error:**

```json
{
  "statusCode": 400,
  "message": ["title should not be empty"],
  "error": "Bad Request"
}
```

---

## 🛠️ Scripts Disponibles

| Script            | Comando              | Descripción                                |
| ----------------- | -------------------- | ------------------------------------------ |
| **Desarrollo**    | `npm run start:dev`  | Servidor en modo desarrollo con hot-reload |
| **Producción**    | `npm run start:prod` | Servidor optimizado para producción        |
| **Build**         | `npm run build`      | Compilar proyecto TypeScript               |
| **Testing**       | `npm test`           | Ejecutar suite de pruebas unitarias        |
| **Test Watch**    | `npm run test:watch` | Pruebas en modo watch                      |
| **Test Coverage** | `npm run test:cov`   | Generar reporte de cobertura               |
| **Lint**          | `npm run lint`       | Ejecutar ESLint                            |
| **Format**        | `npm run format`     | Formatear código con Prettier              |

---

## 🛠️ Decisiones Técnicas

### Stack Tecnológico

```mermaid
mindmap
  root(Decisiones Técnicas)
    NestJS 9
      Arquitectura Modular
      Decorators
      Dependency Injection
      Guards y Pipes
    Arquitectura Hexagonal
      Domain Layer
      Application Layer
      Infrastructure Layer
    Base de Datos
      PostgreSQL 17
      Prisma ORM
      Migraciones Automáticas
    Despliegue
      Docker Containers
      Google Cloud Run
      Cloud SQL
      Secret Manager
```

### Principales Decisiones

- **NestJS 9** con arquitectura modular y decorators para estructura clara
- **Arquitectura Hexagonal**: Separación estricta entre dominio, aplicación e infraestructura
- **Prisma ORM**: Type-safe database client con migraciones automáticas
- **PostgreSQL 17**: Base de datos robusta y escalable
- **Google Cloud Run**: Despliegue serverless con escalado automático
- **Header-based Auth**: Autenticación simple mediante `x-user-id` para demostración
- **Soft Delete**: Eliminación lógica para preservar histórico de datos

---

## 🎨 Buenas Prácticas

### Principios de Desarrollo Aplicados

- **Clean Architecture**: Separación clara entre capas de dominio, aplicación e infraestructura
- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Domain-Driven Design**: Entidades ricas con comportamiento encapsulado
- **Dependency Injection**: Inversión de control para testabilidad y flexibilidad
- **Repository Pattern**: Abstracción de la persistencia mediante interfaces

### Estándares de Código

- **TypeScript estricto**: Configuración estricta para máxima seguridad de tipos
- **ESLint + Prettier**: Formateo automático y reglas de calidad de código
- **Conventional Commits**: Historial de cambios estructurado y semántico
- **DTOs con Validación**: `class-validator` para validación robusta en boundaries
- **Error Handling**: Manejo centralizado de errores con filtros personalizados

### Patrones Implementados

```mermaid
graph TB
    subgraph "Architectural Patterns"
        A[Hexagonal Architecture] --> B[Repository Pattern]
        B --> C[Dependency Injection]
        C --> D[Strategy Pattern]
    end

    subgraph "Code Quality"
        E[SOLID Principles] --> F[Clean Code]
        F --> G[Type Safety]
        G --> H[Error Boundaries]
    end

    A --> E
```

---

## 🔒 Seguridad

### Medidas Implementadas Actualmente

La aplicación implementa medidas básicas de seguridad apropiadas para una prueba técnica:

- **Separación por Usuario**: Header `x-user-id` obligatorio para aislamiento de datos entre usuarios
- **Validación de Entrada**: `class-validator` en todos los DTOs para prevenir datos maliciosos
- **SQL Injection Protection**: Prisma ORM utiliza prepared statements automáticamente
- **Type Safety**: TypeScript estricto previene errores de tipos en tiempo de compilación

### Limitaciones de Seguridad Actuales

> **⚠️ Nota**: Esta implementación está diseñada para propósitos de demostración. Las siguientes limitaciones deben ser consideradas para un entorno de producción:

- **Autenticación**: No hay sistema de autenticación real, solo identificación por header
- **Autorización**: No hay roles ni permisos granulares
- **Rate Limiting**: Sin protección contra abuso de API
- **HTTPS**: Debe configurarse en el reverse proxy/load balancer
- **Headers de Seguridad**: No implementados (CSP, HSTS, etc.)

---

## ⚠️ Riesgos y Recomendaciones para Producción

### Riesgos Identificados

```mermaid
graph TB
    subgraph "Security Risks"
        A[Header-based Auth] --> A1[Implement JWT]
        B[No Rate Limiting] --> B1[Add Rate Limiting]
        C[Basic CORS] --> C1[Strict CORS Policy]
    end

    subgraph "Performance Risks"
        D[Connection Pooling] --> D1[Use PgBouncer]
        E[No Caching] --> E1[Add Redis Cache]
        F[No Monitoring] --> F1[Add APM Tools]
    end
```

### Recomendaciones para Producción

#### Seguridad

- **Autenticación Real**: Implementar JWT o OAuth 2.0 en lugar de headers personalizados
- **Rate Limiting**: Añadir throttling para prevenir abuso de API
- **API Keys**: Sistema de autenticación por API keys para clientes
- **Audit Logs**: Logging de todas las operaciones sensibles

#### Performance

- **Connection Pooling**: Usar PgBouncer o Prisma Data Proxy para optimizar conexiones
- **Caching**: Implementar Redis para cachear consultas frecuentes
- **CDN**: Servir contenido estático desde CDN
- **Monitoring**: APM tools como New Relic o DataDog

---

## ✉️ Contacto

### Información del Desarrollador

- **Email**: [sebastian.ballenc@gmail.com](mailto:sebastian.ballenc@gmail.com)
- **LinkedIn**: [Sebastian Ballén Castañeda - Software Developer](https://www.linkedin.com/in/sebastianballencastaneda-softwaredeveloper)

---

### 📄 Licencia

Este proyecto fue desarrollado como prueba técnica para demostrar habilidades en desarrollo backend con NestJS, arquitectura hexagonal y despliegue en cloud.

---

**Desarrollado con ❤️ usando las mejores prácticas de desarrollo backend**
