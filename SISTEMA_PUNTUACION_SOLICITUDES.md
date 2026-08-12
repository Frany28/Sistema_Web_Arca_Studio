# Sistema de puntuación de solicitudes de proyecto

## Objetivo y versión

El sistema mide la preparación y la coherencia inicial de una solicitud en una escala de `0` a `100`. No aprueba, rechaza ni bloquea proyectos; todas las solicitudes pasan a revisión humana.

Las solicitudes nuevas utilizan la fórmula `2.1`:

```text
Compatibilidad = puntos de preparación - deducciones por incoherencia
```

Los resultados se limitan al rango `0–100`. Las solicitudes ya evaluadas con las versiones `1.0` o `2.0` conservan su puntuación, nivel y observaciones originales.

## Campos que no suman puntos

Nombre, tipo de proyecto y ubicación continúan siendo obligatorios y se validan, pero no aportan puntos. Cualquier respuesta válida en esos campos cumple la misma función identificativa y no permite medir preparación.

Tampoco aportan puntos directos:

- Plazo de inicio.
- Calidad esperada.
- Persona que toma la decisión.
- Experiencia previa.
- Disponibilidad de planos.

El plazo y la calidad solo intervienen cuando forman una contradicción objetiva con otras respuestas. El decisor, la experiencia y los planos no alteran el resultado.

## Distribución de los 100 puntos base

### Descripción — 10 puntos

| Respuesta | Puntos |
| --- | ---: |
| 30 caracteres o más | 10 |
| 10–29 caracteres | 4 |
| Sin descripción | 0 |

### Alcance — 40 puntos

| Campo | Respuesta | Puntos |
| --- | --- | ---: |
| Tamaño | Pequeño, mediano, grande o muy grande | 15 |
| Tamaño | No lo sé aún o sin responder | 0 |
| Modalidad | Por fases o en su totalidad | 15 |
| Modalidad | Por definir | 0 |
| Inmueble | Disponible | 10 |
| Inmueble | En proceso de adquisición | 5 |
| Inmueble | No disponible o sin responder | 0 |

### Viabilidad financiera — 40 puntos

Todos los rangos concretos de inversión reciben el mismo valor. Un presupuesto superior no suma más por sí mismo.

| Campo | Respuesta | Puntos |
| --- | --- | ---: |
| Inversión | Cualquier rango concreto | 15 |
| Inversión | No definida | 0 |
| Capital | Disponible ahora | 25 |
| Capital | Disponible en tres meses | 20 |
| Capital | Busca financiamiento | 10 |
| Capital | Indefinido | 0 |

### Referencias — 10 puntos

| Respuesta | Puntos |
| --- | ---: |
| Uno o más archivos guardados | 6 |
| Enlace `http` o `https` válido | 4 |

Los archivos se cuentan desde los adjuntos realmente guardados en el servidor. El navegador no declara ni controla este valor.

## Deducciones por incoherencia

Todas las reglas aplicables se acumulan. Solo se presentan al usuario las tres observaciones de mayor impacto.

### Tamaño frente a inversión

| Combinación | Deducción |
| --- | ---: |
| Mediano + menos de USD 10.000 | -10 |
| Grande + menos de USD 10.000 | -25 |
| Muy grande + menos de USD 10.000 | -35 |
| Muy grande + USD 10.000–50.000 | -25 |
| Grande + inversión no definida | -15 |
| Muy grande + inversión no definida | -20 |

### Calidad frente a inversión

| Combinación | Deducción |
| --- | ---: |
| Premium + menos de USD 10.000 | -20 |
| Lujo + menos de USD 10.000 | -30 |
| Lujo + USD 10.000–50.000 | -20 |
| Premium + inversión no definida | -15 |
| Lujo + inversión no definida | -20 |

### Inicio frente a condiciones reales

| Combinación | Deducción |
| --- | ---: |
| Inmediato + inmueble no disponible | -20 |
| Inmediato + inmueble en adquisición | -10 |
| Inmediato + capital indefinido | -20 |
| Inmediato + busca financiamiento | -15 |
| Inmediato + capital disponible en tres meses | -10 |
| Inmediato + inversión no definida | -10 |
| Inmediato + modalidad por definir | -10 |
| Inicio en 1–3 meses + inmueble no disponible | -10 |
| Inicio en 1–3 meses + capital indefinido | -10 |
| Inicio en 1–3 meses + busca financiamiento | -8 |
| Inicio en 1–3 meses + inversión no definida | -5 |

## Ausencia de doble penalización

La información incompleta únicamente deja de obtener sus puntos base. No se vuelve a descontar por separado.

Por ejemplo:

- Una descripción vacía obtiene `0/10`, pero no recibe otra deducción.
- Un tamaño desconocido obtiene `0/15`.
- La ausencia de archivos y enlace obtiene `0/10`.
- El decisor no genera deducciones porque el formulario no indica si la aprobación ya fue obtenida.

Las deducciones se reservan para cruces entre respuestas que muestran una incompatibilidad objetiva, como iniciar de inmediato sin inmueble, capital o modalidad definidos.

## Clasificación final

| Resultado | Código | Etiqueta visible |
| ---: | --- | --- |
| 80–100 | `excellent` | Excelente compatibilidad |
| 60–79 | `high` | Buena compatibilidad |
| 40–59 | `medium` | Compatibilidad media |
| 20–39 | `low` | Baja compatibilidad |
| 0–19 | `poorly_defined` | Solicitud poco definida |

## Ejemplo de puntuación máxima

```text
Descripción completa: 10
Tamaño definido: 15
Modalidad definida: 15
Inmueble disponible: 10
Inversión definida: 15
Capital disponible ahora: 25
Archivos y enlace: 10
Penalizaciones: 0
Resultado: 100 — Excelente compatibilidad
```

El proyecto puede indicar cualquier plazo de inicio sin perder puntos, siempre que dicho plazo sea coherente con sus demás condiciones.

## Seguridad y persistencia

- El backend es la única fuente autorizada para calcular y guardar el resultado.
- El frontend no puede enviar puntaje, nivel, versión ni presencia de archivos.
- Las solicitudes nuevas se guardan con `compatibility_scoring_version = "2.1"`.
- Las versiones históricas no se recalculan automáticamente.
- Una puntuación baja nunca impide el envío.

La fuente de verdad técnica se encuentra en `Backend/src/domain/projectRequest.js`.
