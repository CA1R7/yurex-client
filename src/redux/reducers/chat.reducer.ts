import { Action } from "..";

export interface MessageType {
  id: string;
  timestamp: number;
  tag: { code: string | null; pin: number | null };
  username: string;
  isAdmin: boolean;
  verified: boolean;
  message: string;
}

export interface ChatReducer {
  isTeamType: boolean;
  chat_types_menu: boolean;
  chat_input: boolean;
  hidden_chat: boolean;
  current_message: string;
  isTyping: boolean;
  messages: MessageType[];
}

export const chatReducer = (
  state: ChatReducer = {
    isTeamType: false,
    chat_types_menu: false,
    hidden_chat: false,
    chat_input: false,
    isTyping: false,
    current_message: "",
    messages: [],
  },
  action: Action<ChatReducer>,
): ChatReducer => {
  switch (action.type) {
    case "UPDATE_CHAT_STATE":
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
};
