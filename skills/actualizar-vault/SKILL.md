---
name: actualizar-vault
description: "Documenta en vault/ un cambio ya cerrado, en un subagente aparte (no ocupa la conversación). Invocar al cerrar un cambio significativo, pasando como argumento el resumen: archivos:línea, tablas, decisión, porqué y commit."
argument-hint: "<resumen del cambio: archivos:línea, tablas, decisión y porqué, commit>"
context: fork
agent: general-purpose
model: sonnet
---

# Actualizar el vault del repositorio

Eres un subagente sin acceso a la conversación que te lanzó. Tu única tarea es dejar
documentado en `vault/` el cambio descrito aquí:

> $ARGUMENTS

El repositorio es el directorio de trabajo actual. Responde en español.

## Límites

- **Solo escribes dentro de `vault/`.** No tocas código, git, configuración ni `.env`.
- No releas el repositorio entero: parte del resumen. Abre código solo para confirmar un
  `archivo:línea` concreto que vayas a citar.
- Nada inventado: lo que no esté en el resumen ni hayas confirmado, no lo escribas.
- Nunca secretos, contraseñas, tokens, cadenas de conexión ni datos personales.
- Si `vault/` no existe, no lo crees: termina diciendo "repo sin vault".

## Pasos

1. Lee `vault/_INDICE.md` para saber qué notas existen.
2. Elige la carpeta: `01 - Arquitectura` (módulos y flujos) · `02 - Base de Datos` ·
   `03 - Backend` · `04 - Frontend` · `05 - APIs` · `06 - Docker` · `07 - UI-UX` ·
   `08 - Decisiones` (qué se decidió y por qué) · `09 - Bugs y soluciones` (síntoma →
   causa raíz → solución) · `12 - Testing`.
3. **Si ya hay una nota del tema, edítala con Edit** (no crees otra parecida). Si una
   decisión cambió, corrígela y deja una línea con la fecha del cambio. Si no existe,
   créala: una nota por concepto, con un título que se entienda solo.
4. Escribe el **porqué** (el qué ya lo dice el código), con `archivo:línea`, commit y
   fecha absoluta (AAAA-MM-DD). Enlaza notas relacionadas con `[[nota]]`.
5. Ajusta `vault/_INDICE.md`: una línea por nota nueva bajo su carpeta; si el cambio
   documenta un módulo, su fila en **Módulos**.
6. Añade al final de `vault/11 - Cambios/<fecha de hoy>.md` una entrada de 1–3 líneas.
7. Si el resumen trae mejoras fuera de alcance (💡), añádelas al final de
   `vault/10 - Tareas/Pendiente.md`: fecha · módulo · qué · dónde · por qué importa.
8. Devuelve **solo** la lista de notas creadas o editadas.

Otras sesiones pueden escribir a la vez: usa Edit y añade al final, no reescribas
archivos enteros.
