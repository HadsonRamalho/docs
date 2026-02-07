import type { UpdateUser } from "../types/user-types";
import { api } from "./base";

export async function updateProfile(data: UpdateUser) {
  return api.patch("/user/update", data);
}
