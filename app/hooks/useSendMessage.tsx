import { postChatMessage } from "../utils";
import { Role, isChatMessage } from "../types";
import { useAppStore } from "../state";

export const useSendMessage = () => {
  const model = useAppStore((state) => state.model);
  const memory = useAppStore((state) => state.memory);
  const user_id = useAppStore((state) => state.user?.id);
  const messages = useAppStore((state) => state.messages);
  const addMessage = useAppStore((state) => state.addMessage);

  const sendMessage = async (input) => {
    const chatMessage = { role: Role.User, content: input };
    addMessage(chatMessage);

    try {
      // Attempt to send the chat message
      const response = await postChatMessage(
        [...messages, chatMessage],
        user_id,
        memory,
        model
      );

      if (isChatMessage(response)) {
        addMessage(response);
      } else {
        addMessage({ role: Role.AI, content: response });
      }

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  return sendMessage;
};
