import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminActionLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const AdminActionLogSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  entityType: {
    type: String,
    required: true,
    index: true
  },
  entityId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  details: {
    type: Schema.Types.Mixed,
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for querying logs efficiently
AdminActionLogSchema.index({ entityType: 1, entityId: 1 });
AdminActionLogSchema.index({ userId: 1, timestamp: -1 });

const AdminActionLog = mongoose.model<IAdminActionLog>('AdminActionLog', AdminActionLogSchema);

export default AdminActionLog;