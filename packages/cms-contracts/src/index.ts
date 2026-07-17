import { createHash } from "node:crypto";

export const cmsFieldTypes = ["string", "text", "rich-text", "number", "boolean", "date", "datetime", "media", "relation", "json", "slug"] as const;
export type CmsFieldType = typeof cmsFieldTypes[number];
export type CmsValidation = { minLength?: number; maxLength?: number; minimum?: number; maximum?: number; format?: "email" | "uri" | "uuid"; enum?: (string | number | boolean)[] };
export type CmsField = { id: string; apiName: string; type: CmsFieldType; required: boolean; localized: boolean; validation: CmsValidation; readCapabilities: string[]; writeCapabilities: string[]; public: boolean; options: Record<string, unknown> };
export type CmsContentType = { id: string; apiName: string; displayNameKey: string; fields: CmsField[] };
export type CmsCanonicalContentContract = { schemaVersion: 1; revision: number; contentTypes: CmsContentType[] };
export type CmsSourceFamily = "prisma" | "drizzle" | "typeorm" | "ef-core" | "strapi" | "payload" | "nextjs" | "nestjs" | "express" | "graphql";
export type CmsProvenance = { path: string; sourceHash: string; line: number; family: CmsSourceFamily; kind: "content" | "endpoint" };
export type CmsUnknownCoverage = { path: string; line: number; reason: string };
export type CmsProposal = { schemaVersion: 1; proposalId: string; instanceId: string; environmentId: string; sourceFamily: CmsSourceFamily; sourcePath: string; sourceHash: string; scannedAt: string; status: "unconfirmed" | "accepted" | "rejected" | "drifted"; candidates: { kind: "content" | "endpoint"; name: string; method?: string; path?: string }[]; provenance: CmsProvenance[]; confidence: number; confidenceReasons: string[]; unknownCoverage: CmsUnknownCoverage[]; canonicalPlanHash: string | null };
export type CmsProposalDecision = { schemaVersion: 1; decisionId: string; proposalId: string; decision: "accepted" | "rejected"; actorId: string; instanceId: string; environmentId: string; sourceHash: string; canonicalPlanHash: string; previousContractHash: string | null; decidedAt: string; reason?: string };
export type CmsProposalDrift = { schemaVersion: 1; priorProposalId: string; replacementProposalId: string; priorSourceHash: string; replacementSourceHash: string; detectedAt: string };
export type CmsCompatibility = "additive" | "compatible-expand" | "public-breaking" | "destructive";
export type CmsContractChange = { kind: "add" | "change" | "remove"; contentTypeId: string; fieldId: string | null; compatibility: CmsCompatibility };
export type CmsContractDiff = { previousHash: string; nextHash: string; compatibility: CmsCompatibility; changes: CmsContractChange[] };
export type CmsContentValues = Record<string, unknown>;
export type CmsContentScope = { instanceId: string; projectId: string; environmentId: string };
export type CmsContentCreate = CmsContentScope & { contentTypeId: string; actorUserId: string; requestId: string; locale: string; translationGroupId?: string; values: CmsContentValues };
export type CmsContentMutation = CmsContentScope & { entryId: string; contentTypeId: string; actorUserId: string; requestId: string; expectedRevisionId: string | null; values: CmsContentValues; requestedFieldIds: string[]; relationFieldIds: string[] };
export type CmsContentQuery = CmsContentScope & { entryId: string; actorUserId: string; requestedFieldIds: string[] };
export type CmsContentPurgeEvidence = CmsContentScope & { evidenceId: string; entryId: string; resourceVersion: string; ownerUserId: string; approvalReference: string; approvalAt: string; affectedStateAt: string; databaseBackupId: string; databaseChecksum: string; mediaCheckpoint: string; mediaProvider: string; mediaManifestHash: string; isolatedRestorePassed: boolean; isolatedRestoreAt: string; verifiedAt: string; verifier: string };
export type CmsAssetPrivacy = "private" | "public";
export type CmsAssetKind = "image" | "video" | "audio" | "document";
export type CmsAssetUpload = CmsContentScope & { actorUserId: string; requestId: string; originalFilename: string; declaredMime: string; expectedBytes: number; expectedSha256?: string; maximumBytes: number; privacy: CmsAssetPrivacy };
export type CmsAsset = CmsContentScope & { id: string; ownerUserId: string; storageKey: string; originalFilename: string; detectedMime: string; kind: CmsAssetKind; byteSize: number; sha256: string; privacy: CmsAssetPrivacy; state: "finalized" | "orphaned" | "trashed" };
export type CmsAssetUsage = CmsContentScope & { assetId: string; revisionId: string; entryId: string; fieldId: string; position: number };
export type CmsAssetDelivery = { disposition: "attachment" | "inline"; cacheControl: "no-store" | "public, max-age=31536000, immutable"; contentType: string; headers: { "X-Content-Type-Options": "nosniff"; "Content-Security-Policy": "default-src 'none'; sandbox" } };
export const cmsLocalAssetMaximumBytes = 25 * 1024 * 1024;

