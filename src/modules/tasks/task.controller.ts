import type { Request, Response } from 'express';
import { TaskService } from './task.service.ts';
import { createTaskSchema, updateTaskSchema, getTasksQuerySchema } from './task.validators.ts';

export class TaskController {
  static async create(req: Request, res: Response) {
    try {
      const { title, description } = createTaskSchema.parse(req.body);
      const task = await TaskService.createTask(req.user.id, title, description);
      res.status(201).json({ success: true, data: task });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { page = '1', limit = '10', status, search } = getTasksQuerySchema.parse(req.query);
      const tasks = await TaskService.getTasks(
        req.user.id,
        Number(page),
        Number(limit),
        status as 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED' | undefined,
        search
      );
      res.json({ success: true, data: tasks });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const task = await TaskService.getTaskById(req.user.id, req.params.id!);
      res.json({ success: true, data: task });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const data = updateTaskSchema.parse(req.body);
      const task = await TaskService.updateTask(req.user.id, req.params.id!, data);
      res.json({ success: true, data: task });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await TaskService.deleteTask(req.user.id, req.params.id!);
      res.json({ success: true, message: 'Task deleted successfully' });
    } catch (err: any) {
      res.status(err.status || 500).json({ success: false, message: err.message });
    }
  }

  static async toggle(req: Request, res: Response) {
      try {
        const { status } = req.body;
        console.log('Requested status:', status);

        const task = await TaskService.updateTaskStatus(
          req.user.id,
          req.params.id!,
          status
        );

        res.json({ success: true, data: task });
      } catch (err: any) {
        res.status(err.status || 500).json({ success: false, message: err.message });
      }
    
  }

}
