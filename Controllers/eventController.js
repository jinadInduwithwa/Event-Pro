import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import Event from "../models/eventModel.js";
import { NotFoundError, BadRequestError } from "../errors/customErrors.js";
import {
  Decoration,
  Photographer,
  MusicalGroup,
  MenuItem,
} from "../models/index.js";
import RentalItem from "../models/rentalItemModel.js";

// Create Event
export const createEvent = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const event = await Event.create(req.body);
  res.status(StatusCodes.CREATED).json({ event });
};

// Get All Events (Admin)
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate("venue", "name location")
      .populate("package", "name pricePerPerson")
      .populate("client", "name email")
      .populate({
        path: "services.decoration",
        model: Decoration,
        select: "name",
      })
      .populate({
        path: "services.photographer",
        model: Photographer,
        select: "fullName",
      })
      .populate({
        path: "services.musicalGroup",
        model: MusicalGroup,
        select: "name",
      })
      .populate({
        path: "rentalItems._id",
        model: RentalItem,
        select: "name category rentalPrice",
      })
      .sort("-createdAt");

    console.log("Found events:", events);

    if (!events) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "No events found" });
    }

    res.status(StatusCodes.OK).json({ events, count: events.length });
  } catch (error) {
    console.error("Error in getAllEvents:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Error fetching events",
      error: error.message,
    });
  }
};

// Get Single Event
export const getSingleEvent = async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate("venue", "name location")
    .populate("package", "name pricePerPerson")
    .populate("client", "fullName email")
    .populate("services.decoration", "name")
    .populate("services.photographer", "fullName")
    .populate("services.musicalGroup", "name")
    .populate("rentalItems._id", "name category rentalPrice availability")
    .populate("staff", "fullName role")
    .populate({
      path: "reviews",
      populate: { path: "user", select: "fullName" },
    });

  if (!event) {
    throw new NotFoundError(`No event with id ${req.params.id}`);
  }
  res.status(StatusCodes.OK).json({ event });
};

// Update Event
export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const event = await Event.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!event) {
    throw new NotFoundError(`No event with id ${id}`);
  }
  res.status(StatusCodes.OK).json({ event });
};

// Delete Event
export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const event = await Event.findByIdAndDelete(id);

  if (!event) {
    throw new NotFoundError(`No event with id ${id}`);
  }
  res.status(StatusCodes.OK).json({ msg: "Event deleted successfully" });
};

// Get User Events
export const getUserEvents = async (req, res) => {
  try {
    console.log("User ID:", req.user.userId);

    const events = await Event.find({ client: req.user.userId })
      .populate("venue", "name location")
      .populate("package", "name pricePerPerson")
      .populate({
        path: "services.decoration",
        model: Decoration,
        select: "name",
        options: { strictPopulate: false },
      })
      .populate({
        path: "services.photographer",
        model: Photographer,
        select: "fullName",
        options: { strictPopulate: false },
      })
      .populate({
        path: "services.musicalGroup",
        model: MusicalGroup,
        select: "name",
        options: { strictPopulate: false },
      })
      .populate({
        path: "rentalItems._id",
        model: RentalItem,
        select: "name category rentalPrice",
        options: { strictPopulate: false },
      })
      .populate({
        path: "menuItems._id",
        select: "name category pricePerPlate",
        options: { strictPopulate: false },
      })
      .sort("-createdAt");

    // Log the full event data for debugging
    console.log(
      "Found events with full service details:",
      JSON.stringify(
        events.map((event) => ({
          _id: event._id,
          services: event.services,
          rentalItems: event.rentalItems,
          menuItems: event.menuItems,
        })),
        null,
        2
      )
    );

    if (!events) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "No events found" });
    }

    res.status(StatusCodes.OK).json({ events, count: events.length });
  } catch (error) {
    console.error("Error in getUserEvents:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Error fetching events",
      error: error.message,
    });
  }
};

