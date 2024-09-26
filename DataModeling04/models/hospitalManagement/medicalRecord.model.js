import mongoose from "mongoose";

const medicalRecodeSchema = new mongoose.Schema({}, { timestamps: true });

export const MedicalRecord = mongoose.model(
  "MedicalRecord",
  medicalRecodeSchema
);
