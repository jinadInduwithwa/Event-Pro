import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import customFetch from "@/utils/customFetch";

interface EventFormData {
  title: string;
  type: string;
  description: string;
  date: string;
  time: {
    start: string;
    end: string;
  };
  venue: string;
  package: string;
  guests: {
    count: number;
    list: GuestInfo[];
  };
  services: {
    decoration?: string;
    photographer?: string;
    musicalGroup?: string;
  };
  budget: number;
  selectedMenuItems: string[];
  selectedVenue: string;
  selectedServices: {
    photographers: string[];
    musicalGroups: string[];
    decorators: string[];
  };
  selectedRentalItems: string[];
}

interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  image: string;
  pricePerPlate: number;
  category: string;
}

interface Venue {
  _id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  capacity: {
    min: number;
    max: number;
  };
  pricePerHour: number;
  images: string[];
  isAvailable: boolean;
}

interface Service {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  experience: number;
  availability: boolean;
  ratings: number;
  image: string;
  price: number;
}

interface Photographer extends Service {
  fullName: string;
  email: string;
  phoneNumber: string;
  experience: number;
  ratings: number;
}

interface MusicalGroup {
  _id: string;
  name: string;
  description: string;
  genre: string;
  price: number;
  contactPhone: string;
  availableForEvents: boolean;
  rating: number;
  image: string;
}

interface Decoration {
  _id: string;
  name: string;
  description: string;
  type: string;
  theme: string;
  pricePerDay: number;
  images: string[];
  rating: number;
  availability: {
    isAvailable: boolean;
  };
}

interface RentalItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  rentalPrice: number;
  rentalStartDate: string;
  availability: boolean;
  isExpired: boolean;
}

const PlanEventForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    type: "",
    description: "",
    date: "",
    time: { start: "09:00", end: "17:00" },
    venue: "",
    package: "",
    guests: { count: 1, list: [] },
    services: {},
    budget: 0,
    selectedMenuItems: [],
    selectedVenue: "",
    selectedServices: {
      photographers: [],
      musicalGroups: [],
      decorators: [],
    },
    selectedRentalItems: [],
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([]);
  const [services, setServices] = useState<{
    photographers: Photographer[];
    musicalGroups: MusicalGroup[];
    decorators: Decoration[];
  }>({
    photographers: [],
    musicalGroups: [],
    decorators: [],
  });

  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true);
      try {
        const [
          menuResponse,
          venuesResponse,
          photographersResponse,
          musicalGroupsResponse,
          decorationsResponse,
          rentalItemsResponse,
        ] = await Promise.all([
          customFetch.get("/menu-items"),
          customFetch.get("/venues"),
          customFetch.get("/photographers"),
          customFetch.get("/musical-group"),
          customFetch.get("/decorations"),
          customFetch.get("/rent"),
        ]);

        console.log("Venues Response:", venuesResponse.data); // Debug log

        console.log("Menu Response:", menuResponse.data); // Debug log
        console.log("Photographers Response:", photographersResponse.data); // Debug log
        console.log("Musical Groups Response:", musicalGroupsResponse.data); // Debug log
        console.log("Decorations Response:", decorationsResponse.data); // Debug log

        setMenuItems(menuResponse.data.menuItems || []);
        setVenues(venuesResponse.data.venues || []);
        setRentalItems(rentalItemsResponse.data.rentalItems || []);
        setServices({
          photographers: photographersResponse.data.photographers || [],
          musicalGroups: musicalGroupsResponse.data.musicalGroups || [],
          decorators: decorationsResponse.data.decorations || [],
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error details:", error);
          toast.error(error.message || "Failed to load event options");
        } else {
          console.error("Unknown error:", error);
          toast.error("Failed to load event options");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, []);

  // Add placeholder image as base64 string
  const placeholderImage =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNNzUgNzVDODIuMTc5NyA3NSA4OCA2OS4xNzk3IDg4IDYyQzg4IDU0LjgyMDMgODIuMTc5NyA0OSA3NSA0OUM2Ny44MjAzIDQ5IDYyIDU0LjgyMDMgNjIgNjJDNjIgNjkuMTc5NyA2Ny44MjAzIDc1IDc1IDc1WiIgZmlsbD0iIzk0QTNCOCIvPjxwYXRoIGQ9Ik0xMTAgMTExQzExMCAxMjYuMjE3IDk0LjMyODggMTI1IDc1IDEyNUM1NS42NzEyIDEyNSA0MCAxMjYuMjE3IDQwIDExMUM0MCA5NS43ODI5IDU1LjY3MTIgODMgNzUgODNDOTQuMzI4OCA4MyAxMTAgOTUuNzgyOSAxMTAgMTExWiIgZmlsbD0iIzk0QTNCOCIvPjwvc3ZnPg==";

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Clear error for this field when user edits it
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof EventFormData] as object),
          [child]: value,
        },
      }));

      // Clear error for nested field
      if (errors[`${parent}.${child}`]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[`${parent}.${child}`];
          return newErrors;
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleMultipleSelect = (name: string, value: string) => {
    setFormData((prev) => {
      if (name === "selectedMenuItems") {
        const newSelectedItems = [...prev.selectedMenuItems];
        if (newSelectedItems.includes(value)) {
          // Remove item if already selected
          return {
            ...prev,
            selectedMenuItems: newSelectedItems.filter((id) => id !== value),
          };
        } else {
          // Add item if not already selected
          newSelectedItems.push(value);
          return {
            ...prev,
            selectedMenuItems: newSelectedItems,
          };
        }
      }

      if (name === "selectedRentalItems") {
        const newSelectedItems = [...prev.selectedRentalItems];
        if (newSelectedItems.includes(value)) {
          // Remove item if already selected
          return {
            ...prev,
            selectedRentalItems: newSelectedItems.filter((id) => id !== value),
          };
        } else {
          // Add item if not already selected
          newSelectedItems.push(value);
          return {
            ...prev,
            selectedRentalItems: newSelectedItems,
          };
        }
      }

      // Handle services selection
      const [, serviceType] = name.split(".") as [
        string,
        keyof EventFormData["selectedServices"]
      ];
      return {
        ...prev,
        selectedServices: {
          ...prev.selectedServices,
          [serviceType]: prev.selectedServices[serviceType].includes(value)
            ? [] // Clear selection if already selected
            : [value], // Only allow one selection
        },
      };
    });
  };

  const calculateServiceCost = (serviceType: keyof typeof services) => {
    const selectedId = formData.selectedServices[serviceType][0];
    if (!selectedId) return 0;

    const service = services[serviceType].find((s) => s._id === selectedId);
    if (!service) return 0;

    // Don't calculate photographer cost as it's free
    if (serviceType === "photographers") return 0;

    if ("price" in service) return Number(service.price) || 0;
    if ("pricePerDay" in service) return Number(service.pricePerDay) || 0;
    return 0;
  };

  const calculateMenuCost = () => {
    return formData.selectedMenuItems.reduce((total, itemId) => {
      const item = menuItems.find((m) => m._id === itemId);
      return total + Number(item?.pricePerPlate || 0) * formData.guests.count;
    }, 0);
  };

  const calculateRentalItemsCost = () => {
    return formData.selectedRentalItems.reduce((total, itemId) => {
      const item = rentalItems.find((r) => r._id === itemId);
      return total + (item?.rentalPrice || 0);
    }, 0);
  };

  const calculateTotalCost = () => {
    // Venue cost
    const selectedVenue = venues.find((v) => v._id === formData.selectedVenue);
    const venueCost = Number(selectedVenue?.pricePerHour || 0);

    // Menu cost (per plate × number of guests)
    const menuCost = calculateMenuCost();

    // Services costs
    const photographerCost = calculateServiceCost("photographers");
    const musicalGroupCost = calculateServiceCost("musicalGroups");
    const decoratorCost = calculateServiceCost("decorators");

    // Rental items cost
    const rentalItemsCost = calculateRentalItemsCost();

    return (
      venueCost +
      menuCost +
      photographerCost +
      musicalGroupCost +
      decoratorCost +
      rentalItemsCost
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // First get current user
      const { data: userData } = await customFetch.get("/users/current-user");

      // Get the selected photographer details
      const selectedPhotographer = services.photographers.find(
        (p) => p._id === formData.selectedServices.photographers[0]
      );

      // Get the selected musical group details
      const selectedMusicalGroup = services.musicalGroups.find(
        (m) => m._id === formData.selectedServices.musicalGroups[0]
      );

      // Get the selected decorator details
      const selectedDecorator = services.decorators.find(
        (d) => d._id === formData.selectedServices.decorators[0]
      );

      // Get the selected rental items
      const selectedRentals = formData.selectedRentalItems.map((id) => {
        const item = rentalItems.find((r) => r._id === id);
        return {
          _id: item?._id,
          name: item?.name,
          rentalPrice: item?.rentalPrice,
          quantity: 1,
        };
      });

      // Get the selected menu items
      const selectedMenuItems = formData.selectedMenuItems.map((id) => {
        const item = menuItems.find((m) => m._id === id);
        return {
          _id: item?._id,
          name: item?.name,
          category: item?.category,
          pricePerPlate: item?.pricePerPlate,
        };
      });

      const eventData = {
        title: formData.title,
        type: formData.type,
        description: formData.description || "No description provided",
        date: formData.date,
        time: {
          start: formData.time.start,
          end: formData.time.end,
        },
        venue: formData.selectedVenue,
        guests: {
          count: formData.guests.count,
          list: formData.guests.list,
        },
        services: {
          decoration: selectedDecorator
            ? {
                _id: selectedDecorator._id,
                name: selectedDecorator.name,
              }
            : null,
          photographer: selectedPhotographer
            ? {
                _id: selectedPhotographer._id,
                fullName: selectedPhotographer.fullName,
              }
            : null,
          musicalGroup: selectedMusicalGroup
            ? {
                _id: selectedMusicalGroup._id,
                name: selectedMusicalGroup.name,
              }
            : null,
        },
        rentalItems: selectedRentals,
        menuItems: selectedMenuItems,
        totalCost: calculateTotalCost(),
        status: "pending",
        client: userData.user._id,
      };

      console.log("Event Data:", eventData);
      await customFetch.post("/events", eventData);

      toast.success("Event planned successfully!");
      navigate(`/user-dashboard/my-events`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to plan event");
        console.error("Event planning error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    const totalSteps = 5;
    return (currentStep / totalSteps) * 100;
  };

  const validateFirstStep = () => {
    const newErrors: Record<string, string> = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Event title must be at least 3 characters";
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = "Please select an event type";
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = "Event date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Event date cannot be in the past";
      }
    }

    // Time validation
    if (!formData.time.start) {
      newErrors["time.start"] = "Start time is required";
    }

    if (!formData.time.end) {
      newErrors["time.end"] = "End time is required";
    }

    if (formData.time.start && formData.time.end) {
      const startTime = new Date(`2000-01-01T${formData.time.start}`);
      const endTime = new Date(`2000-01-01T${formData.time.end}`);

      if (endTime <= startTime) {
        newErrors["time.end"] = "End time must be after start time";
      }
    }

    // Guest count validation
    if (formData.guests.count < 1) {
      newErrors["guests.count"] = "At least 1 guest is required";
    } else if (formData.guests.count > 1000) {
      newErrors["guests.count"] = "Maximum 1000 guests allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceed = () => {
    // Move variable declarations outside switch statement
    const selectedVenue = venues.find((v) => v._id === formData.selectedVenue);
    const selectedPhotographer = services.photographers.find(
      (p) => p._id === formData.selectedServices.photographers[0]
    );
    const selectedMusicalGroup = services.musicalGroups.find(
      (m) => m._id === formData.selectedServices.musicalGroups[0]
    );
    const selectedDecorator = services.decorators.find(
      (d) => d._id === formData.selectedServices.decorators[0]
    );

    switch (currentStep) {
      case 1:
        return (
          formData.title &&
          formData.type &&
          formData.date &&
          formData.time.start &&
          formData.time.end &&
          formData.guests.count >= 1 &&
          Object.keys(errors).length === 0
        );
      case 2:
        return selectedVenue && selectedVenue.isAvailable;
      case 3:
        return formData.selectedMenuItems.length > 0;
      case 4:
        if (selectedPhotographer && !selectedPhotographer.availability)
          return false;
        if (selectedMusicalGroup && !selectedMusicalGroup.availableForEvents)
          return false;
        if (selectedDecorator && !selectedDecorator.availability.isAvailable)
          return false;

        return (
          Object.values(formData.selectedServices).some(
            (arr) => arr.length > 0
          ) || formData.selectedRentalItems.length > 0
        );
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateFirstStep()) {
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Basic Event Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } focus:border-event-red focus:ring-1 focus:ring-event-red`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  errors.type ? "border-red-500" : "border-gray-300"
                } focus:border-event-red focus:ring-1 focus:ring-event-red`}
              >
                <option value="">Select Type</option>
                <option value="Wedding">Wedding</option>
                <option value="Birthday">Birthday</option>
                <option value="Corporate">Corporate</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Graduation">Graduation</option>
                <option value="Other">Other</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests
              </label>
              <input
                type="number"
                name="guests.count"
                min="1"
                max="1000"
                value={formData.guests.count}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  errors["guests.count"] ? "border-red-500" : "border-gray-300"
                } focus:border-event-red focus:ring-1 focus:ring-event-red`}
              />
              {errors["guests.count"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["guests.count"]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-md border ${
                  errors.date ? "border-red-500" : "border-gray-300"
                } focus:border-event-red focus:ring-1 focus:ring-event-red`}
                required
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="time.start"
                  value={formData.time.start}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    errors["time.start"] ? "border-red-500" : "border-gray-300"
                  } focus:border-event-red focus:ring-1 focus:ring-event-red`}
                  required
                />
                {errors["time.start"] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors["time.start"]}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="time.end"
                  value={formData.time.end}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-md border ${
                    errors["time.end"] ? "border-red-500" : "border-gray-300"
                  } focus:border-event-red focus:ring-1 focus:ring-event-red`}
                  required
                />
                {errors["time.end"] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors["time.end"]}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Select Venue</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-event-red"></div>
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center text-gray-500">
                No venues available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map((venue) => (
                  <div
                    key={venue._id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                      formData.selectedVenue === venue._id
                        ? "ring-2 ring-event-red"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() =>
                      handleInputChange({
                        target: { name: "selectedVenue", value: venue._id },
                      } as React.ChangeEvent<HTMLInputElement>)
                    }
                  >
                    <div className="relative h-48">
                      <img
                        src={
                          venue.images && venue.images.length > 0
                            ? `http://localhost:5000/${venue.images[0]}`
                            : "/placeholder-venue.jpg"
                        }
                        alt={venue.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-venue.jpg";
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {venue.name}
                        </h3>
                        <span className="text-event-red font-semibold">
                          Rs. {venue.pricePerHour || 0}
                          <span className="text-xs text-gray-500">/day</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Capacity: {venue.capacity?.min || 0} -{" "}
                        {venue.capacity?.max || 0} guests
                      </p>
                      <p className="text-sm text-gray-600">
                        {venue.location?.address || "No address provided"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Select Menu Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                    formData.selectedMenuItems.includes(item._id)
                      ? "ring-2 ring-event-red"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() =>
                    handleMultipleSelect("selectedMenuItems", item._id)
                  }
                >
                  <img
                    src={
                      item.image
                        ? `http://localhost:5000/${item.image}`
                        : "/placeholder-menu.jpg"
                    }
                    alt={item.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-menu.jpg";
                    }}
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.name}
                      </h3>
                      <span className="text-event-red font-semibold">
                        Rs. {item.pricePerPlate || 0}
                        <span className="text-xs text-gray-500">/plate</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {item.description || "No description available"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Select Services</h2>

            {/* Rental Items Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Rental Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rentalItems
                  .filter((item) => item.availability && !item.isExpired)
                  .map((item) => (
                    <div
                      key={item._id}
                      className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                        formData.selectedRentalItems.includes(item._id)
                          ? "ring-2 ring-event-red"
                          : "hover:shadow-lg"
                      }`}
                      onClick={() =>
                        handleMultipleSelect("selectedRentalItems", item._id)
                      }
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {item.name}
                          </h3>
                          <span className="text-event-red font-semibold">
                            Rs. {item.rentalPrice || 0}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Category: {item.category}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.description || "No description available"}
                        </p>
                        <div className="mt-2">
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Available
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              {rentalItems.filter(
                (item) => item.availability && !item.isExpired
              ).length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No rental items available</p>
                </div>
              )}
            </div>

            {/* Photographers Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Photographers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.photographers.map((photographer) => (
                  <div
                    key={photographer._id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                      formData.selectedServices.photographers.includes(
                        photographer._id
                      )
                        ? "ring-2 ring-event-red"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() =>
                      handleMultipleSelect(
                        "selectedServices.photographers",
                        photographer._id
                      )
                    }
                  >
                    {/* Photographer card content */}
                    <div className="relative h-48">
                      <img
                        src={photographer.image}
                        alt={photographer.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const imgElement = e.target as HTMLImageElement;
                          if (!imgElement.dataset.tried) {
                            imgElement.dataset.tried = "true";
                            imgElement.src = placeholderImage;
                          }
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          ⭐ {photographer.ratings?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {photographer.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {photographer.email || "No email provided"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {photographer.phoneNumber || "No phone number provided"}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Experience: {photographer.experience || 0} years
                      </p>
                      <div className="mt-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            photographer.availability
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {photographer.availability
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-green-600 font-semibold">
                          Free Service
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Musical Groups Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Musical Groups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.musicalGroups.map((group) => (
                  <div
                    key={group._id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                      formData.selectedServices.musicalGroups.includes(
                        group._id
                      )
                        ? "ring-2 ring-event-red"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() =>
                      handleMultipleSelect(
                        "selectedServices.musicalGroups",
                        group._id
                      )
                    }
                  >
                    <div className="relative h-48">
                      <img
                        src={
                          group.image
                            ? `http://localhost:5000/${group.image}`
                            : "/placeholder-band.jpg"
                        }
                        alt={group.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-band.jpg";
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          ⭐ {group.rating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {group.description || "No description available"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Genre: {group.genre || "Not specified"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Contact: {group.contactPhone || "No contact provided"}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            group.availableForEvents
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {group.availableForEvents
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-event-red font-semibold">
                          Rs. {group.price || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorators Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Decorations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.decorators.map((decoration) => (
                  <div
                    key={decoration._id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                      formData.selectedServices.decorators.includes(
                        decoration._id
                      )
                        ? "ring-2 ring-event-red"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() =>
                      handleMultipleSelect(
                        "selectedServices.decorators",
                        decoration._id
                      )
                    }
                  >
                    <div className="relative h-48">
                      <img
                        src={
                          decoration.images && decoration.images.length > 0
                            ? `http://localhost:5000/${decoration.images[0]}`
                            : "/placeholder-decoration.jpg"
                        }
                        alt={decoration.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-decoration.jpg";
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          ⭐ {decoration.rating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {decoration.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {decoration.description || "No description available"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Type: {decoration.type || "Not specified"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Theme: {decoration.theme || "Not specified"}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            decoration.availability?.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {decoration.availability?.isAvailable
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="text-event-red font-semibold">
                          Rs. {decoration.pricePerDay || 0}/day
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Review & Confirm</h2>
            {renderBillSummary()}
          </div>
        );

      default:
        return null;
    }
  };

  const renderBillSummary = () => {
    const selectedVenue = venues.find((v) => v._id === formData.selectedVenue);
    const venueCost = Number(selectedVenue?.pricePerHour || 0);
    const menuCost = calculateMenuCost();
    const musicalGroupCost = calculateServiceCost("musicalGroups");
    const decoratorCost = calculateServiceCost("decorators");
    const rentalItemsCost = calculateRentalItemsCost();

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Bill Summary</h3>

        <div className="space-y-4">
          {/* Venue Cost */}
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Venue ({selectedVenue?.name})</span>
            <span>Rs. {venueCost}/day</span>
          </div>

          {/* Menu Cost */}
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">
              Menu Items (for {formData.guests.count} guests)
            </span>
            <span>Rs. {menuCost}</span>
          </div>

          {/* Individual Menu Items */}
          {formData.selectedMenuItems.length > 0 && (
            <div className="pl-4 space-y-2">
              {formData.selectedMenuItems.map((itemId) => {
                const item = menuItems.find((m) => m._id === itemId);
                const itemTotal =
                  (item?.pricePerPlate || 0) * formData.guests.count;
                return (
                  <div
                    key={itemId}
                    className="flex justify-between items-center text-sm text-gray-600"
                  >
                    <span>
                      {item?.name} (Rs. {item?.pricePerPlate} ×{" "}
                      {formData.guests.count} guests)
                    </span>
                    <span>Rs. {itemTotal}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Services */}
          {formData.selectedServices.photographers.length > 0 && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Photographer</span>
              <span className="text-green-600">Free Service</span>
            </div>
          )}

          {musicalGroupCost > 0 && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Musical Group</span>
              <span>Rs. {musicalGroupCost}</span>
            </div>
          )}

          {decoratorCost > 0 && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Decoration</span>
              <span>Rs. {decoratorCost}</span>
            </div>
          )}

          {/* Rental Items */}
          {formData.selectedRentalItems.length > 0 && (
            <>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">
                  Rental Items ({formData.selectedRentalItems.length})
                </span>
                <span>Rs. {rentalItemsCost}</span>
              </div>

              {/* Individual Rental Items */}
              <div className="pl-4 space-y-2">
                {formData.selectedRentalItems.map((itemId) => {
                  const item = rentalItems.find((r) => r._id === itemId);
                  return (
                    <div
                      key={itemId}
                      className="flex justify-between items-center text-sm text-gray-600"
                    >
                      <span>{item?.name}</span>
                      <span>Rs. {item?.rentalPrice}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-4 font-bold text-lg">
            <span>Total Cost</span>
            <span className="text-event-red">
              Rs.{" "}
              {venueCost +
                menuCost +
                musicalGroupCost +
                decoratorCost +
                rentalItemsCost}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <h2 className="text-4xl font-bold text-gray-800 text-center ">
        Plan Your Event
      </h2>
      <div className="w-[95vw] p-4 bg-white rounded-lg  font-Mainfront mt-2 mb-10">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-event-red bg-red-200">
                  Step {currentStep} of 5
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-event-red">
                  {calculateProgress()}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
              <div
                style={{ width: `${calculateProgress()}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-event-red transition-all duration-500"
              ></div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-semibold hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          {currentStep < 5 ? (
            <button
              onClick={handleNextStep}
              disabled={!canProceed()}
              className={`bg-event-red text-white px-6 py-2 rounded-md font-semibold ${
                !canProceed()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-red-700"
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-event-red hover:bg-red-700 text-white px-6 py-2 rounded-md font-semibold"
            >
              {isLoading ? "Planning..." : "Plan Event"}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default PlanEventForm;
