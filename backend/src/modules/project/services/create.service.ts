import { ProjectRepository } from "../repositories/project.repository";

export class CreateProjectService {
    private projectRepository: ProjectRepository;

    constructor() {
        this.projectRepository = new ProjectRepository();
    }

    async create(data: { name: string; userId: string }) {
        return this.projectRepository.createProject(data);
    }
}
