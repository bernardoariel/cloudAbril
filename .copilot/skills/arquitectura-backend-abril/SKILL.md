---
name: arquitectura-backend-abril
description: Guía de arquitectura del backend NestJS (TypeORM + SQL Server + PostgreSQL). Define el flujo obligatorio Module → Controller → Service → Entity/TypeORM. Usar cuando el usuario pide crear un nuevo endpoint, módulo, entidad o servicio en el backend de Abril (dev.backend).
---

# Arquitectura Backend – Abril (cloudAbril · dev.backend)

## Cuándo usar este skill

- El usuario pide crear un nuevo endpoint REST
- Necesita agregar un nuevo módulo en `dev.backend/src/`
- Pregunta cómo estructurar o nombrar controllers, services, entities o modules
- Quiere crear un CRUD completo para una nueva entidad de base de datos
- Necesita conectarse a una tabla nueva de SQL Server o PostgreSQL

---

## Stack tecnológico

| Tecnología | Rol |
|---|---|
| NestJS | Framework backend (Node.js) |
| TypeScript | Tipado estricto |
| TypeORM | ORM para SQL Server y PostgreSQL |
| @nestjs/config + ConfigService | Variables de entorno |
| @nestjs/swagger (`@ApiTags`) | Documentación automática de API |
| @nestjs/schedule | Tareas programadas (cron jobs) |

---

## Conexiones de base de datos disponibles

| Nombre | Tipo | Uso |
|---|---|---|
| `sqlserverConnection` | SQL Server (mssql) | Módulos de negocio principales |
| `postgresConnection` | PostgreSQL | Módulo `whatsapp-history` únicamente |

> **IMPORTANTE:** Siempre especificar el nombre de la conexión al usar `@InjectRepository` y `TypeOrmModule.forFeature`.

---

## Regla de oro – Flujo de comunicación obligatorio

```
HTTP Request
      ↓
  Controller       ← valida parámetros, lanza NotFoundException si corresponde
      ↓
  Service          ← toda la lógica de negocio va aquí
      ↓
  Repository       ← TypeORM: repository.find(), findOne(), createQueryBuilder()
      ↓
  Entity           ← mapeo de tabla de base de datos
```

> **NUNCA** escribir lógica de negocio en el Controller.  
> **NUNCA** acceder a la base de datos directamente desde el Controller.

---

## Estructura de archivos por módulo

```
src/<nombre-modulo>/
├── entities/
│   └── <nombre>.entity.ts      ← @Entity() + @Column() con TypeORM
├── <nombre>.controller.ts      ← @Controller() + @Get() / @Post() / @Put() / @Delete()
├── <nombre>.service.ts         ← @Injectable() con toda la lógica
└── <nombre>.module.ts          ← @Module() que registra todo
```

---

## Paso 1 – Entity (TypeORM)

**Archivo:** `src/<nombre-modulo>/entities/<nombre>.entity.ts`

```typescript
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'NombreTablaEnBD' })   // nombre exacto de la tabla en SQL Server
export class NombreEntidad {
  @PrimaryColumn()
  Id: number;

  @Column()
  Campo1: string;

  @Column({ nullable: true })
  Campo2: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ValorDecimal: number;
}
```

> Usar `PascalCase` para las propiedades, igual que los nombres de columna en SQL Server.  
> Si la tabla no tiene PK numérica, usar `@PrimaryColumn()` con el tipo correcto.

---

## Paso 2 – Module

**Archivo:** `src/<nombre-modulo>/<nombre>.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NombreController } from './<nombre>.controller';
import { NombreService } from './<nombre>.service';
import { NombreEntidad } from './entities/<nombre>.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NombreEntidad], 'sqlserverConnection'),
    // Importar otros módulos si el servicio los necesita:
    // OtroModulo,
  ],
  controllers: [NombreController],
  providers: [NombreService],
  exports: [NombreService],  // solo si otros módulos necesitan este servicio
})
export class NombreModule {}
```

---

## Paso 3 – Service

