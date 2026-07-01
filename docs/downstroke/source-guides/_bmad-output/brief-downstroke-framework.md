# BMAD Brief: Downstroke Framework

## Problem

The current boilerplate captures a strong AI-assisted delivery process, but it is copied manually as a whole. This makes it hard to install only the needed pieces, update repeated patterns, version docs, or reuse specific modules across different project types.

## Product Goal

Create Downstroke: a modular framework for AI-assisted software delivery that installs only the project discipline needed for each repo.

## Users

| User | Goal |
| --- | --- |
| Carlos / framework author | Convert proven project practice into reusable modules |
| AI-assisted developer | Start projects with clear rules and gates |
| Senior dev/team lead | Enforce SPEC, QA and production discipline |
| Future contributor | Add modules/presets without breaking existing users |

## Initial Scope

MVP:

- preserve existing boilerplate;
- create monorepo;
- extract first modules;
- build CLI with `init`, `add`, `doctor`;
- support preset `lite`;
- avoid file overwrite;
- create doctor checks.

## Out Of Scope

- agent runtime;
- RAG engine;
- dashboard SaaS;
- visual editor;
- remote marketplace;
- plugin API for third parties;
- replacing BMAD/CodeGraph/Caveman/Ponytail.

## Success

Downstroke is successful when the current boilerplate can remain in use, while the new framework can install the same discipline in smaller pieces.

