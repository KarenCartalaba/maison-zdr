import { Router } from "express";
import authRoutes from "@/routes/auth.routes";
import eventRoutes from "@/routes/event.routes";
import registrationRoutes from "@/routes/registration.routes";
import adminRoutes from "@/routes/admin.routes";
import galleryRoutes from "@/routes/gallery.routes";
import contactRoutes from "@/routes/contact.routes";
import reviewRoutes from "@/routes/review.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/registrations", registrationRoutes);
router.use("/admin", adminRoutes);
router.use("/gallery", galleryRoutes);
router.use("/contact", contactRoutes);
router.use("/reviews", reviewRoutes);

export default router;
