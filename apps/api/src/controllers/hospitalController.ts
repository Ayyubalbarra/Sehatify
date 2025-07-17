// apps/api/src/controllers/hospitalController.ts
import { Request, Response, NextFunction } from 'express';
import Hospital from '../models/Hospital';

class HospitalController {
  constructor() {
    this.getHospitals = this.getHospitals.bind(this);
  }

  public async getHospitals(req: Request, res: Response, next: NextFunction) {
    try {
      const hospitals = await Hospital.find().populate('polyclinics', 'name department').lean();
      res.json({ success: true, data: hospitals });
    } catch (error) {
      next(error);
    }
  }
}

export default new HospitalController();