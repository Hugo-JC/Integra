# Refinement module

The module evaluates explicit observations and returns explainable quality findings.

Current checks: contrast observations, interactive accessible-name observations, heading order, spacing increments, nested surface depth and reduced-motion support.

Each finding has a stable rule ID, severity P0–P3, target, message, user impact, recommendation and verification state. Runtime evidence can be verified; static estimates and design heuristics remain heuristic.

This module does not parse TSX, render pages, crawl the DOM or capture screenshots. Future adapters must collect observations and label evidence before calling it. No global numeric design score is generated; heuristics are review prompts, not automatic defects.
