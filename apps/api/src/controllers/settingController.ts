// apps/api/src/controllers/settingController.ts

import { Request, Response, NextFunction } from 'express';
import Setting from '../models/Setting';

class SettingController {
  public async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let settings = await Setting.findOne();
      if (!settings) {
        settings = await Setting.create({});
      }
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }

  public async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedSettings = await Setting.findOneAndUpdate({}, req.body, {
        new: true,
        upsert: true,
        runValidators: true,
      });
      res.json({ success: true, message: 'Pengaturan berhasil diperbarui', data: updatedSettings });
    } catch (error) {
      next(error);
    }
  }
}

export default new SettingController();