export function validateCmsAssetUpload(value: unknown): value is CmsAssetUpload {
  if (!object(value) || !exact(value, ["instanceId","projectId","environmentId","actorUserId","requestId","originalFilename","declaredMime","expectedBytes","expectedSha256","maximumBytes","privacy"])) return false;
  return [value.instanceId,value.projectId,value.environmentId,value.actorUserId,value.requestId].every((item) => typeof item === "string" && item.length > 0) && typeof value.originalFilename === "string" && value.originalFilename.length > 0 && value.originalFilename.length <= 255 && typeof value.declaredMime === "string" && value.declaredMime.length > 0 && value.declaredMime.length <= 100 && (value.expectedSha256 === undefined || typeof value.expectedSha256 === "string" && /^[a-f0-9]{64}$/.test(value.expectedSha256)) && Number.isSafeInteger(value.expectedBytes) && Number(value.expectedBytes) > 0 && Number.isSafeInteger(value.maximumBytes) && Number(value.maximumBytes) <= cmsLocalAssetMaximumBytes && Number(value.expectedBytes) <= Number(value.maximumBytes) && ["private","public"].includes(String(value.privacy));
}

const object = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const exact = (value: Record<string, unknown>, keys: readonly string[]): boolean => Object.keys(value).every((key) => keys.includes(key));
const id = (value: unknown): value is string => typeof value === "string" && /^[a-z][a-z0-9-]{2,63}$/.test(value);
const apiName = (value: unknown): value is string => typeof value === "string" && /^[a-z][a-zA-Z0-9]{1,63}$/.test(value);
const capabilities = (value: unknown): value is string[] => Array.isArray(value) && new Set(value).size === value.length && value.every((item) => typeof item === "string" && /^cms\.[a-z][a-z0-9.-]+$/.test(item));
const allowedValidation: Record<CmsFieldType, readonly string[]> = { string: ["minLength", "maxLength", "format", "enum"], text: ["minLength", "maxLength"], "rich-text": ["minLength", "maxLength"], number: ["minimum", "maximum", "enum"], boolean: [], date: ["minimum", "maximum"], datetime: ["minimum", "maximum"], media: [], relation: [], json: [], slug: ["minLength", "maxLength"] };

