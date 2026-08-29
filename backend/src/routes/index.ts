import { Router } from "express";
import authRoutes from "@/routes/auth.routes";
import eventRoutes from "@/routes/event.routes";
import registrationRoutes from "@/routes/registration.routes";
import adminRoutes from "@/routes/admin.routes";
import moderatorRoutes from "@/routes/moderator.routes";
import galleryRoutes from "@/routes/gallery.routes";
import contactRoutes from "@/routes/contact.routes";
import reviewRoutes from "@/routes/review.routes";
import newsRoutes from "@/routes/news.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/registrations", registrationRoutes);
router.use("/admin", adminRoutes);
router.use("/moderator", moderatorRoutes);
router.use("/gallery", galleryRoutes);
router.use("/contact", contactRoutes);
router.use("/reviews", reviewRoutes);
router.use("/news", newsRoutes);

export default router;
