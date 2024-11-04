"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const logger_1 = require("./logger");
// Configure cloudinary with your credentials
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
});
/**
 * Uploads a file to Cloudinary
 * @param filePath - Path to the file to upload
 * @returns Promise<UploadApiResponse>
 */
const uploadToCloudinary = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.v2.uploader.upload(filePath, {
            folder: 'profile-pictures',
            transformation: [
                { width: 500, height: 500, crop: 'fill' },
                { quality: 'auto' },
            ],
        });
        return result;
    }
    catch (error) {
        logger_1.logger.error('Error uploading to Cloudinary:', error);
        throw new Error('Failed to upload file');
    }
});
exports.uploadToCloudinary = uploadToCloudinary;
/**
 * Removes a file from Cloudinary
 * @param publicId - Public ID of the file to remove
 */
const removeFromCloudinary = (publicId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (error) {
        logger_1.logger.error('Error removing from Cloudinary:', error);
        throw new Error('Failed to remove file');
    }
});
exports.removeFromCloudinary = removeFromCloudinary;
