# Lugn lista

En lokal Next.js-app för todo-trådar, underinlägg, fokusområden och länkar.

## Krav

- Windows PowerShell
- Node.js 20 LTS eller senare
- npm

Kontrollera installationen:

```powershell
node --version
npm --version
```

## Installera lokalt

1. Klona projektet och gå till projektmappen:

   ```powershell
   git clone <repository-url>
   Set-Location .\todo-threads
   ```

2. Installera beroenden:

   ```powershell
   npm install
   ```

3. Skapa den lokala miljöfilen:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   Fyll i de variabler som behövs i `.env.local`. Filen ska inte committas.
   AI-formatering är valfri; appen kan använda OpenAI-kompatibel tjänst,
   Gemini eller lokal Ollama.

Databasen skapas automatiskt som `data/todos.sqlite` första gången servern
körs. Filer i `data/` är lokala och ignoreras av Git.

## Starta i utvecklingsläge

```powershell
npm run dev
```

Öppna sedan <http://localhost:58321>.

## Starta med desktopikonen

Desktopikonen ska starta projektets launcher:

```text
<projektmapp>\start-lugn-lista.ps1
```

Launchern startar en dold utvecklingsserver på port `58321` om appen inte
redan körs och öppnar därefter appen i webbläsaren.

Om Windows blockerar PowerShell-scriptet kan launchern köras manuellt:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\start-lugn-lista.ps1
```

För att skapa eller uppdatera en genväg:

1. Högerklicka på skrivbordet och välj **Nytt → Genväg**.
2. Ange följande mål, med den faktiska sökvägen till projektet:

   ```text
   powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\sökväg\till\todo-threads\start-lugn-lista.ps1"
   ```

3. Välj en beskrivning, till exempel `Lugn lista`.
4. Välj appens ikon via **Egenskaper → Byt ikon** om så önskas.

Desktoplaunchern använder utvecklingsservern. För en produktionslik lokal
start används i stället:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-server.ps1
```

Det scriptet bygger appen vid behov, startar Next.js på port `58321` och
öppnar webbläsaren. Loggar finns i `data/build.log`, `data/server.log` och
`data/server-error.log`.

## Vanliga kommandon

```powershell
npm run dev       # utvecklingsläge med hot reload
npm run build     # skapa produktionsbuild
npm run start     # starta en befintlig produktionsbuild
npm run test      # kör tester
npx tsc --noEmit  # kontrollera TypeScript
```

## SonarQube

SonarCloud-token ska ligga i en miljövariabel, inte i Git:

```powershell
$env:SONAR_HOST_URL = "https://sonarcloud.io"
$env:SONAR_TOKEN = "din-token"
npm run sonar
```

Öppna issues från terminalen med:

```powershell
npm run sonar:issues
```
