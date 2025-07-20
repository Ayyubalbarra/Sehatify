// apps/api/src/models/Notification.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    message: string;
    type: 'new_appointment' | 'stock_low' | 'schedule_update' | 'system_alert' | 'login_attempt' | 'new_patient_registration'; // ✅ DIUBAH: Tambah 'new_patient_registration'
    targetUserIds?: mongoose.Types.ObjectId[]; 
    targetRoles?: string[];   
    relatedEntityId?: mongoose.Types.ObjectId; 
    link?: string; 
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema({
    message: { type: String, required: true },
    type: { 
        type: String, 
        required: true, 
        enum: ['new_appointment', 'stock_low', 'schedule_update', 'system_alert', 'login_attempt', 'new_patient_registration'] // ✅ DIUBAH: Tambah 'new_patient_registration'
    },
    targetUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
    targetRoles: [{ type: String }], 
    relatedEntityId: { type: Schema.Types.ObjectId, index: true }, 
    link: { type: String }, 
    isRead: { type: Boolean, default: false, index: true },
}, { timestamps: true }); 

NotificationSchema.index({ isRead: 1, createdAt: -1 });
NotificationSchema.index({ targetRoles: 1, isRead: 1 });
NotificationSchema.index({ targetUserIds: 1, isRead: 1 });


export default mongoose.model<INotification>('Notification', NotificationSchema);