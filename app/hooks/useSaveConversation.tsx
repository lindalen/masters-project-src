import { postConversation } from "../utils";
import { useAppStore } from "../state";

export const useSaveConversation = () => {
  const messages = useAppStore((state) => state.messages);
  const user_id = useAppStore((state) => state.user?.id);

  const saveConversation = async () => {
    if (!messages || !user_id) return;

    try {
      // Attempt to send the chat message
      const response = await postConversation(user_id, messages);

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  return saveConversation;
};