function validField(value: unknown, targets: Set<string>): value is CmsField {
  if (!object(value) || !exact(value, ["id", "apiName", "type", "required", "localized", "validation", "readCapabilities", "writeCapabilities", "public", "options"]) || !id(value.id) || !apiName(value.apiName) || !cmsFieldTypes.includes(value.type as CmsFieldType) || typeof value.required !== "boolean" || typeof value.localized !== "boolean" || typeof value.public !== "boolean" || !capabilities(value.readCapabilities) || !capabilities(value.writeCapabilities) || !object(value.validation) || !object(value.options)) return false;
  const type = value.type as CmsFieldType;
  if (!Object.keys(value.validation).every((key) => allowedValidation[type].includes(key))) return false;
  const validation = value.validation;
  if (("minLength" in validation && (!Number.isInteger(validation.minLength) || Number(validation.minLength) < 0)) || ("maxLength" in validation && (!Number.isInteger(validation.maxLength) || Number(validation.maxLength) < 0)) || Number(validation.minLength ?? 0) > Number(validation.maxLength ?? Infinity)) return false;
  if (("minimum" in validation && (typeof validation.minimum !== "number" || !Number.isFinite(validation.minimum))) || ("maximum" in validation && (typeof validation.maximum !== "number" || !Number.isFinite(validation.maximum))) || Number(validation.minimum ?? -Infinity) > Number(validation.maximum ?? Infinity)) return false;
  if ("format" in validation && !["email", "uri", "uuid"].includes(String(validation.format))) return false;
  if ("enum" in validation) {
    if (!Array.isArray(validation.enum) || validation.enum.length === 0 || new Set(validation.enum.map((item) => `${typeof item}:${String(item)}`)).size !== validation.enum.length) return false;
    const expected = type === "number" ? "number" : type === "boolean" ? "boolean" : "string";
    if (!validation.enum.every((item) => typeof item === expected && (typeof item !== "number" || Number.isFinite(item)))) return false;
  }
  if (type === "relation") return exact(value.options, ["targetContentTypeId", "cardinality"]) && id(value.options.targetContentTypeId) && targets.has(value.options.targetContentTypeId) && ["one", "many"].includes(String(value.options.cardinality));
  if (type === "media") return exact(value.options, ["cardinality", "allowedKinds"]) && ["one", "many"].includes(String(value.options.cardinality)) && Array.isArray(value.options.allowedKinds) && value.options.allowedKinds.length > 0 && new Set(value.options.allowedKinds).size === value.options.allowedKinds.length && value.options.allowedKinds.every((kind) => ["image", "video", "audio", "document"].includes(String(kind)));
  return Object.keys(value.options).length === 0;
}

export function validateCanonicalContract(value: unknown): { valid: boolean; blockers: string[] } {
  const blockers: string[] = [];
  if (!object(value) || !exact(value, ["schemaVersion", "revision", "contentTypes"]) || value.schemaVersion !== 1 || !Number.isInteger(value.revision) || Number(value.revision) < 1 || !Array.isArray(value.contentTypes)) return { valid: false, blockers: ["Canonical contract shape is invalid"] };
  const targets = new Set<string>(); const names = new Set<string>();
  for (const candidate of value.contentTypes) {
    if (!object(candidate) || !exact(candidate, ["id", "apiName", "displayNameKey", "fields"]) || !id(candidate.id) || !apiName(candidate.apiName) || typeof candidate.displayNameKey !== "string" || !/^[a-z][a-z0-9_.-]+$/.test(candidate.displayNameKey) || !Array.isArray(candidate.fields) || targets.has(candidate.id) || names.has(candidate.apiName)) blockers.push("Content type is invalid or duplicated");
    else { targets.add(candidate.id); names.add(candidate.apiName); }
  }
  for (const candidate of value.contentTypes) if (object(candidate) && Array.isArray(candidate.fields)) {
    const fieldIds = new Set<string>(); const fieldNames = new Set<string>();
    for (const field of candidate.fields) {
      if (!validField(field, targets) || fieldIds.has(field.id) || fieldNames.has(field.apiName)) blockers.push("Field is invalid or duplicated");
      else { fieldIds.add(field.id); fieldNames.add(field.apiName); }
    }
  }
  return { valid: blockers.length === 0, blockers };
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (object(value)) return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}

