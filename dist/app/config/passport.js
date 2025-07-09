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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const config_1 = __importDefault(require("../config"));
const auth_model_1 = __importDefault(require("../modules/auth/auth.model"));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield auth_model_1.default.findById(id);
        done(null, user);
    }
    catch (err) {
        done(err);
    }
}));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: config_1.default.google_client_id,
    clientSecret: config_1.default.google_client_secret,
    callbackURL: `${config_1.default.google_callback_url}/api/v1/auth/google/callback`,
    passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
        const photo = (_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value;
        const username = profile.displayName || (email === null || email === void 0 ? void 0 : email.split("@")[0]) || "user";
        let user = yield auth_model_1.default.findOne({
            $or: [{ googleId: profile.id }, { email: email }],
        });
        if (!user) {
            user = yield auth_model_1.default.create({
                googleId: profile.id,
                username,
                email,
                photo,
                authType: "google",
                isDeleted: false,
                storageLimit: 15 * 1024 * 1024 * 1024,
                password: undefined,
            });
        }
        else if (!user.googleId) {
            user.googleId = profile.id;
            user.authType = "both";
            yield user.save();
        }
        done(null, user);
    }
    catch (err) {
        done(err);
    }
})));
exports.default = passport_1.default;
