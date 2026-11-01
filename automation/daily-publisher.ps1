# ==============================================================================
# COMMERONIX - AUTOMATED DAILY BLOG PUBLISHER
# Reads topic-catalog.json, compiles AdSense-ready articles, and updates /blog
# ==============================================================================

param(
    [int]$Count = 3,
    [switch]$Force
)

$rootDir = Split-Path -Parent $PSScriptRoot
$blogDir = Join-Path $rootDir "blog"
$catalogFile = Join-Path $PSScriptRoot "topic-catalog.json"
$stateFile = Join-Path $PSScriptRoot "published-history.json"

if (-not (Test-Path $blogDir)) { New-Item -ItemType Directory -Path $blogDir -Force | Out-Null }
if (-not (Test-Path $stateFile)) { Set-Content -Path $stateFile -Value "[]" -Encoding UTF8 }

$catalog = Get-Content -Path $catalogFile -Raw -Encoding UTF8 | ConvertFrom-Json
$history = Get-Content -Path $stateFile -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not $history) { $history = @() }

$publishedSlugs = @($history | ForEach-Object { $_.Slug })
$pendingTopics = @($catalog | Where-Object { $publishedSlugs -notcontains $_.Slug })

if ($pendingTopics.Count -eq 0 -and -not $Force) {
    Write-Output "All standard topics in the catalog have already been published!"
    exit 0
}

$toPublish = @($pendingTopics | Select-Object -First $Count)
$currentDate = (Get-Date).ToString("yyyy-MM-dd")
$newlyPublished = @()

foreach ($topic in $toPublish) {
    Write-Output "Publishing: $($topic.Title)"
    $outPath = Join-Path $blogDir "$($topic.Slug).html"

    $sectionsHtml = ""
    foreach ($sec in $topic.Sections) {
        $sectionsHtml += "<h2>$($sec.H2)</h2>`n$($sec.Content)`n"
    }

    $faqHtml = ""
    $faqItems = @()
    foreach ($f in $topic.Faq) {
        $faqHtml += "<div class='faq-item-card'><div class='faq-question-title'>$($f.Q)</div><div class='faq-answer-text'>$($f.A)</div></div>`n"
        $faqItems += "{ `"@type`": `"Question`", `"name`": `"$($f.Q)`", `"acceptedAnswer`": { `"@type`": `"Answer`", `"text`": `"$($f.A)`" } }"
    }
    $faqJson = $faqItems -join ",`n"

    $coverImg = if ($topic.CoverImage) { $topic.CoverImage } else {
        switch -Regex ($topic.Slug) {
            "loan-emi" { "cover-loan-emi.svg" }
            "foreign-exchange|currency" { "cover-forex-volatility.svg" }
            "data-uri|base64" { "cover-data-uris.svg" }
            "image|core-web" { "cover-image-optimization.svg" }
            "slug|seo" { "cover-url-slugs.svg" }
            "color" { "cover-color-models.svg" }
            "speed|load" { "cover-load-speed.svg" }
            default { "cover-copywriting-workflow.svg" }
        }
    }
    $coverAlt = if ($topic.CoverAlt) { $topic.CoverAlt } else { "$($topic.Title) - Technical SEO & Web Engineering Guide" }

    $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$($topic.Title) | Commeronix</title>
  <meta name="description" content="$($topic.Description)">
  <meta name="keywords" content="$($topic.Keywords)">
  <meta name="author" content="Commeronix Engineering">
  <meta name="theme-color" content="#2563eb">
  <link rel="canonical" href="https://commeronix.com/blog/$($topic.Slug)">
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.json">

  <!-- Schema.org BlogPosting & FAQPage -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "headline": "$($topic.Title)",
        "description": "$($topic.Description)",
        "author": { "@type": "Organization", "name": "Commeronix Engineering", "url": "https://commeronix.com/about" },
        "publisher": { "@type": "Organization", "name": "Commeronix", "logo": { "@type": "ImageObject", "url": "https://commeronix.com/assets/favicon.svg" } },
        "datePublished": "$currentDate",
        "dateModified": "$currentDate",
        "mainEntityOfPage": "https://commeronix.com/blog/$($topic.Slug)"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://commeronix.com/" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://commeronix.com/blog" },
          { "@type": "ListItem", "position": 3, "name": "$($topic.Title)", "item": "https://commeronix.com/blog/$($topic.Slug)" }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
$faqJson
        ]
      }
    ]
  }
  </script>

  <script>
    (function() {
      const savedTheme = localStorage.getItem('commeronix_theme');
      if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    })();
  </script>
  <link rel="stylesheet" href="/style.css">
