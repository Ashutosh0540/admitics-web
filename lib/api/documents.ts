import { api } from "./index";
export const documentsApi = {
  list: api.listDocuments.bind(api),
  get: api.getDocument.bind(api),
  upload: api.uploadDocument.bind(api),
  process: api.processDocument.bind(api),
  retry: api.retryDocument.bind(api),
  remove: api.deleteDocument.bind(api),
};
