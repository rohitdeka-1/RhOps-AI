import { ProjectRepository } from "../repositories/project.repository";

export class ListProjectService {
    private projectRepository: ProjectRepository;

    constructor() {
        this.projectRepository = new ProjectRepository();
    }

    async list(userId: string) {
        return await this.projectRepository.findProjectsByUserId(userId);
    }
}
