import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authenticate, requireRole } from "../middleware/auth";
import { config } from "../config";

const router: Router = Router();

const proxy = (target: string, pathPrefix: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    pathRewrite: { [`^${pathPrefix}`]: "" },
    on: {
      error: (err, req, res: any) => {
        res.status(502).json({ message: "service unavailable" });
      },
    },
  });

//! public routes
router.use("/api/auth", proxy(config.services.auth, "/api/auth"));

//! protected routes
router.use(
  "/api/driver",
  authenticate,
  requireRole("DRIVER", "ADMIN"),
  proxy(config.services.driver, "/api/driver"),
);
router.use(
  "/api/rider",
  authenticate,
  requireRole("RIDER", "ADMIN"),
  proxy(config.services.rider, "/api/rider"),
);
router.use(
  "/api/trip",
  authenticate,
  requireRole("RIDER", "DRIVER"),
  proxy(config.services.trip, "/api/trip"),
);
router.use(
  "/api/booking",
  authenticate,
  requireRole("RIDER", "DRIVER"),
  proxy(config.services.booking, "/api/booking"),
);
router.use(
  "/api/payment",
  authenticate,
  requireRole("RIDER", "DRIVER"),
  proxy(config.services.payment, "/api/payment"),
);
//router.use(
// "/api/pricing",
// authenticate,
// requireRole("RIDER", "DRIVER"),
// proxy(config.services.pricing, "/api/pricing"),
//);
//router.use(
//"/api/matching",
//authenticate,
//requireRole("RIDER", "DRIVER"),
//proxy(config.services.matching, "/api/matching"),
//);
router.use(
  "/api/notification",
  authenticate,
  requireRole("RIDER", "DRIVER"),
  proxy(config.services.notification, "/api/notification"),
);

export default router;