// Update Event Status
export const updateEventStatus = async (req, res) => {
  const { id: eventId } = req.params;
  const { status } = req.body;

  try {
    const event = await Event.findByIdAndUpdate(
      eventId,
      { status },
      { new: true, runValidators: true }
    );

    if (!event) {
      throw new NotFoundError(`No event with id ${eventId}`);
    }

    res.status(StatusCodes.OK).json({ event });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

// Add Rental Item to Event
export const addRentalItemToEvent = async (req, res) => {
  const { eventId } = req.params;
  const { rentalItemId, quantity = 1 } = req.body;

  try {
    // Find rental item to get its details
    const rentalItem = await RentalItem.findById(rentalItemId);
    if (!rentalItem) {
      throw new NotFoundError(`No rental item with id ${rentalItemId}`);
    }

    // Check if rental item is available
    if (!rentalItem.availability || rentalItem.isExpired) {
      throw new BadRequestError(
        `Rental item ${rentalItem.name} is not available`
      );
    }

    // Find the event and add the rental item
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError(`No event with id ${eventId}`);
    }

    // Check if rental item already exists in event
    const existingItem = event.rentalItems.find(
      (item) => item._id.toString() === rentalItemId
    );

    if (existingItem) {
      // Update quantity if item already exists
      existingItem.quantity += quantity;
    } else {
      // Add new rental item
      event.rentalItems.push({
        _id: rentalItemId,
        name: rentalItem.name,
        rentalPrice: rentalItem.rentalPrice,
        quantity,
      });
    }

    // Recalculate total cost
    const rentalItemsCost = event.rentalItems.reduce(
      (total, item) => total + item.rentalPrice * item.quantity,
      0
    );
    event.totalCost += rentalItemsCost;

    await event.save();

    res.status(StatusCodes.OK).json({
      message: `Added ${rentalItem.name} to event`,
      event,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

// Remove Rental Item from Event
export const removeRentalItemFromEvent = async (req, res) => {
  const { eventId, rentalItemId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError(`No event with id ${eventId}`);
    }

    // Find the rental item in the event
    const rentalItemIndex = event.rentalItems.findIndex(
      (item) => item._id.toString() === rentalItemId
    );

    if (rentalItemIndex === -1) {
      throw new NotFoundError(
        `No rental item with id ${rentalItemId} in this event`
      );
    }

    // Calculate cost to subtract
    const itemToRemove = event.rentalItems[rentalItemIndex];
    const costToSubtract = itemToRemove.rentalPrice * itemToRemove.quantity;

    // Remove the rental item
    event.rentalItems.splice(rentalItemIndex, 1);

    // Update total cost
    event.totalCost -= costToSubtract;

    await event.save();

    res.status(StatusCodes.OK).json({
      message: "Rental item removed from event",
      event,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

// Add Menu Item to Event
export const addMenuItemToEvent = async (req, res) => {
  const { eventId } = req.params;
  const { menuItemId } = req.body;

  try {
    // Find menu item to get its details
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      throw new NotFoundError(`No menu item with id ${menuItemId}`);
    }

    // Check if menu item is available
    if (!menuItem.isAvailable) {
      throw new BadRequestError(`Menu item ${menuItem.name} is not available`);
    }

    // Find the event and add the menu item
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError(`No event with id ${eventId}`);
    }

    // Check if menu item already exists in event
    const existingItem = event.menuItems.find(
      (item) => item._id.toString() === menuItemId
    );

    if (!existingItem) {
      // Add new menu item
      event.menuItems.push({
        _id: menuItemId,
        name: menuItem.name,
        category: menuItem.category,
        pricePerPlate: menuItem.pricePerPlate,
      });

      // Recalculate total cost - add menu item cost × guest count
      const menuItemCost = menuItem.pricePerPlate * event.guests.count;
      event.totalCost += menuItemCost;

      await event.save();
    }

    res.status(StatusCodes.OK).json({
      message: `Added ${menuItem.name} to event`,
      event,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

// Remove Menu Item from Event
export const removeMenuItemFromEvent = async (req, res) => {
  const { eventId, menuItemId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError(`No event with id ${eventId}`);
    }

    // Find the menu item in the event
    const menuItemIndex = event.menuItems.findIndex(
      (item) => item._id.toString() === menuItemId
    );

    if (menuItemIndex === -1) {
      throw new NotFoundError(
        `No menu item with id ${menuItemId} in this event`
      );
    }

    // Calculate cost to subtract (price per plate × guest count)
    const itemToRemove = event.menuItems[menuItemIndex];
    const costToSubtract = itemToRemove.pricePerPlate * event.guests.count;

    // Remove the menu item
    event.menuItems.splice(menuItemIndex, 1);

    // Update total cost
    event.totalCost -= costToSubtract;

    await event.save();

    res.status(StatusCodes.OK).json({
      message: "Menu item removed from event",
      event,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};
