"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tags_controller_1 = __importDefault(require("./tags.controller"));
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authMiddleware, tags_controller_1.default.getTags);
router.post('/', auth_middleware_1.authMiddleware, tags_controller_1.default.createTag);
router.delete('/:id', auth_middleware_1.authMiddleware, tags_controller_1.default.deleteTag);
exports.default = router;