function jsonValue(value: unknown, stack = new Set<object>()): boolean {
  if (value === null || typeof value === "string" || typeof value === "boolean" || typeof value === "number" && Number.isFinite(value)) return true;
  if (!Array.isArray(value) && (!object(value) || Object.getPrototypeOf(value) !== Object.prototype) || stack.has(value as object)) return false;
  stack.add(value as object);
  const valid = Array.isArray(value) ? value.every((item) => jsonValue(item, stack)) : Object.values(value as Record<string, unknown>).every((item) => jsonValue(item, stack));
  stack.delete(value as object);
  return valid;
}

export function cmsContentValueEqual(left: unknown, right: unknown): boolean {
  return jsonValue(left) && jsonValue(right) && JSON.stringify(canonical(left)) === JSON.stringify(canonical(right));
}

export function cmsContentValuesHash(values: CmsContentValues): string {
  if (!object(values) || Object.keys(values).some((key) => !id(key)) || !jsonValue(values)) throw new Error("Content values must be finite acyclic JSON keyed by stable field IDs");
  return createHash("sha256").update(JSON.stringify(canonical(values))).digest("hex");
}

export type CmsValidatedContent = { writableFieldIds: string[]; readableFieldIds: string[]; relations: { fieldId: string; targetContentTypeId: string; cardinality: "one" | "many" }[]; media: { fieldId: string; cardinality: "one" | "many"; allowedKinds: CmsAssetKind[]; public: boolean }[]; hasMedia: boolean };

