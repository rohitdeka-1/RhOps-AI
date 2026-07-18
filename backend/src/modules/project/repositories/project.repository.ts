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

    async findProjectsByUserId(userId: string) {
        return await prisma.project.findMany({
            where: {
                userId: userId
            }
        });
    }

    async updateProject(id: string, userId: string, data: { name: string }) {
        return await prisma.project.updateMany({
            where: {
                id: id,
                userId: userId
            },
            data: {
                name: data.name
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
