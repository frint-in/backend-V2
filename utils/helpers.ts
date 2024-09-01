
import Organisation from '@/models/Organisation';
import { Request, Response, NextFunction } from 'express';



interface isMaintanerOptions {
orgId: string;
userId: string;
errorMessage: string;
}



export const isUserMaintainer = async (req: Request, res: Response, options: isMaintanerOptions) => {
    try {
  const { orgId, userId, errorMessage} = options;

        // Get the organization by ID
        const org = await Organisation.findById(orgId);

        // If organization is not found, throw an error
        if (!org) {
            return res.status(404).json({ message: ['Organisation not found'] });
          }

        // Check if the userId is present in the maintainer's list
        const isMaintainer = org.maintainer_list.some(maintainerId => maintainerId === userId)

        if (!isMaintainer) {
        return res.status(403).json({ message: [`${errorMessage}`] });
      }
  
    } catch (error) {
        // Log the error and rethrow it
        console.error('Error checking user maintainer status:', error);
        throw error;
    }
};