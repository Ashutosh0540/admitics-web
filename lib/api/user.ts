import { api } from "./index";
export const userApi = { me: api.getUser.bind(api) };
