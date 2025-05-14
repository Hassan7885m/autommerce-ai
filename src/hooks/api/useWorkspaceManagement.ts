import { db } from '@/integrations/database/client';
import { toast } from "sonner";
import { Workspace } from "@/types/workspace.types";

export const useWorkspaceManagement = (userId: string | null) => {
  const createWorkspace = async (name: string, description: string) => {
    try {
      if (!userId) {
        toast.error("You must be logged in to create a workspace");
        return null;
      }

      const result = await db.query(
        `INSERT INTO workspaces (name, description, owner_user_id) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [name, description, userId]
      );

      return result.rows[0];
    } catch (error: any) {
      console.error("Error creating workspace:", error);
      toast.error(`Failed to create workspace: ${error.message}`);
      return null;
    }
  };

  const deleteWorkspace = async (id: string) => {
    try {
      await db.query('DELETE FROM workspaces WHERE id = $1 AND owner_user_id = $2', [id, userId]);
      toast.success("Workspace deleted successfully");
      return true;
    } catch (error: any) {
      console.error("Error deleting workspace:", error);
      toast.error(`Failed to delete workspace: ${error.message}`);
      return false;
    }
  };

  const fetchWorkspaces = async (): Promise<Workspace[]> => {
    if (!userId) {
      return [];
    }
    
    try {
      const result = await db.query(
        `SELECT * FROM workspaces WHERE owner_user_id = $1`,
        [userId]
      );
      
      return result.rows as Workspace[];
    } catch (error: any) {
      console.error("Error fetching workspaces:", error);
      toast.error("Failed to load workspaces");
      return [];
    }
  };

  const updateWorkspace = async (id: string, name: string, description: string): Promise<boolean> => {
    try {
      const result = await db.query(
        `UPDATE workspaces SET name = $1, description = $2 WHERE id = $3 AND owner_user_id = $4`,
        [name, description, id, userId]
      );

      if (result.rowCount === 0) {
        toast.error("No workspace found or you do not have permission to update it.");
        return false;
      }
      
      toast.success(`Workspace "${name}" updated successfully`);
      return true;
      
    } catch (error: any) {
      console.error("Error updating workspace:", error);
      toast.error(`Failed to update workspace: ${error.message}`);
      return false;
    }
  };

  return {
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  };
};