function validContentFieldValue(field: CmsField, value: unknown): boolean {
  const scalar = field.type === "number" ? typeof value === "number" && Number.isFinite(value) : field.type === "boolean" ? typeof value === "boolean" : ["string", "text", "rich-text", "date", "datetime", "slug"].includes(field.type) ? typeof value === "string" : field.type === "relation" ? field.options.cardinality === "many" ? Array.isArray(value) && value.every((item) => typeof item === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item)) : typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) : jsonValue(value);
  if (!scalar) return false;
  const validation = field.validation;
  if (typeof value === "string" && (value.length < (validation.minLength ?? 0) || value.length > (validation.maxLength ?? Infinity))) return false;
  if (typeof value === "number" && (value < (validation.minimum ?? -Infinity) || value > (validation.maximum ?? Infinity))) return false;
  if (validation.enum && !validation.enum.some((item) => Object.is(item, value))) return false;
  if (validation.format === "email" && (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) return false;
  if (validation.format === "uuid" && (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))) return false;
  if (validation.format === "uri") { try { if (typeof value !== "string" || !new URL(value).protocol) return false; } catch { return false; } }
  if (field.type === "date" && (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`)))) return false;
  if (field.type === "datetime" && (typeof value !== "string" || Number.isNaN(Date.parse(value)))) return false;
  return true;
}

export function validateCmsContentValues(contract: CmsCanonicalContentContract, contentTypeId: string, values: CmsContentValues, capabilities: readonly string[]): CmsValidatedContent {
  if (!validateCanonicalContract(contract).valid) throw new Error("Accepted content contract is invalid");
  const type = contract.contentTypes.find(({ id: candidate }) => candidate === contentTypeId); if (!type) throw new Error("Content type is not accepted");
  const fields = new Map(type.fields.map((field) => [field.id, field]));
  if (Object.keys(values).some((fieldId) => !fields.has(fieldId))) throw new Error("Content contains an unknown field");
  for (const field of type.fields) {
    const present = Object.hasOwn(values, field.id); if (field.required && !present) throw new Error(`Required field is missing: ${field.id}`); if (!present) continue;
    if (!validContentFieldValue(field, values[field.id])) throw new Error(`Content field has an invalid value: ${field.id}`);
  }
  const granted = new Set(capabilities); const allowed = (required: string[]) => required.every((capability) => granted.has(capability));
  return { writableFieldIds: type.fields.filter((field) => allowed(field.writeCapabilities)).map(({ id }) => id), readableFieldIds: type.fields.filter((field) => field.public || allowed(field.readCapabilities)).map(({ id }) => id), relations: type.fields.filter((field) => field.type === "relation").map((field) => ({ fieldId: field.id, targetContentTypeId: String(field.options.targetContentTypeId), cardinality: field.options.cardinality as "one" | "many" })), media: type.fields.filter((field) => field.type === "media").map((field) => ({ fieldId: field.id, cardinality: field.options.cardinality as "one" | "many", allowedKinds: field.options.allowedKinds as CmsAssetKind[], public: field.public })), hasMedia: type.fields.some((field) => field.type === "media" && Object.hasOwn(values, field.id)) };
}

export function validateCmsContentCreate(value: unknown): value is CmsContentCreate {
  if (!object(value) || !exact(value, ["instanceId", "projectId", "environmentId", "contentTypeId", "actorUserId", "requestId", "locale", "translationGroupId", "values"])) return false;
  const required = [value.instanceId, value.projectId, value.environmentId, value.actorUserId, value.requestId, value.locale];
  if (required.some((item) => typeof item !== "string" || !item) || !id(value.contentTypeId) || value.translationGroupId !== undefined && (typeof value.translationGroupId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.translationGroupId))) return false;
  try { cmsContentValuesHash(value.values as CmsContentValues); return true; } catch { return false; }
}

export function canonicalContractHash(value: CmsCanonicalContentContract): string {
  const validation = validateCanonicalContract(value); if (!validation.valid) throw new Error(validation.blockers.join("; "));
  return createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
}

export function diffCanonicalContracts(previous: CmsCanonicalContentContract, next: CmsCanonicalContentContract): CmsContractDiff {
  const previousHash = canonicalContractHash(previous); const nextHash = canonicalContractHash(next); const changes: CmsContractChange[] = [];
  const priorTypes = new Map(previous.contentTypes.map((type) => [type.id, type])); const nextTypes = new Map(next.contentTypes.map((type) => [type.id, type]));
  for (const type of previous.contentTypes) if (!nextTypes.has(type.id)) changes.push({ kind: "remove", contentTypeId: type.id, fieldId: null, compatibility: "destructive" });
  for (const type of next.contentTypes) {
    const prior = priorTypes.get(type.id); if (!prior) { changes.push({ kind: "add", contentTypeId: type.id, fieldId: null, compatibility: "additive" }); continue; }
    if (prior.apiName !== type.apiName) changes.push({ kind: "change", contentTypeId: type.id, fieldId: null, compatibility: "public-breaking" });
    if (prior.displayNameKey !== type.displayNameKey) changes.push({ kind: "change", contentTypeId: type.id, fieldId: null, compatibility: "compatible-expand" });
    const priorFields = new Map(prior.fields.map((field) => [field.id, field])); const nextFields = new Map(type.fields.map((field) => [field.id, field]));
    for (const field of prior.fields) if (!nextFields.has(field.id)) changes.push({ kind: "remove", contentTypeId: type.id, fieldId: field.id, compatibility: "destructive" });
    for (const field of type.fields) { const old = priorFields.get(field.id); if (!old) changes.push({ kind: "add", contentTypeId: type.id, fieldId: field.id, compatibility: field.required ? "public-breaking" : "compatible-expand" }); else if (JSON.stringify(canonical(old)) !== JSON.stringify(canonical(field))) changes.push({ kind: "change", contentTypeId: type.id, fieldId: field.id, compatibility: old.type !== field.type ? "destructive" : "public-breaking" }); }
  }
  const compatibility = changes.some(({ compatibility }) => compatibility === "destructive") ? "destructive" : changes.some(({ compatibility }) => compatibility === "public-breaking") ? "public-breaking" : changes.some(({ compatibility }) => compatibility === "compatible-expand") ? "compatible-expand" : "additive";
  return { previousHash, nextHash, compatibility, changes };
}
