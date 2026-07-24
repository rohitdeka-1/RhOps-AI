import { ProjectRepository } from "../repositories/project.repository";

export class CreateProjectService {
    private projectRepository: ProjectRepository;

    constructor() {
        this.projectRepository = new ProjectRepository();
    }

    async create(data: {
        name: string;
        userId: string;
        gitRepoUrl?: string;
        gitBranch?: string;
        manifestPath?: string;
        isPrivate?: boolean;
        gitToken?: string;
        githubInstallationId?: string;
        yamlContent?: string;
        syncStatus?: string;
    }) {
        return this.projectRepository.createProject(data);
    }
}
