import type { UpdateUser } from "../types/user-types";
import { api } from "./base";

export async function updateProfile(data: UpdateUser) {
  return api.patch("/user/update", data);
}

export async function deleteAccount() {
  return api.delete("/user");
}

export async function linkGithub() {
  return api.patch("/user/link/github");
}
