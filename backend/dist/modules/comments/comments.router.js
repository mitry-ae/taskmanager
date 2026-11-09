"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comments_controller_1 = __importDefault(require("./comments.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const verifyTaskOwnership_middleware_1 = require("../../middlewares/verifyTaskOwnership.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/', auth_middleware_1.authMiddleware, verifyTaskOwnership_middleware_1.verifyTaskOwnership, comments_controller_1.default.getComments);
router.post('/', auth_middleware_1.authMiddleware, verifyTaskOwnership_middleware_1.verifyTaskOwnership, comments_controller_1.default.createComment);
router.patch('/:commentId', auth_middleware_1.authMiddleware, verifyTaskOwnership_middleware_1.verifyTaskOwnership, comments_controller_1.default.updateComment);
router.delete('/:commentId', auth_middleware_1.authMiddleware, verifyTaskOwnership_middleware_1.verifyTaskOwnership, comments_controller_1.default.deleteComment);
exports.default = router;
