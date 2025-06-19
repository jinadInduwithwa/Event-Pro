import mongoose from "mongoose";

const EventVenueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide venue name"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    location: {
      address: {
        type: String,

        trim: true,
      },
      city: {
        type: String,

        trim: true,
      },
      state: {
        type: String,

        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
      },
    },
    capacity: {
      min: {
        type: Number,
        required: [true, "Please provide minimum capacity"],
        min: 1,
      },
      max: {
        type: Number,
        required: [true, "Please provide maximum capacity"],
        min: 1,
      },
    },
    pricePerHour: {
      type: Number,

      min: 0,
    },
    amenities: {
      type: [String],
      default: [],
    },
    facilities: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
    images: {
      type: [String],
      default: ["uploads/default-venue.png"],
    },
    availableFor: {
      type: [String],
      enum: [
        "Wedding",
        "Birthday",
        "Corporate",
        "Anniversary",
        "Graduation",
        "Other",
      ],
    },
    rules: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: [
      {
        user: {
          type: mongoose.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: true,
          trim: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Validate that maximum capacity is greater than minimum capacity
EventVenueSchema.pre("save", function (next) {
  const minCapacity = Number(this.capacity.min);
  const maxCapacity = Number(this.capacity.max);

  if (maxCapacity < minCapacity) {
    return next(
      new Error(
        "Maximum capacity must be greater than or equal to minimum capacity"
      )
    );
  }
  next();
});

// Calculate average rating when reviews are modified
EventVenueSchema.pre("save", function (next) {
  if (this.reviews.length > 0) {
    this.rating =
      this.reviews.reduce((sum, review) => sum + review.rating, 0) /
      this.reviews.length;
  }
  next();
});

export default mongoose.model("EventVenue", EventVenueSchema);
