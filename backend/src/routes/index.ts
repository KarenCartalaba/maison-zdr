import { Router } from "express";
import authRoutes from "@/routes/auth.routes";
import eventRoutes from "@/routes/event.routes";
import registrationRoutes from "@/routes/registration.routes";
import adminRoutes from "@/routes/admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/registrations", registrationRoutes);
router.use("/admin", adminRoutes);

export default router;
