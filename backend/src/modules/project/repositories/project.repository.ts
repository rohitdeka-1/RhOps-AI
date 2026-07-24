import { prisma } from "../../../config/prisma";

export class ProjectRepository {

    async createProject(data: {
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
        return await prisma.project.create({
            data: {
                name: data.name,
                userId: data.userId,
                gitRepoUrl: data.gitRepoUrl,
                gitBranch: data.gitBranch,
                manifestPath: data.manifestPath,
                isPrivate: data.isPrivate ?? false,
                gitToken: data.gitToken,
                githubInstallationId: data.githubInstallationId,
                yamlContent: data.yamlContent,
                syncStatus: data.syncStatus,
            }
        })
    }

    async findProjectByIdAndUserId(data: {
        id: string,
        userId: string
    }) {
        return await prisma.project.findUnique({
            where: {
                id: data.id,
                userId: data.userId
            }
        })
    }

    async findProjectsByUserId(userId: string) {
        return await prisma.project.findMany({
            where: {
                userId: userId
            }
        });
    }

    async updateProject(id: string, userId: string, data: {
        name?: string;
        gitRepoUrl?: string;
        gitBranch?: string;
        manifestPath?: string;
        isPrivate?: boolean;
        gitToken?: string;
        githubInstallationId?: string;
        yamlContent?: string;
        syncStatus?: string;
    }) {
        return await prisma.project.updateMany({
            where: {
                id: id,
                userId: userId
            },
            data: {
                ...data
            }
        });
    }

    async deleteProject(id: string, userId: string) {
        return await prisma.project.deleteMany({
            where: {
                id: id,
                userId: userId
            }
        })
    }
}
