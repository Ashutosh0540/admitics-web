import { api } from "./index";
export const chatApi = {
  list: api.listConversations.bind(api),
  create: api.createConversation.bind(api),
  get: api.getConversation.bind(api),
  rename: api.updateConversation.bind(api),
  remove: api.deleteConversation.bind(api),
  messages: api.listMessages.bind(api),
  send: api.sendMessage.bind(api),
};
