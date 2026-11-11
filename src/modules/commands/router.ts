import { getCommandManifest } from "./manifest.js";
import type { CommandDefinition, CommandRouteOptions, IntegraCommandRoute, IntegraExecutionPlan } from "./types.js";

const manifest=getCommandManifest();
const commands=manifest.commands;
const orchestrator:CommandDefinition=commands.find((item)=>item.kind==="orchestrator")
  ?? (()=>{throw new Error("Command manifest has no orchestrator.");})();

function normalize(value:string):string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu," ").trim().replace(/\s+/g," ");
}
const triggerIndex = new Map<string, { term: string; normalized: string }[]>(
  commands.map((command) => [
    command.id,
    command.triggers.map((term) => ({ term, normalized: normalize(term) })),
  ]),
);
function matchedTriggers(commandId:string, query:string):string[] {
  const paddedQuery = ` ${query} `;
  return (triggerIndex.get(commandId) ?? [])
    .filter((entry) => entry.normalized.length > 0 && paddedQuery.includes(` ${entry.normalized} `))
    .map((entry) => entry.term);
}
function result(command:CommandDefinition,status:IntegraCommandRoute["status"],reason:string,
  modifiers:string[]=[],candidates:string[]=[],triggers:string[]=[],clarification=false):IntegraCommandRoute {
  return {status,commandId:command.id,invocation:command.invocation,modifierIds:modifiers,
    candidateCommandIds:candidates,matchedTriggers:triggers,reason,requiresUserClarification:clarification};
}

/** Deterministic route planning only: never executes commands, invokes agents or writes files. */
export function routeIntegraRequest(request:string,options:CommandRouteOptions={}):IntegraCommandRoute {
  const raw=request.trim(), normalized=normalize(raw);
  const active=commands.find((item)=>item.id===options.activeCommandId&&item.kind==="workflow");
  if(!normalized) return result(orchestrator,"fallback","Empty request; orchestration must clarify the task.");

  const explicitMatch=raw.match(/^(\/integra(?::[a-z][a-z0-9-]*)?)(?:\s+|$)/i);
  if(explicitMatch) {
    const explicit=commands.find((item)=>item.invocation.toLowerCase()===explicitMatch[1].toLowerCase());
    if(explicit) {
      if(explicit.kind==="modifier") {
        if(active) return result(active,"explicit","Explicit modifier is attached to the active workflow; target and constraints are preserved.",[explicit.id],[],[explicit.invocation]);
        return result(orchestrator,"modifier-needs-context","Modifier has no active workflow or target; ask what it should refine.",[explicit.id],[],[explicit.invocation],true);
      }
      return result(explicit,"explicit","Explicit invocation matched the canonical command manifest.");
    }
  }

  const modifierMatches=commands.filter((item)=>item.kind==="modifier").map((command)=>({
    command,matches:matchedTriggers(command.id,normalized)
  })).filter((item)=>item.matches.length>0);

  const broadMatches=matchedTriggers(orchestrator.id,normalized);
  if(broadMatches.length) return result(orchestrator,"matched","Broad or end-to-end intent is coordinated by the orchestrator.",
    modifierMatches.map((item)=>item.command.id),[],broadMatches);

  const workflowMatches=commands.filter((item)=>item.kind==="workflow").map((command)=>({
    command,matches:matchedTriggers(command.id,normalized)
  })).filter((item)=>item.matches.length>0);
  if(workflowMatches.length) {
    const specificity=(item:typeof workflowMatches[number])=>Math.max(...item.matches.map((term)=>normalize(term).length));
    const longest=Math.max(...workflowMatches.map(specificity));
    const winners=workflowMatches.filter((item)=>specificity(item)===longest);
    if(winners.length>1) return result(orchestrator,"ambiguous",
      "Equal-specificity workflows matched. Do not choose randomly; ask one focused question.",
      modifierMatches.map((item)=>item.command.id),winners.map((item)=>item.command.id),winners.flatMap((item)=>item.matches),true);
    const winner=winners[0]!;
    return result(winner.command,"matched","The unique longest whole-phrase trigger selected this focused workflow.",
      modifierMatches.map((item)=>item.command.id),[],winner.matches);
  }

  if(modifierMatches.length) {
    if(active) return result(active,"modifier-only","Modifier-only request inherits the active workflow, target, brief and constraints.",
      modifierMatches.map((item)=>item.command.id),[],modifierMatches.flatMap((item)=>item.matches));
    return result(orchestrator,"modifier-needs-context","Recognized a modifier but no active target exists; ask which interface or workflow to refine.",
      modifierMatches.map((item)=>item.command.id),[],modifierMatches.flatMap((item)=>item.matches),true);
  }
  return result(orchestrator,"fallback","No focused trigger matched. Preserve the full request and route it through the orchestrator.");
}

export function createIntegraExecutionPlan(route:IntegraCommandRoute):IntegraExecutionPlan {
  const command=commands.find((item)=>item.id===route.commandId)??orchestrator;
  return {commandId:command.id,invocation:command.invocation,modifierIds:[...route.modifierIds],
    mode:"review",status:"planned",approvalRequired:true,sourceMutationAuthorized:false,
    allowedBeforeApproval:["read-project-context","inspect","analyze","prepare-proposal","temporary-dom-preview"],
    blockedBeforeApproval:[...manifest.executionPolicy.blockedActionsBeforeApproval]};
}
