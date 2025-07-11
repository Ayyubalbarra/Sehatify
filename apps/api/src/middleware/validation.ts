import { Request, Response, NextFunction } from 'express';
import { validationResult } from "express-validator";

/**
 * Middleware untuk menangani error validasi dari express-validator.
 * Jika ada error, kirim respons 400 dengan detail error.
 * Jika tidak ada error, lanjutkan ke handler berikutnya.
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Data yang dikirim tidak valid.",
      errors: errors.array(),
    });
  }

  next();
};
