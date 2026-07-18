import { ProjectRepository } from "../repositories/project.repository";

export class GetProjectService {
    private projectRepository: ProjectRepository;

    constructor() {
        this.projectRepository = new ProjectRepository();
    }

    async get(id: string, userId: string) {
        const project = await this.projectRepository.findProjectByIdAndUserId({ id, userId });
        if (!project) {
            throw new Error("Project not found or unauthorized");
        }
        return project;
    }
}
