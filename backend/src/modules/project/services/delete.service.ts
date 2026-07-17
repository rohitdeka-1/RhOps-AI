import { ProjectRepository } from "../repositories/project.repository";

export class DeleteProjectService {

    private projectRepository: ProjectRepository;

    constructor() {
        this.projectRepository = new ProjectRepository();
    }

    deleteProject = async (id: string, userId: string) => {
        try {

            const project = await this.projectRepository.findProjectByIdAndUserId({ id, userId });

            if (!project) {
                throw new Error("Project Not Found");
            }

            await this.projectRepository.deleteProject(id, userId);
            return { message: "Project Deleted Successfully" };
        } catch (err) {
            throw new Error("Error Deleting Project")
        }
    }

}