# Research Notes

## Round 1: Official Model And API Efficiency Sources

Key findings:

- Model choice should match task complexity. OpenAI model guidance positions flagship models for complex reasoning and coding while smaller variants are intended for lower-latency and lower-cost work.
- Prompt caching rewards stable prefixes. Static instructions, tools, schemas, examples, and reusable project context should be placed before dynamic task content.
- Prompt caching is automatic in recent OpenAI models and reports cached token counts in usage metadata.
- Batch processing is useful for offline classification, evals, repository indexing, and large non-urgent analysis.
- Reasoning effort should be controlled. Deep reasoning is valuable for complex tasks but wasteful for mechanical work.

Design impact for Downstroke:

- Use model tiers, not fixed model IDs.
- Put static Downstroke instructions before dynamic task payloads.
- Reuse stable project summaries instead of re-reading entire repositories.
- Send non-urgent bulk work through batch mode when available.
- Treat reasoning as a budgeted resource.

Sources:

- OpenAI Prompt Caching: https://platform.openai.com/docs/guides/prompt-caching
- OpenAI Prompting: https://platform.openai.com/docs/guides/prompting
- OpenAI Prompt Engineering: https://platform.openai.com/docs/guides/prompt-engineering
- OpenAI Reasoning Best Practices: https://platform.openai.com/docs/guides/reasoning-best-practices
- OpenAI Batch API: https://platform.openai.com/docs/guides/batch/
- OpenAI Models: https://developers.openai.com/api/docs/models

## Round 2: Routing, Cascades, Compression, And Semantic Caching

Key findings:

- FrugalGPT frames cost reduction as prompt adaptation, LLM approximation, and LLM cascades. Its experiments show that cascades can preserve or improve quality while reducing cost substantially when trained/evaluated for the task distribution.
- RouteLLM routes between weaker and stronger models using preference data to reduce cost while preserving quality.
- LLMLingua shows that prompt compression can reduce long prompt cost and latency, but compression has a quality tradeoff and needs task-aware verification.
- Semantic caching can reduce repeated API calls for semantically similar requests, but it is only safe for low-risk, deterministic, or reviewable outputs.

Design impact for Downstroke:

- Use cascades: small model first, strong model only on uncertainty or failed verification.
- Use routers with explicit escalation triggers.
- Use prompt compression for retrieval, logs, tool output, and large docs, not for legal/security/business-critical facts without verification.
- Use semantic cache only when freshness and safety rules allow.

Sources:

- FrugalGPT: https://arxiv.org/abs/2305.05176
- RouteLLM: https://arxiv.org/abs/2406.18665
- LLMLingua: https://arxiv.org/abs/2310.05736
- Microsoft LLMLingua project: https://www.microsoft.com/en-us/research/project/llmlingua/llmlingua/
- GPT Semantic Cache: https://arxiv.org/abs/2411.05276

## Round 3: Production Context Management

Key findings:

- Google Gemini context caching documents implicit caching, minimum token thresholds by model, and better cache hits when large common content appears at the beginning of prompts.
- Anthropic prompt caching documents automatic and explicit cache breakpoints, reusable static content placement, cache lifetimes, and pricing multipliers for cache writes and reads.
- Claude Code cost guidance emphasizes proactive context management: monitor usage, clear between unrelated tasks, and compact with instructions.
- LangChain message trimming preserves valid chat structure while reducing history to a token budget.
- Recent prompt caching research warns that aggressive pruning can break prefix matching; stable prompt layout matters.

Design impact for Downstroke:

- Preserve stable prompt prefixes.
- Keep dynamic tool results and volatile content near the end.
- Use compaction with explicit preservation rules.
- Trim conversation context by relevance and recency while keeping system/project rules intact.
- Track cache hit rates and token usage in project telemetry.

Sources:

- Gemini Context Caching: https://ai.google.dev/gemini-api/docs/caching
- Gemini Generate Content Caching: https://ai.google.dev/gemini-api/docs/generate-content/caching
- Anthropic Prompt Caching: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
- Claude Code Costs: https://docs.anthropic.com/en/docs/claude-code/costs
- LangChain trim_messages: https://reference.langchain.com/python/langchain-core/messages/utils/trim_messages
- TokenPilot: https://arxiv.org/abs/2606.17016
- Prompt Cache: https://arxiv.org/abs/2311.04934
- Don't Break the Cache: https://arxiv.org/abs/2601.06007

