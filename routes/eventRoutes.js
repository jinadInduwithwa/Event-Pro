import express from "express";
import {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  getUserEvents,
  updateEventStatus,
  addMenuItemToEvent,
  removeMenuItemFromEvent,
} from "../Controllers/eventController.js";
import { validateEvent } from "../middleware/ValidatorMiddleware.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.use(authenticateUser);

// Admin & Organizer routes
router
  .route("/")
  .post(authenticateUser, createEvent)
  .get(authorizePermissions("admin", "organizer"), getAllEvents);

// User specific routes
router.get("/my-events", getUserEvents);

// Event specific routes
router
  .route("/:id")
  .get(getSingleEvent)
  .patch(
    [authorizePermissions("admin", "organizer"), validateEvent],
    updateEvent
  )
  .delete(authorizePermissions("admin"), deleteEvent);

router.patch(
  "/:id/status",
  authorizePermissions("admin", "organizer"),
  updateEventStatus
);

// Menu item routes
router.post("/:eventId/menu-items", addMenuItemToEvent);
router.delete("/:eventId/menu-items/:menuItemId", removeMenuItemFromEvent);

export default router;
