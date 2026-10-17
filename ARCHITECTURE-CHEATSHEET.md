# Arkitekturlathund

## Grundfrågan

Fråga alltid:

> Är detta presentation, appens regel, ett gränssnitt eller en teknisk implementation?

| Om koden...                                       | Lägg den i...                                         |
| ------------------------------------------------- | ----------------------------------------------------- |
| Visar UI, knappar, modaler eller formulär         | `features/<feature>/components`                       |
| Håller React-state eller kopplar UI till data     | `features/<feature>/hooks`                            |
| Beskriver en regel i appen                        | `core/domain` eller `features/<feature>/*-rules.ts`   |
| Utför ett användningsfall                         | `features/<feature>/*-service.ts` eller `application` |
| Definierar vad en implementation måste kunna göra | `core/ports`                                          |
| Pratar med SQLite, HTTP, Gemini eller Open-Meteo  | `infrastructure`                                      |
| Är generell UI eller generell hjälp               | `shared/ui` eller `shared/utilities`                  |
| Är en Next.js HTTP-ingång                         | `app/api`                                             |

## Beslutsträd

1. Är det JSX eller direkt kopplat till hur sidan ser ut?
   - Ja: `features/.../components`.
2. Är det React `useState`, `useEffect` eller eventkoppling?
   - Ja: `features/.../hooks`.
3. Är det en regel som ska fungera även utan webbläsare?
   - Ja: `core/domain` eller feature-regler.
4. Behöver koden prata med en extern tjänst eller databas?
   - Ja: implementationen ligger i `infrastructure`.
5. Vill application-lagret använda den utan att känna till leverantören?
   - Ja: lägg ett interface i `core/ports`.
6. Är filen bara en HTTP-route?
   - Ja: håll `app/api` tunn och anropa application/service därifrån.

## Exempel från Lugn Lista

### Todo-checkbox

- Knappen och visuella checkboxen: `features/todos/components`
- Regeln “en tråd är klar när alla checkbox-underinlägg är klara”: `features/todos/todo-rules.ts`
- Interface för lagring: `core/ports/todo-repository.ts`
- SQLite-implementation: `infrastructure/database/sqlite-todo-repository.ts`
- HTTP-route: `app/api/items/route.ts`

### AI-formatering

- AI-knappen och modalens state: `features/ai-formatting/components`
- Användningsfallet “formatera todo-text”: `features/ai-formatting/format-text.ts`
- Neutralt interface: `core/ports/text-formatter.ts`
- Gemini/Ollama/OpenAI: `infrastructure/llm/`

### Väder

- Temperatur, ikon och polling-hook: `features/weather/`
- Vädertypen och service-interfacet: `core/domain` och `core/ports`
- Open-Meteo-anropet: `infrastructure/weather/`
- API-route: `app/api/weather/route.ts`

## Tumregler

- UI ska inte känna till Gemini, SQLite eller Open-Meteo.
- Business-regler ska inte läsa `window`, använda React eller anropa `fetch` direkt.
- Infrastructure ska inte innehålla JSX.
- `core` får inte importera från `features`, `app` eller `infrastructure`.
- En API-route ska validera HTTP-input och anropa ett use case; den ska inte innehålla hela affärsflödet.
- Om du vill kunna byta leverantör: lägg ett interface i `core/ports` och implementationen i `infrastructure`.
- Om koden bara används av en feature, lägg den nära featuren i stället för i `shared`.

## Snabbtest

När du tvekar, ställ frågan:

> Kan jag testa den här koden utan webbläsare, databas och internet?

- Ja, då är den troligen domain/application/business-logik.
- Nej, då är den troligen UI eller infrastructure.

## Import-riktning

```text
app/API/UI
    ↓
features/application
    ↓
core ports/domain
    ↑
infrastructure adapters
```

Core definierar regler och kontrakt. Infrastructure implementerar kontrakten. UI och API använder application-lagret.
