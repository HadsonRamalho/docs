export interface PublicNotebookResponse {
  id: string;
  title: string;
  user_id: string | null;
  team_id: string | null;
  owner_name: string;
  description: string | null;
  updated_at: string;
}
