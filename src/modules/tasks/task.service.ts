import {prisma} from '../../libs/prisma';

export class TaskService {
  static async createTask(ownerId: string, title: string, description?: string, status?: 'NEW' | 'DONE') {
    return prisma.task.create({
      data: { ownerId, title, description, status },
    });
  }

  static async getTasks(
    ownerId: string,
    page = 1,
    limit = 10,
    status?: 'NEW' | 'DONE',
    search?: string
  ) {
    const where: any = {ownerId, AND: []};

    if (status) { where.AND.push({ status });}

    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      });
    }

    const tasks = await prisma.task.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.task.count({ where });

    return { tasks, total, page, limit };
  }

  static async getTaskById(ownerId: string, taskId: string) {
    const task = await prisma.task.findFirst({ where: { id: taskId, ownerId } });
    if (!task) throw { status: 404, message: 'Task not found' };
    return task;
  }

  static async updateTask(ownerId: string, taskId: string, data: any) {
    await this.getTaskById(ownerId, taskId);
    return prisma.task.update({
      where: { id: taskId },
      data,
    });
  }

  static async deleteTask(ownerId: string, taskId: string) {
    await this.getTaskById(ownerId, taskId);
    return prisma.task.delete({ where: { id: taskId } });
  }


  static async toggleTask(ownerId: string, taskId: string) {
  const task = await this.getTaskById(ownerId, taskId);

  const newStatus = task.status === 'NEW' ? 'DONE' : 'NEW';


  return prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus as 'NEW' | 'DONE' },
  });
}

}
