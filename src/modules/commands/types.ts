export type CommandKind = "orchestrator" | "workflow" | "modifier";
export type CommandRouteStatus = "explicit" | "matched" | "ambiguous" | "fallback" | "modifier-only" | "modifier-needs-context";
export interface CommandDefinition {
  id:string; kind:CommandKind; invocation:string; description:string;
  whenToUse:string[]; notFor:string[]; triggers:string[]; inputs:string[];
  skills:string[]; outputs:string[]; sourceMutation?:"approval-required"|"never";
  requiresActiveContext?:boolean;
}
export interface CommandManifest {
  schemaVersion:"1.0.0"; name:"Integra Command System"; description:string;
  invocation:{orchestrator:"/integra";namespace:"/integra:";bareAliases:"optional-host-adapter-only"};
  routingPolicy:{precedence:string[];broadOrAmbiguousRequests:"orchestrator";
    focusedRequests:"unique-longest-whole-phrase-trigger";
    modifierBehavior:"attach-to-active-workflow-without-replacing-its-context";
    missingModifierContext:"orchestrator-and-ask-one-focused-question";unknownRequests:"orchestrator"};
  executionPolicy:{defaultMode:"review";sourceMutation:"approval-required";previewMutation:"temporary-dom-only";
    approvalScope:"exact-proposed-diff";neverInferApprovalFrom:Array<"command invocation"|"preview acceptance"|"generated patch"|"test success">;
    blockedActionsBeforeApproval:Array<"write-source-files"|"apply-source-diff"|"commit"|"push"|"open-pull-request"|"merge">};
  commands:CommandDefinition[];
}
export interface CommandResolution {command:CommandDefinition;args:string[];}
export interface CommandRouteOptions {activeCommandId?:string;}
export interface IntegraCommandRoute {
  status:CommandRouteStatus;commandId:string;invocation:string;modifierIds:string[];
  candidateCommandIds:string[];matchedTriggers:string[];reason:string;requiresUserClarification:boolean;
}
export interface IntegraExecutionPlan {
  commandId:string;invocation:string;modifierIds:string[];mode:"review";status:"planned";
  approvalRequired:true;sourceMutationAuthorized:false;allowedBeforeApproval:string[];blockedBeforeApproval:string[];
}
