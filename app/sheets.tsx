import { SheetDefinition, registerSheet } from "react-native-actions-sheet";
import SaveConversationSheet from "./components/SaveConversationSheet";
import DeleteConversationsSheet from "./components/DeleteConversationsSheet";
import DeletePatientInfoSheet from "./components/DeletePatientInfoSheet";

interface DeleteObservationPayload {
  observationId: string;
}

registerSheet("convo-sheet", SaveConversationSheet);
registerSheet("delete-convo-sheet", DeleteConversationsSheet);
registerSheet("delete-patient-info-sheet", DeletePatientInfoSheet);

// We extend some of the types here to give us great intellisense
// across the app for all registered sheets.
declare module "react-native-actions-sheet" {
  interface Sheets {
    "convo-sheet": SheetDefinition;
  }
}

export {};
