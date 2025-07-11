"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
/**
 * Middleware untuk menangani error validasi dari express-validator.
 * Jika ada error, kirim respons 400 dengan detail error.
 * Jika tidak ada error, lanjutkan ke handler berikutnya.
 */
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Data yang dikirim tidak valid.",
            errors: errors.array(),
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