**Archivo:** `src/<nombre-modulo>/<nombre>.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NombreEntidad } from './entities/<nombre>.entity';

@Injectable()
export class NombreService {
  constructor(
    @InjectRepository(NombreEntidad, 'sqlserverConnection')
    private readonly nombreRepository: Repository<NombreEntidad>,
  ) {}

  // GET ALL
  async findAll(): Promise<NombreEntidad[]> {
    return await this.nombreRepository.find();
  }

  // GET BY ID
  async findOne(id: number): Promise<NombreEntidad> {
    const registro = await this.nombreRepository.findOne({ where: { Id: id } });
    if (!registro) {
      throw new NotFoundException(`Registro con id ${id} no encontrado`);
    }
    return registro;
  }

  // GET con QueryBuilder (búsquedas complejas)
  async findByTerm(term: string): Promise<NombreEntidad[]> {
    return await this.nombreRepository
      .createQueryBuilder('alias')
      .where('alias.Campo1 LIKE :term', { term: `%${term}%` })
      .getMany();
  }
}
```

---

## Paso 4 – Controller

**Archivo:** `src/<nombre-modulo>/<nombre>.controller.ts`

```typescript
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NombreService } from './<nombre>.service';

@ApiTags('Abril-SqlServer')         // agrupación en Swagger
@Controller('<nombre-endpoint>')    // ej: 'productos', 'clientes', 'vendedores'
export class NombreController {
  constructor(private readonly nombreService: NombreService) {}

  @Get()
  async findAll(): Promise<any> {
    const result = await this.nombreService.findAll();
    if (!result || result.length === 0) {
      throw new NotFoundException('No se encontraron registros');
    }
    return {
      total: result.length,
      result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    return await this.nombreService.findOne(+id);
  }
}
```

---

## Paso 5 – Registrar en app.module.ts

Agregar el nuevo módulo en `src/app.module.ts`:

```typescript
import { NombreModule } from './nombre-modulo/nombre.module';

@Module({
  imports: [
    // ... módulos existentes ...
    NombreModule,    // ← agregar aquí
  ],
})
export class AppModule { ... }
```

---

## Patrones avanzados

### Reutilizar un Service en otro módulo

1. En el módulo fuente, exportar el service: `exports: [NombreService]`
2. En el módulo destino, importar el módulo fuente: `imports: [NombreModule]`
3. En el service destino, inyectar vía constructor: `private readonly nombreService: NombreService`

### Cache en memoria (patrón del proyecto)

```typescript
// En el service
private cache: EntidadType[] = [];

async loadCache(): Promise<void> {
  this.cache = await this.entidadRepository.find();
}

getAllFromCache(): EntidadType[] {
  return this.cache;
}

// En el module que lo usa, llamar onModuleInit:
async onModuleInit() {
  await this.nombreService.loadCache();
}
```

### Reemplazar IP interna en URLs de imágenes

```typescript
// Patrón usado en el proyecto para URLs de imágenes almacenadas con IP interna
imagen?.URL.replace('10.10.0.12', 'abril.arielbernardo.com/public_image') || null
```

---

## Checklist al crear un módulo nuevo

- [ ] Entity creada con `@Entity({ name: 'TablaExacta' })` y conexión `sqlserverConnection`
- [ ] Module con `TypeOrmModule.forFeature([Entidad], 'sqlserverConnection')`
- [ ] Service con `@InjectRepository(Entidad, 'sqlserverConnection')` y manejo de `NotFoundException`
- [ ] Controller con `@ApiTags('Abril-SqlServer')` y respuestas con `{ total, result }`
- [ ] Módulo registrado en `app.module.ts`
- [ ] Si el service será usado por otros módulos: agregado a `exports: []` del module

---

## Errores frecuentes a evitar

❌ Omitir el nombre de la conexión en `@InjectRepository` o `forFeature`  
✅ Siempre: `@InjectRepository(Entidad, 'sqlserverConnection')`

❌ Lógica de negocio dentro del Controller  
✅ El Controller solo llama al Service y lanza excepciones HTTP

❌ Olvidar registrar el nuevo módulo en `app.module.ts`  
✅ Agregar `NombreModule` en el array `imports` de `AppModule`

❌ Usar `synchronize: true` para `sqlserverConnection`  
✅ Solo `postgresConnection` usa `synchronize: true`; SQL Server usa `synchronize: false`
