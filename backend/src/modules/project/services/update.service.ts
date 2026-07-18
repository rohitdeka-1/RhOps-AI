import { ProjectRepository } from "../repositories/project.repository";

export class UpdateProjectService {
    private projectRepository: ProjectRepository;

    constructor() {
        this.projectRepository = new ProjectRepository();
    }

    async update(id: string, userId: string, data: { name: string }) {
        const project = await this.projectRepository.findProjectByIdAndUserId({ id, userId });
        if (!project) {
            throw new Error("Project not found or unauthorized");
        }
        
        await this.projectRepository.updateProject(id, userId, data);
        return await this.projectRepository.findProjectByIdAndUserId({ id, userId });
    }
}
