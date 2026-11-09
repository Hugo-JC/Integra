import { describe,expect,it } from "vitest";
import { createIntegraExecutionPlan,routeIntegraRequest } from "../src/modules/commands/router.js";
describe("Integra command routing",()=>{
  it("routes broad end-to-end requests to the orchestrator",()=>{expect(routeIntegraRequest("Build a complete SaaS application from briefing to implementation").commandId).toBe("integra");});
  it("routes UX shaping requests to the shape workflow",()=>{const r=routeIntegraRequest("mapear fluxo de onboarding e arquitetura de informação");expect(r.commandId).toBe("shape");expect(r.status).toBe("matched");});
  it("routes a focused Portuguese accessibility request",()=>{const r=routeIntegraRequest("Faz uma auditoria de acessibilidade e revê a navegação por teclado");expect(r.commandId).toBe("accessibility");expect(r.status).toBe("matched");});
  it("normalizes accents and punctuation for whole-phrase matching",()=>{expect(routeIntegraRequest("Quero uma AUDITORIA — DE ACESSIBILIDADE!").commandId).toBe("accessibility");});
  it("does not match partial words",()=>{expect(routeIntegraRequest("uma barbearia").commandId).toBe("integra");});
  it("returns ambiguity instead of choosing one equally specific workflow",()=>{const r=routeIntegraRequest("review interface");expect(r.status).toBe("ambiguous");expect(r.candidateCommandIds).toContain("critique");expect(r.candidateCommandIds).toContain("audit");});
  it("routes strategic color refinement to the colorize modifier",()=>{const r=routeIntegraRequest("colorize this monochrome interface",{activeCommandId:"generate"});expect(r.commandId).toBe("generate");expect(r.modifierIds).toContain("colorize");expect(r.requiresUserClarification).toBe(false);});
  it("attaches modifier-only requests to the active workflow",()=>{const r=routeIntegraRequest("melhorar composição e espaçamento",{activeCommandId:"generate"});expect(r.commandId).toBe("generate");expect(r.modifierIds).toContain("layout");expect(r.requiresUserClarification).toBe(false);});
  it("does not apply modifiers when there is no active target",()=>{const r=routeIntegraRequest("/integra:polish");expect(r.commandId).toBe("integra");expect(r.modifierIds).toContain("polish");expect(r.requiresUserClarification).toBe(true);});
  it("creates a review-only plan that cannot authorize source mutation",()=>{const plan=createIntegraExecutionPlan(routeIntegraRequest("gerar componente"));expect(plan.mode).toBe("review");expect(plan.approvalRequired).toBe(true);expect(plan.sourceMutationAuthorized).toBe(false);expect(plan.blockedBeforeApproval).toContain("write-source-files");expect(plan.blockedBeforeApproval).toContain("merge");});
});
