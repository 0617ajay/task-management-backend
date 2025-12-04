import { log } from 'node:console';
import {prisma} from '../../libs/prisma.ts';

export class TaskService {
  static async createTask(ownerId: string, title: string, description?: string, status?: 'TODO' | 'IN_PROGRESS' | 'DONE') {
    return prisma.task.create({
      data: { ownerId, title, description, status },
    });
  }

  static async getTasks(
    ownerId: string,
    page = 1,
    limit = 10,
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED',
    search?: string
  ) {
    const where: any = { ownerId };
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };

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


  static async updateTaskStatus(ownerId: string, taskId: string, newStatus: string) {
  const task = await this.getTaskById(ownerId, taskId);

  const allowedTransitions: Record<string, string[]> = {
    TODO: ['IN_PROGRESS', 'ARCHIVED'],
    IN_PROGRESS: ['DONE', 'ARCHIVED'],
    DONE: ['ARCHIVED'],
    ARCHIVED: [] // or allow ['TODO'] if you want to restore
  };

  console.log('Current status:', task.status);
  console.log('New status:', newStatus);
  log('Allowed transitions:', allowedTransitions[task.status]);
  log('Is transition allowed?', allowedTransitions[task.status]?.includes(newStatus));


  if (!allowedTransitions[task.status]?.includes(newStatus)) {
    throw {
      status: 400,
      message: `Invalid status transition: ${task.status} → ${newStatus}`
    };
  }

  return prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus as 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED' },
  });
}

}
