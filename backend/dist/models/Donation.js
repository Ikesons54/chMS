"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Donation = exports.FundraisingCampaign = exports.PaymentMethod = exports.DonationType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var DonationType;
(function (DonationType) {
    DonationType["TITHE"] = "tithe";
    DonationType["OFFERING"] = "offering";
    DonationType["SPECIAL_OFFERING"] = "special_offering";
    DonationType["FUNDRAISING"] = "fundraising";
    DonationType["MISSIONS"] = "missions";
    DonationType["OTHER"] = "other";
})(DonationType || (exports.DonationType = DonationType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["CHECK"] = "check";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
    PaymentMethod["CREDIT_CARD"] = "credit_card";
    PaymentMethod["MOBILE_MONEY"] = "mobile_money";
    PaymentMethod["OTHER"] = "other";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var FundraisingCampaign;
(function (FundraisingCampaign) {
    FundraisingCampaign["BUILDING_PROJECT"] = "building_project";
    FundraisingCampaign["RENOVATION"] = "renovation";
    FundraisingCampaign["EQUIPMENT"] = "equipment";
    FundraisingCampaign["MISSION_TRIP"] = "mission_trip";
    FundraisingCampaign["COMMUNITY_OUTREACH"] = "community_outreach";
    FundraisingCampaign["YOUTH_PROGRAM"] = "youth_program";
    FundraisingCampaign["SPECIAL_PROJECT"] = "special_project";
})(FundraisingCampaign || (exports.FundraisingCampaign = FundraisingCampaign = {}));
const donationSchema = new mongoose_1.Schema({
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    type: {
        type: String,
        enum: Object.values(DonationType),
        required: [true, 'Donation type is required']
    },
    donor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Donor is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: Object.values(PaymentMethod),
        required: [true, 'Payment method is required']
    },
    receiptNumber: {
        type: String,
        required: true,
        unique: true
    },
    notes: String,
    titheDetails: {
        titheOwner: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        personPaying: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        month: String,
        year: Number
    },
    fundraisingDetails: {
        campaign: {
            type: String,
            enum: Object.values(FundraisingCampaign)
        },
        projectName: String,
        targetAmount: Number
    },
    recordedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastModifiedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastModifiedAt: Date
}, {
    timestamps: true
});
// Add index for faster receipt lookup
donationSchema.index({ receiptNumber: 1 });
// Add compound index for date range queries
donationSchema.index({ date: -1, type: 1 });
exports.Donation = mongoose_1.default.model('Donation', donationSchema);
