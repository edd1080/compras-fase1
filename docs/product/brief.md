---
title: Project Brief — Portal de Compras BIA
status: review
authority: product
owner: Lady Matute (process owner), Intelia (build)
last_reviewed: 2026-08-12
---

# Project Brief — Portal de Compras BIA

> Fuentes: documento 19 (brief) + 12 §3 (alcance v2.0 aprobado). Documento de alineación rápida; el detalle está en `prd.md`.

## Problem

Los requisantes de BIA Honduras no saben especificar (piden "tazas de cerámica con logo" sin dimensiones, materiales ni arte); las cotizaciones no son comparables (un proveedor cotizó melamina y otro madera con superficie de aluminio, diferencia de 50,000–150,000 USD); y el proceso no se mide (un desarrollo de empaque de enero llevó +4 meses invisible). El canal actual es correo, WhatsApp y chats.

## Target users

| Rol | Cuántos | Qué hace |
|---|---|---|
| Solicitante | Toda la empresa | Pide, responde lo que falta, elige |
| Coordinador de compras | 4 | Recibe, cotiza, carga, recomienda |
| Lady Matute | 1 | Administra el proceso y mide |

## Desired outcome

Un canal único que reemplaza el correo/WhatsApp/chats: cualquier colaborador solicita una compra, Compras la gestiona con documentos estandarizados, y el proceso queda medido. En 11 pasos: identificación por correo → captura → clasificación RFI/RFQ/RFP → assessment → PDF con referencia → distribución al coordinador → carga de cotizaciones → comparativa en Excel con validación fiscal → recomendación humana obligatoria → link público y decisión del solicitante → trazabilidad y métricas.

## Scope boundary

**Dentro (Fase 1):** portal público de intake (sin login), panel del coordinador, dashboard administrativo, motor de clasificación, generación de PDF, correo transaccional, parseo multiformato de cotizaciones, comparativa en Excel, validación fiscal de Honduras, link público con token, máquina de estados con trazabilidad y métrica de conversión.

**Fuera:** reportería KPI desde sistemas actuales (COM-2, diferida), integración de presupuesto de Finanzas (COM-4), motor SNOP (COM-3), memoria histórica de patrones, órdenes de compra y pagos, y **cualquier lectura/escritura sobre el sistema de gestión del cliente** (producto autocontenido).

**Control humano:** el humano decide siempre. La recomendación la escribe una persona (bloqueo del sistema); la IA sugiere y ordena, no decide. El agente no se sale del estándar de Compras.

## Success signals

Métrica principal: **tasa de conversión solicitud → aceptación de cotización**, que hoy no se puede medir (la "cereza del pastel" de Lady). Junto a ella: tiempo de ciclo total, tiempo por etapa, solicitudes con especificación completa, y cero solicitudes con marca sin arte oficial.

## Duración

**7–10 semanas de desarrollo; 9–12 semanas con piloto.** Cifra vigente (el blueprint preliminar 10 estimó 6–9; el backlog 17 dio 7–10 al sumar los sprints). Los primeros cuatro sprints no dependen de insumos pendientes del cliente; solo el piloto requiere las plantillas oficiales de Compras.

## Riesgo asumido

El solicitante no inicia sesión y la comparativa se comparte por enlace público: cualquiera con el enlace puede ver precios de proveedores. Decisión consciente del cliente. Se mitiga con token no adivinable, expiración configurable, registro de accesos y revocación — debe quedar aceptado por escrito antes de producción.

## Equipo

| Rol | Quién |
|---|---|
| Líder del proyecto — Intelia | Chava |
| Contraparte técnica — Intelia | Edgar Calderón |
| Dueña del proceso — BIA | Lady Matute |
| Patrocinio ejecutivo — BIA | Débora |
| Coordinación — BIA | Greta |
| Infraestructura y dominio — BIA | Área de Tecnología |
