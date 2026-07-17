import { prisma } from "../../../config/prisma";

export class ProjectRepository {

    async createProject(data: {
        name: string,
        userId: string,

    }) {
        return await prisma.project.create({
            data: {
                name: data.name,
                userId: data.userId,
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

    async deleteProject(id: string, userId: string) {
        return await prisma.project.delete({
            where: {
                id: id,
                userId: userId
            }
        })
    }

}
