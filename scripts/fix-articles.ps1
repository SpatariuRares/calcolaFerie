param(
    [Alias("dry-run")]
    [switch]$DryRun,
    [switch]$All
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $root "content\blog\visible"
$timeZone = "Europe/Rome"

# Voci editoriali alternate tra gli articoli, così non vengono mai uguali.
$voices = @(
    "voce pragmatica e diretta: tono pratico, frasi brevi, punti chiave in elenco, zero giri di parole",
    "voce narrativa ed emotiva: apre con un'immagine tipo 'Immagina...', tono caldo e coinvolgente",
    "voce da guida da ufficio: tono neutro e didattico, focus su come chiedere le ferie in azienda, si rivolge al lettore con 'tu'",
    "voce da blog di viaggi: entusiasta e concreto, apre tipo 'Se stai già sognando...', parla di tempo libero e pianificazione"
)

function Get-TodayIso {
    $tz = [System.TimeZoneInfo]::FindSystemTimeZoneById($timeZone)
    return [System.TimeZoneInfo]::ConvertTime([DateTime]::UtcNow, $tz).ToString("yyyy-MM-dd")
}

function Get-FrontMatterDate([string]$content) {
    $m = [regex]::Match($content, '(?m)^date:\s*"(\d{4}-\d{2}-\d{2})"')
    if ($m.Success) { return $m.Groups[1].Value }
    return $null
}

$today = Get-TodayIso
$files = Get-ChildItem -LiteralPath $outputDir -Filter "*.mdx" -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '^ponte-[\w-]+-\d{4}-\d{1,2}-\d{1,2}\.mdx$' }

$toFix = @()
$published = @()
$handwritten = @()

foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding utf8
    $date = Get-FrontMatterDate $content
    if (-not $date) {
        $handwritten += $file.Name
        continue
    }
    if ($date -le $today) {
        if ($All) { $toFix += $file } else { $published += $file.Name }
    } else {
        $toFix += $file
    }
}

Write-Host "Oggi (Europe/Rome): $today"
Write-Host "Articoli non pubblicati da far riscrivere a opencode: $($toFix.Count)"
if ($published.Count -gt 0) { Write-Host "Già pubblicati (saltati): $($published.Count)" }
if ($handwritten.Count -gt 0) { Write-Host "Scritti a mano (ignorati): $($handwritten.Count)" }

if ($toFix.Count -eq 0) {
    Write-Host "Nessun articolo da sistemare."
    exit 0
}

if ($DryRun) {
    foreach ($file in $toFix) {
        Write-Host "[dry-run] lancierei opencode su $($file.Name)"
    }
    exit 0
}

$errors = 0
$done = 0
for ($i = 0; $i -lt $toFix.Count; $i++) {
    $file = $toFix[$i]
    $voice = $voices[$i % $voices.Count]
    Write-Host "`n[$(($i + 1))/$($toFix.Count)] opencode -> $($file.Name)  (voce $($i % $voices.Count + 1))"

    $prompt = @"
Riscrivi in italiano SOLO il corpo (tutto ciò che sta DOPO il frontmatter YAML, delimitato dalle righe ---) del file MDX:

  $($file.FullName)

VINCOLI ASSOLUTI:
1. Il frontmatter (title, description, date, expiresAt) DEVE restare verbatim identico.
2. I dati numerici sono verità assoluta e NON vanno mai cambiati: giorni di stacco, giorni di ferie, leva, date, giorni della settimana, la tabella "Giorno | Data | Cosa succede" e il blocco di codice con la formula della leva.
3. Riscrivi il corpo in modo UNICO, diverso dal template generico e dagli altri articoli del blog, con questa voce editoriale: $voice
4. Niente fatti inventati (no mete specifiche, no prezzi, no eventi): usa solo i dati reali del ponte presenti nel file.
5. Termina il corpo con la CTA: [Apri il calcolatore](/)
6. Quando hai finito, salva le modifiche al file.
"@

    $before = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
    $output = & opencode run --dir $root --format json --auto $prompt 2>&1
    $exit = $LASTEXITCODE

    $after = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
    $changed = $before -ne $after

    if ($exit -eq 0 -and $changed) {
        Write-Host "  OK: riscritto da opencode."
        $done++
    } elseif ($exit -eq 0 -and -not $changed) {
        Write-Host "  AVVISO: opencode è uscito con 0 ma il file non è cambiato."
        $errors++
    } else {
        Write-Host "  ERRORE: opencode uscito con codice $exit."
        $errors++
        $output | Select-Object -Last 3 | ForEach-Object { Write-Host "    $_" }
    }
}

Write-Host "`nRiepilogo: $done riscritti, $errors errori."
if ($errors -gt 0) { exit 1 }
