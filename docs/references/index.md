---
title: Reference Index — Portal de Compras BIA
status: review
authority: reference
owner: Intelia (maintainer)
last_reviewed: 2026-08-12
---

# Reference Index

Índice de las fuentes que contribuyen al contexto del proyecto. Los documentos de origen viven en `documentacion inicial/` (preservados, sin modificar como fuente).

| Reference | Location | Authority | Relevant decisions | Notes |
|---|---|---|---|---|
| Flujo digitalizado de 11 pasos | `documentacion inicial/09-…` | product | Origen funcional del flujo validado | Sin nombre de producto (nombre vigente: Portal de Compras BIA) |
| Blueprint técnico preliminar | `documentacion inicial/10-…` | technical | Arquitectura, stack, pipeline, RAG | Estimación 9-12; nombre actualizado |
| Plantillas de documentos y correos v0.9 | `documentacion inicial/13-…` | product | Artefactos generados (PDF, Excel, correos) | Provisional, sujeta a Lady |
| Catálogo de campos y pantallas | `documentacion inicial/14-…` | technical/product | Campos, pantallas, bloqueos, temas abiertos | |
| Diccionario de datos y migraciones | `documentacion inicial/15-…` | technical | Modelo de datos, máquina de estados, métricas | 8 claves de config pendientes |
| Prompts y guardrails del agente | `documentacion inicial/16-…` | technical | 6 funciones de IA y sus límites | |
| Backlog por sprint | `documentacion inicial/17-…` | technical | Plan de ejecución e historias | Duración vigente 7-10 dev / 9-12 con piloto |
| PRD | `documentacion inicial/18-…` | product | Definición autoritativa de producto | Base de `docs/product/prd.md` |
| Brief del proyecto | `documentacion inicial/19-…` | product | Resumen de alineación | Base de `docs/product/brief.md` |
| Flujos de usuario por rol y edge cases | `documentacion inicial/20-…` | product | Recorridos por rol, ~70 casos límite | Nomenclatura de correos corregida |
| Guidelines de UX/UI | `documentacion inicial/21-…` | technical | Sistema de diseño (paleta, tipografía, componentes) | |
| Contexto y prompt maestro | `documentacion inicial/22-…` | reference | Contexto plano + prompt maestro + consistencia | |
| Guía de traspaso a desarrollo | `documentacion inicial/23-…` | technical | Estructura de repo, AGENTS.md, secuencia de arranque, docs que NO migran | Dirigido a Codex |
| Flujos de usuario exhaustivos | `documentacion inicial/24-…` | product | Navegación, pantalla, elemento e interacción. EC-1.1…EC-18.4 + T-01…T-18 | Máximo detalle; prevalece PRD |

## Documentos que NO migran al repositorio de desarrollo

Por decisión (fuente 23 §2 y guía de traspaso): **01–08, 11 y 12**.
- **04, 05, 06**: describen COM-1 v1.0 (Copiloto en Teams + integración al ERP). Arquitectura incompatible con la actual; si entran, el agente mezcla las dos.
- **12**: re-baseline comercial interno (precios, márgenes, estructura de pago). No corresponde al alcance de un agente de desarrollo.

## Documentos canónicos (fuentes autoritativas)

| Doc | Autoridad | Rol |
|---|---|---|
| `docs/product/prd.md` | product | Requerimientos de producto (autoritativo) |
| `docs/product/user-flows.md` | product | **Referencia oficial de roles, acciones, funcionalidades, flujos y casos límite de la plataforma** |
| `docs/product/glossary.md` | product | Terminología canónica del dominio |
| `docs/product/brief.md` | product | Resumen de alineación |
| `docs/references/architecture.md` | technical | Arquitectura y stack |
| `docs/decisions/` | technical | Registro de decisiones (ADRs) |

## Jerarquía ante contradicción

1. `docs/product/prd.md` (autoritativo)
2. `docs/product/user-flows.md` (comportamiento, roles y acciones)
3. `docs/product/glossary.md`
4. Especificaciones técnicas (14, 15, 16) y arquitectura
5. Artefactos y diseño (13, 21)
6. Plan de sprints (17)
7. Contexto (09, 10, 19)

Ante una contradicción: reportarla y esperar instrucción. No resolverla por cuenta propia.
