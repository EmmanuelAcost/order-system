# Order System — Mini sistema de gestión de órdenes

Sistema compuesto por dos microservicios que se comunican vía TCP.

## Servicios

| Servicio | Puerto HTTP | Puerto TCP | Base de datos |
|---|---|---|---|
| orders-service | 3000 | 3001 | PostgreSQL |
| audit-service | 3002 | 3003 | MongoDB |

## Requisitos

- Docker y Docker Compose instalados
- Puertos 3000, 3002, 5432 y 27017 disponibles

## Levantar el proyecto

**1. Clonar el repositorio**

    git clone <url-del-repo>
    cd order-system

**2. Configurar variables de entorno**

    cp .env.example .env

Edita `.env` si quieres cambiar contraseñas o puertos.

**3. Levantar todo con Docker**

    docker compose up --build

Los servicios estarán listos cuando veas en consola:

    🚀 Orders HTTP  → http://localhost:3000
    📡 Orders TCP   → port 3001
    🚀 Audit HTTP   → http://localhost:3002
    📡 Audit TCP    → port 3003

## Uso de la API

Todos los endpoints del orders-service requieren el header:

    x-api-key: <valor de API_KEY en tu .env>

---

### Crear una orden — POST /orders

    curl -X POST http://localhost:3000/orders \
      -H "Content-Type: application/json" \
      -H "x-api-key: mi_api_key_secreta_local" \
      -d '{
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "productName": "Teclado mecánico",
        "quantity": 2,
        "totalPrice": 150.00
      }'

---

### Listar órdenes con filtros — GET /orders

    curl "http://localhost:3000/orders?status=PENDING&page=1&limit=10" \
      -H "x-api-key: mi_api_key_secreta_local"

---

### Cambiar estado de una orden — PUT /orders/:id/status

    curl -X PUT http://localhost:3000/orders/<id>/status \
      -H "Content-Type: application/json" \
      -H "x-api-key: mi_api_key_secreta_local" \
      -d '{ "status": "CONFIRMED" }'

---

### Búsqueda full-text — GET /orders/search

    curl "http://localhost:3000/orders/search?q=teclado" \
      -H "x-api-key: mi_api_key_secreta_local"

---

### Historial de auditoría — GET /audit/:orderId

    curl http://localhost:3002/audit/<orderId>

---

## Flujo de estados válido

    PENDING   → CONFIRMED → SHIPPED → DELIVERED
    PENDING   → CANCELLED
    CONFIRMED → CANCELLED

Los estados DELIVERED y CANCELLED son terminales — no permiten más transiciones.

---

## Decisiones de diseño

**TCP entre servicios**
Más eficiente que HTTP para comunicación interna. El audit-service recibe eventos sin bloquear la respuesta al cliente (patrón fire-and-forget con emit()).

**Repositorio como capa separada**
El servicio no conoce TypeORM ni Mongoose directamente. Si se cambia el ORM, solo se toca el repositorio — el servicio y el controlador no cambian. Principio de inversión de dependencias (SOLID).

**Full-text search con tsvector**
Índice GIN en PostgreSQL para búsquedas O(log n). Alternativa a LIKE '%texto%' que hace full table scan y no escala.

**API Key global con @Public()**
El guard aplica a todos los endpoints automáticamente. Los que no requieren auth se marcan con el decorador @Public() de forma explícita.

**MongoDB para auditoría**
Los logs son documentos append-only sin relaciones entre sí. Schema flexible para metadata variable según el tipo de evento. Ideal para escrituras de alta frecuencia.

**synchronize: true solo en development**
En producción se usarían migraciones de TypeORM para controlar cambios de schema sin riesgo de pérdida de datos.