</head>
<body>

  <!-- Header -->
  <header class="site-header">
    <div class="container">
      <nav class="navbar" aria-label="Main Navigation">
        <a href="/" class="brand-logo" title="Commeronix Home">
          <img src="/assets/favicon.svg" alt="Commeronix Logo" width="36" height="36" class="logo-icon-svg">
          <span>Commero<span class="brand-accent">nix</span></span>
        </a>

        <!-- Universal Quick Search Bar Trigger -->
        <div class="nav-search-wrap">
          <button class="nav-search-btn" id="nav-search-trigger" type="button" aria-label="Search tools (Press Ctrl+K)">
            <svg class="search-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span class="search-placeholder">Search 19+ online utilities...</span>
            <kbd class="search-kbd">Ctrl K</kbd>
          </button>
        </div>

        <div class="nav-actions">
          <ul class="nav-links">
            <li><a href="/tools" class="nav-link">Tools</a></li>
            <li><a href="/blog" class="nav-link active">Blog</a></li>
            <li><a href="/about" class="nav-link">About</a></li>
          </ul>

          <button id="theme-toggle" class="theme-toggle-btn" type="button" aria-label="Toggle Theme">
            <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </button>

          <button class="mobile-toggle" aria-label="Toggle mobile menu" aria-expanded="false">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
    </div>
  </header>

  <main class="main-content">
    <div class="container">
      <article class="article-container">
        <header class="article-header">
          <div class="tool-breadcrumbs">
            <a href="/">Home</a> <span>/</span> <a href="/blog">Blog</a> <span>/</span> <span>$($topic.Badge)</span>
          </div>
          <span class="badge-lime">$($topic.Category)</span>
          <h1 class="article-title">$($topic.Title)</h1>
          <div class="article-meta-bar">
            <div class="article-author-pill">
              <div class="article-author-avatar">CX</div>
              <span>By Commeronix Editorial</span>
            </div>
            <span>•</span>
            <span>Published: $currentDate</span>
            <span>•</span>
            <span>⏱️ $($topic.ReadTime) ($($topic.WordCount))</span>
          </div>
        </header>

        <!-- 16:9 Featured Cover Media -->
        <div class="article-featured-media">
          <img src="/assets/blog/$coverImg" alt="$coverAlt" width="1200" height="675" loading="lazy" decoding="async" class="article-cover-img">
        </div>

        <div class="article-body">
          <p class="article-callout">$($topic.Introduction)</p>
          $sectionsHtml
          <div class="article-tool-cta">
            <div>
              <h4 style="font-size: 1.15rem; margin-bottom: 0.35rem;">Use the free Commeronix tool for this workflow:</h4>
              <p style="font-size: 0.9rem; margin-bottom: 0;">Try the $($topic.ToolName) client-side with 100% privacy and zero latency.</p>
            </div>
            <a href="$($topic.TargetTool)" class="btn-lime">Open $($topic.ToolName) →</a>
          </div>

          <div class="article-faq-section">
            <h2>Frequently Asked Questions</h2>
            $faqHtml
          </div>
        </div>
      </article>
    </div>
  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-bottom">
        <p>&copy; 2026 Commeronix. All rights reserved. Technical Publications.</p>
        <div class="footer-legal-links"><a href="/privacy-policy">Privacy</a><a href="/terms">Terms</a><a href="/tools">All Tools</a></div>
      </div>
    </div>
  </footer>

  <script src="/assets/main.js"></script>
</body>
</html>
"@

    Set-Content -Path $outPath -Value $html -Encoding UTF8
    $newlyPublished += [PSCustomObject]@{
        Slug = $topic.Slug
        Title = $topic.Title
        Date = $currentDate
    }
}

$allHistory = @($history) + $newlyPublished
$allHistory | ConvertTo-Json -Depth 4 | Set-Content -Path $stateFile -Encoding UTF8
Write-Output "Successfully generated and published $($newlyPublished.Count) articles!"
