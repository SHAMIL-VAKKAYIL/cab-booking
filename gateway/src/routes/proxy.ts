import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authenticate, requireRole } from "../middleware/auth";
import { config } from "../config";

const router: Router = Router();

const proxy = (target: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      error: (err, req, res: any) => {
        res.status(502).json({ message: "service unavailable" });
      },
    },
  });

//! public routes
router.use("/api/auth", proxy(config.services.auth));

//! protected routes
router.use(
  "/api/driver",
  authenticate,
  requireRole("DRIVER", "ADMIN"),
  proxy(config.services.driver),
);
router.use(
  "/api/rider",
  authenticate,
  requireRole("RIDER", "ADMIN"),
  proxy(config.services.rider),
);
router.use(
  "/api/trip",
  authenticate,
  requireRole("RIDER", "DRIVER"),
  proxy(config.services.trip),
);
router.use(
  "/api/booking",
  authenticate,
  requireRole("RIDER", "DRIVER"),
  proxy(config.services.booking),
);
router.use(
  "/api/payment",
  authenticate,
  requireRole("RIDER", "DRIVER"),
  proxy(config.services.payment),
);
//router.use(
// "/api/pricing",
// authenticate,
// requireRole("RIDER", "DRIVER"),
// proxy(config.services.pricing),
//);
//router.use(
//"/api/matching",
//authenticate,
//requireRole("RIDER", "DRIVER"),
//proxy(config.services.matching),
//);
router.use(
  "/api/notification",
  authenticate,
  requireRole("RIDER", "DRIVER"),
  proxy(config.services.notification),
);

export default router;
