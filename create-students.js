var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = "https://utwhjqgpkktjgqfgxotg.supabase.co";
var supabaseKey = "sb_publishable_KmnL_x8A4eHHHr--shWsYA_I2sGZIhk";
var supabase = createClient(supabaseUrl, supabaseKey);
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var domain, college, studentsList, branchNames, i, email, password, name_1, branchName, _a, authData, authError, userId;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    domain = "galgotiasuniversity.edu.in";
                    return [4 /*yield*/, supabase
                            .from("colleges")
                            .select("id, name")
                            .eq("domain", domain)
                            .single()];
                case 1:
                    college = (_c.sent()).data;
                    if (!college)
                        return [2 /*return*/];
                    // Create 20 students
                    console.log("\nCreating 20 students...");
                    studentsList = [];
                    branchNames = ["Computer Science Engineering", "Electronics & Communication Engineering", "Mechanical Engineering", "Civil Engineering", "Business Analytics"];
                    i = 1;
                    _c.label = 2;
                case 2:
                    if (!(i <= 20)) return [3 /*break*/, 6];
                    email = "student".concat(i, "@").concat(domain);
                    password = "StudentPass@".concat(i);
                    name_1 = "Test Student ".concat(i);
                    branchName = branchNames[i % branchNames.length];
                    return [4 /*yield*/, supabase.auth.signUp({
                            email: email,
                            password: password,
                            options: {
                                data: {
                                    full_name: name_1,
                                    college_id: college.id
                                }
                            }
                        })];
                case 3:
                    _a = _c.sent(), authData = _a.data, authError = _a.error;
                    if (authError) {
                        if (authError.message.includes("rate limit")) {
                            console.error("RATE LIMIT DETECTED!");
                            return [3 /*break*/, 6]; // Stop if rate limited
                        }
                        console.log("Student ".concat(i, " error:"), authError.message);
                        studentsList.push({ email: email, password: password, branch: branchName });
                        return [3 /*break*/, 5];
                    }
                    userId = (_b = authData === null || authData === void 0 ? void 0 : authData.user) === null || _b === void 0 ? void 0 : _b.id;
                    if (!userId) return [3 /*break*/, 5];
                    // Update profile
                    return [4 /*yield*/, supabase.from("profiles").update({
                            full_name: name_1,
                            college_id: college.id,
                            branch: branchName,
                            year_of_study: "2nd Year",
                            skills: ["React", "TypeScript", "Python"],
                            bio: "Hi, I am student ".concat(i, " from ").concat(branchName, "."),
                            gender: i % 2 === 0 ? "female" : "male"
                        }).eq("user_id", userId)];
                case 4:
                    // Update profile
                    _c.sent();
                    studentsList.push({ email: email, password: password, branch: branchName });
                    console.log("Successfully created: ".concat(email));
                    _c.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 2];
                case 6:
                    console.log("\n=== GALGOTIAS STUDENTS GENERATED ===");
                    studentsList.forEach(function (s) {
                        console.log("Email: ".concat(s.email, " | Password: ").concat(s.password, " | Branch: ").concat(s.branch));
                    });
                    return [2 /*return*/];
            }
        });
    });
}
run();
