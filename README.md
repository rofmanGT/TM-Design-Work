# TrueMedia — Design Work

A design and front-end prototype for **TrueMedia**, an open-source deepfake
detection platform developed as a research project of **Georgetown
University's Media Integrity Initiative**.

This repository is a **UI mockup**: it reproduces the full product flow with
simulated data so the team can evaluate layout, interaction, and tone before
wiring real detection services. There is no backend — analyses, uploads, and
results are simulated client-side.

> **Note on content:** this is a tool for detecting AI-generated media, so the
> interface deliberately contains **no AI-generated long-form copy**. Every
> descriptive passage is either a real UI label or a clearly-marked placeholder
> for the team to fill with reviewed, attributable content.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (class-based dark mode)
- **react-icons** (Heroicons v2)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Routes

| Path | Page |
| --- | --- |
| `/` | Verify Media — submit a URL, file, or text claim |
| `/media/uploading` | Upload / fetch progress screen |
| `/media/analysis` | Media analysis result (ensemble gauge + detectors) |
| `/claim/veracity` | Text-claim veracity result (evidence & sources) |
| `/media/history` | Media + claims history, with search / filter / CSV export |
| `/media/notable` | Notable Cases archive (curated, citable catalog) |
| `/lab` | Component lab — ensemble & detector primitives in isolation |

## Project structure

```
app/                     Route entries (thin; wrap components in <Chrome>)
components/
  Chrome.tsx             Header, collapsible sidebar, theme, global footer
  Footer.tsx             Open-source / academic footer (attribution, cite, license)
  VerifyMediaPage.tsx    Home
  UploadingPage.tsx      Upload-progress screen
  VeracityPage.tsx       Text-claim result
  commercial/            Production result/history/notable pages + sample data
  ensemble/              Reusable verdict primitives (gauge, cards, math)
    verdict.ts           Tier thresholds + ensemble aggregation (single source of truth)
  shared/                Cross-page style maps
```

The ensemble verdict is a **weighted mean** of per-detector confidence scores;
the thresholds and aggregation live in `components/ensemble/verdict.ts`, so
changing the tiers or math there updates every gauge, bar, and badge downstream.

## Citation

If you reference this tool in academic or journalistic work:

```bibtex
@misc{truemedia2026,
  title        = {TrueMedia: Open-Source Deepfake Detection},
  author       = {{Georgetown University Media Integrity Initiative}},
  year         = {2026},
  howpublished = {\url{https://www.truemedia.org}}
}
```

## License

Released for research and public-interest use. See `LICENSE` (to be added by
the team) for the full terms.
