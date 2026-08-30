import mongoose from "mongoose";

const MaterialChargeSchema = new mongoose.Schema({
  materials: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
      },
      unit: {
        type: Number,
        required: true,
      },
      cost: {
        type: Number,
        required: true,
      },
    },
  ],
  totalCharge: {
    type: Number,
    required: true,
  },
});

const SheetingPriceSchema = new mongoose.Schema({
  projectType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProjectType",
    required: true,
  },
  roofModel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  roofPreference: {
    type: String,
    enum: ["Single Car Parking", "Double Car Parking", "Custom"],
    required: true,
  },
  span: Number,
  length: Number,
  height: Number,
  typeOfPanel: Number,
  offset: Number,
  sheetThickness: Number,
  centerHeight: Number,
  noOfPanels: Number,
  totalnoOfPanels: Number,
  totalNumberofSheet: Number,
  newLength: Number,
  finalNewlength: Number,
  totalNewLength: Number,
  extraPanel: Number,
  noOfBay: Number,
  cuttingLength: Number,
  finalCuttingLength: Number,
  areaSqFt: Number,
  pricePerSqFt: Number,
  NoofWorkingDays: Number,
  totalSheetingPrice: Number,
  areaImage: String,
  materialCharge: MaterialChargeSchema,
});

const TransportationSchema = new mongoose.Schema({
  transportationslist: [
    {
      vehicleType: String,
      numberOfTrips: Number,
      totalKilometer: Number,
      price: Number,
    },
  ],
  cranePrice: Number,
  otherExpenses: Number,
  totalTransporation: Number,
});

const LabourChargeSchema = new mongoose.Schema({
  sheetingLabour: {
    localWork: { type: Number, default: 0 },
    siteWork: { type: Number, default: 0 },
    totalCost: { type: Number, required: true },
  },
  weldingLabour: {
    localWork: { type: Number, default: 0 },
    siteWork: { type: Number, default: 0 },
    totalCost: { type: Number, required: true },
  },
  transportationLabour: { type: Number, required: true },
  enquiryExpense: { type: Number, required: true },
  foodAndAccommodation: { type: Number, required: true },
  totalLabourCharge: { type: Number, required: true },
});

const EstimateSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    siteVisitorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sitevisitDate: { type: Date },
    sitevisitTime: { type: String },
    sheetingPrice: [SheetingPriceSchema],
    transportations: [TransportationSchema],
    labourCharge: LabourChargeSchema,
    totalEstimate: Number,
    totalAreaSqFt: Number,
    totalmaterialCharge: Number,
    totalNumberofSheetAllArea: Number,
    totalSheetingCost: Number,
    finalTransportationCost: Number,
    totalProjectExpense: Number,
    marginPercentage: { type: Number, default: 15 },
    marginAmount: Number,
    newProjectValue: Number,
    ratePerSqFt: Number,
    sellingRate: Number,
    taxPercentage: { type: Number, default: 18 },
    taxAmount: Number,
    totalBudget: Number,
    taxAdjustment: { type: Number, default: 0 },
    finalRate: Number,
    negotiableAmount: Number,
    status: {
      type: String,
      enum: [
        "Site Visit",
        "Start to Build",
        "Project Evaluation in Progress",
        "Quotation Provided",
        "Awaiting Client Response",
        "Call Back",
        "No Response from Client",
        "Project Rejected from Client",
        "Finished",
      ],
      default: "Site Visit",
    },
  },
  { timestamps: true }
);

const Estimate = mongoose.model("Estimate", EstimateSchema);

export default Estimate;
