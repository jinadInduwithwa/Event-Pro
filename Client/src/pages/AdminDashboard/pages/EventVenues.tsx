import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import { BounceLoader } from "react-spinners";
import Modal from "@/components/UI/Modal";
import axios from "axios";
import { generatePDF } from "@/utils/pdfGenerator";

interface Venue {
  _id: string;
  name: string;
  capacity: {
    min: number;
    max: number;
  };
  facilities: string;
  images: string[];
  rules: string;
  pricePerHour: number;
}

const EventVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [capacityRange, setCapacityRange] = useState({ min: "", max: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    capacity: {
      min: "",
      max: "",
    },
    facilities: "",
    rules: "",
    images: [] as File[],
    pricePerHour: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    capacity: {
      min: "",
      max: "",
    },
    facilities: "",
    rules: "",
    images: "",
    pricePerHour: "",
  });

  const fetchVenues = async () => {
    setIsLoading(true);
    try {
      const { data } = await customFetch.get("/venues");
      // Clean the data by removing unwanted characters from facilities and rules if needed
      const cleanedVenues = data.venues.map((venue: Venue) => ({
        ...venue,
        facilities: venue.facilities || "",
        rules: venue.rules || "",
      }));
      setVenues(cleanedVenues);
    } catch (error) {
      console.error("Error fetching venues:", error);
      toast.error("Failed to fetch venues");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch venues on initial load only
  useEffect(() => {
    fetchVenues();
  }, []);

  const validateForm = () => {
    const errors = {
      name: "",
      capacity: {
        min: "",
        max: "",
      },
      facilities: "",
      rules: "",
      images: "",
      pricePerHour: "",
    };
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Venue name is required";
      isValid = false;
    }

    // Capacity validation
    const minCapacity = Number(formData.capacity.min);
    const maxCapacity = Number(formData.capacity.max);

    if (!formData.capacity.min) {
      errors.capacity.min = "Minimum capacity is required";
      isValid = false;
    } else if (isNaN(minCapacity)) {
      errors.capacity.min = "Minimum capacity must be a valid number";
      isValid = false;
    } else if (minCapacity < 1) {
      errors.capacity.min = "Minimum capacity must be at least 1";
      isValid = false;
    }

    if (!formData.capacity.max) {
      errors.capacity.max = "Maximum capacity is required";
      isValid = false;
    } else if (isNaN(maxCapacity)) {
      errors.capacity.max = "Maximum capacity must be a valid number";
      isValid = false;
    } else if (maxCapacity < minCapacity) {
      errors.capacity.max =
        "Maximum capacity must be greater than minimum capacity";
      isValid = false;
    }

    // Facilities validation
    if (!formData.facilities.trim()) {
      errors.facilities = "At least one facility is required";
      isValid = false;
    }

    // Rules validation
    if (!formData.rules.trim()) {
      errors.rules = "At least one rule is required";
      isValid = false;
    }

    // Price validation
    if (!formData.pricePerHour) {
      errors.pricePerHour = "Price per day is required";
      isValid = false;
    } else if (
      isNaN(Number(formData.pricePerHour)) ||
      Number(formData.pricePerHour) <= 0
    ) {
      errors.pricePerHour = "Price must be a positive number";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAddVenue = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append(
        "capacity[min]",
        Number(formData.capacity.min).toString()
      );
      formDataToSend.append(
        "capacity[max]",
        Number(formData.capacity.max).toString()
      );
      formDataToSend.append("pricePerHour", formData.pricePerHour.toString());

      // Add facilities
      formDataToSend.append("facilities", formData.facilities.trim());

      // Add rules
      formDataToSend.append("rules", formData.rules.trim());

      // Add images
      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      await customFetch.post("/venues", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Venue added successfully");
      setIsAddModalOpen(false);
      resetFormData();
      fetchVenues(); // Refresh list
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.msg || "Failed to add venue";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleEditVenue = async () => {
    if (!selectedVenue) return;

    try {
      // Basic frontend validation
      if (!formData.name.trim()) {
        toast.error("Name is required");
        return;
      }
      const minCapacity = Number(formData.capacity.min);
      const maxCapacity = Number(formData.capacity.max);
      if (isNaN(minCapacity) || isNaN(maxCapacity)) {
        toast.error("Capacity values must be valid numbers");
        return;
      }
      if (minCapacity < 1) {
        toast.error("Minimum capacity must be at least 1");
        return;
      }
      if (maxCapacity < minCapacity) {
        toast.error("Maximum capacity must be greater than minimum capacity");
        return;
      }

      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("capacity[min]", minCapacity.toString());
      formDataToSend.append("capacity[max]", maxCapacity.toString());
      formDataToSend.append("pricePerHour", formData.pricePerHour.toString());

      // Add facilities
      formDataToSend.append("facilities", formData.facilities.trim());

      // Add rules
      formDataToSend.append("rules", formData.rules.trim());

      // Add new images if any were selected
      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      await customFetch.patch(`/venues/${selectedVenue._id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Venue updated successfully");
      setIsEditModalOpen(false);
      setSelectedVenue(null);
      resetFormData();
      fetchVenues(); // Refresh list
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to update venue";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleDeleteVenue = async () => {
    if (!selectedVenue) return;

    try {
      await customFetch.delete(`/venues/${selectedVenue._id}`);
      toast.success("Venue deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedVenue(null);
      fetchVenues(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.msg || "Failed to delete venue"
          : "Failed to delete venue"
      );
    }
  };

  // Reset form to initial (simplified) state
  const resetFormData = () => {
    setFormData({
      name: "",
      capacity: {
        min: "",
        max: "",
      },
      facilities: "",
      rules: "",
      images: [],
      pricePerHour: "",
    });
    setFormErrors({
      name: "",
      capacity: {
        min: "",
        max: "",
      },
      facilities: "",
      rules: "",
      images: "",
      pricePerHour: "",
    });
  };

  // Filter venues by search query and capacity
  const filteredVenues = venues.filter((venue) => {
    // Capacity filter
    if (capacityRange.min && venue.capacity.max < Number(capacityRange.min))
      return false;
    if (capacityRange.max && venue.capacity.min > Number(capacityRange.max))
      return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = venue.name.toLowerCase().includes(query);
      const facilitiesMatch = venue.facilities.toLowerCase().includes(query);
      const rulesMatch = venue.rules.toLowerCase().includes(query);

      return nameMatch || facilitiesMatch || rulesMatch;
    }

    return true;
  });

  // Handle PDF export
  const handleExportPDF = () => {
    const pdfColumns = [
      { header: "Name", dataKey: "name" as const },
      { header: "Min Capacity", dataKey: "minCapacity" as const },
      { header: "Max Capacity", dataKey: "maxCapacity" as const },
      { header: "Facilities", dataKey: "facilitiesText" as const },
      { header: "Rules", dataKey: "rulesText" as const },
    ];

    const formattedData = filteredVenues.map((venue) => ({
      name: venue.name,
      minCapacity: venue.capacity.min,
      maxCapacity: venue.capacity.max,
      facilitiesText: venue.facilities
        .split("\n")
        .filter((line) => line.trim())
        .join(", "),
      rulesText: venue.rules
        .split("\n")
        .filter((line) => line.trim())
        .join(", "),
    }));

    // Build title with search and capacity filter info
    let title = "Event Venues Report";

    if (searchQuery) {
      title += ` (Search: "${searchQuery}")`;
    }

    if (capacityRange.min || capacityRange.max) {
      title += ` (Capacity: ${capacityRange.min || "min"}-${
        capacityRange.max || "max"
      })`;
    }

    generatePDF({
      title: title,
      data: formattedData,
      filename: `event-venues${searchQuery ? "-search" : ""}${
        capacityRange.min || capacityRange.max ? "-filtered" : ""
      }-${new Date().toISOString().split("T")[0]}.pdf`,
      columns: pdfColumns,
    });
  };

  return (
    <div className="p-6">
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Event Venues</h1>
        <div className="flex gap-4">
          <button
            onClick={handleExportPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Export PDF
          </button>
          <button
            onClick={() => {
              resetFormData();
              setIsAddModalOpen(true);
            }}
            className="bg-event-red hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Add New Venue
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="w-full max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venues by name, facilities, or rules..."
              className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Capacity Range Filter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Capacity Range:</span>
            <input
              type="number"
              placeholder="Min"
              value={capacityRange.min}
              onChange={(e) =>
                setCapacityRange((prev) => ({ ...prev, min: e.target.value }))
              }
              className="w-24 px-2 py-1 border rounded-md"
              min="1"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={capacityRange.max}
              onChange={(e) =>
                setCapacityRange((prev) => ({ ...prev, max: e.target.value }))
              }
              className="w-24 px-2 py-1 border rounded-md"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-20 backdrop-blur-md">
          <BounceLoader size={50} color="#EE1133" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.length > 0 ? (
            filteredVenues.map((venue) => (
              <div
                key={venue._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative h-48">
                  {/* Display first image or a placeholder */}
                  <img
                    src={
                      venue.images && venue.images.length > 0
                        ? `http://localhost:5000/${venue.images[0]}`
                        : "/placeholder-image.jpg"
                    } // Added placeholder check
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {venue.name}
                    </h3>
                    <span className="text-event-red font-semibold">
                      Rs. {venue.pricePerHour}/day
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 mb-2">
                    <span>
                      Capacity: {venue.capacity.min} - {venue.capacity.max}{" "}
                      guests
                    </span>
                  </div>

                  {/* Display Facilities */}
                  {venue.facilities && (
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Facilities:
                      </h4>
                      <div className="flex flex-col gap-1 mt-1">
                        {venue.facilities
                          .split("\n")
                          .filter((line) => line.trim().length > 0)
                          .map((facility, index) => (
                            <span
                              key={`${venue._id}-facility-${index}`}
                              className="text-sm text-gray-600"
                            >
                              • {facility.trim()}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Display Rules */}
                  {venue.rules && (
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Rules:
                      </h4>
                      <div className="flex flex-col gap-1 mt-1">
                        {venue.rules
                          .split("\n")
                          .filter((line) => line.trim().length > 0)
                          .map((rule, index) => (
                            <span
                              key={`${venue._id}-rule-${index}`}
                              className="text-sm text-gray-600"
                            >
                              • {rule.trim()}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setSelectedVenue(venue);
                        // Pre-fill form with existing data for editing
                        setFormData({
                          name: venue.name,
                          capacity: {
                            min: venue.capacity.min.toString(),
                            max: venue.capacity.max.toString(),
                          },
                          facilities: venue.facilities,
                          rules: venue.rules,
                          images: [], // Clear images, user must re-upload if changing
                          pricePerHour: venue.pricePerHour.toString(),
                        });
                        setIsEditModalOpen(true);
                      }}
                      className="text-event-red hover:text-red-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVenue(venue);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No venues found matching the criteria.
            </p>
          )}
        </div>
      )}

      {/* Add Modal (Simplified) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetFormData();
        }}
        title="Add New Venue"
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setFormErrors({ ...formErrors, name: "" });
              }}
              className={`w-full px-4 py-2 rounded-md border ${
                formErrors.name ? "border-red-500" : "border-gray-300"
              } focus:border-event-red focus:ring-1 focus:ring-event-red`}
              required
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>

          {/* Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Capacity
              </label>
              <input
                type="number"
                value={formData.capacity.min}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    capacity: { ...formData.capacity, min: e.target.value },
                  });
                  setFormErrors({
                    ...formErrors,
                    capacity: { ...formErrors.capacity, min: "" },
                  });
                }}
                className={`w-full px-4 py-2 rounded-md border ${
                  formErrors.capacity.min ? "border-red-500" : "border-gray-300"
                } focus:border-event-red focus:ring-1 focus:ring-event-red`}
                min="1"
                required
              />
              {formErrors.capacity.min && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.capacity.min}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Capacity
              </label>
              <input
                type="number"
                value={formData.capacity.max}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    capacity: { ...formData.capacity, max: e.target.value },
                  });
                  setFormErrors({
                    ...formErrors,
                    capacity: { ...formErrors.capacity, max: "" },
                  });
                }}
                className={`w-full px-4 py-2 rounded-md border ${
                  formErrors.capacity.max ? "border-red-500" : "border-gray-300"
                } focus:border-event-red focus:ring-1 focus:ring-event-red`}
                min="1"
                required
              />
              {formErrors.capacity.max && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.capacity.max}
                </p>
              )}
            </div>
          </div>

          {/* Price per Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Day (Rs.)
            </label>
            <input
              type="number"
              value={formData.pricePerHour}
              onChange={(e) => {
                setFormData({ ...formData, pricePerHour: e.target.value });
                setFormErrors({ ...formErrors, pricePerHour: "" });
              }}
              className={`w-full px-4 py-2 rounded-md border ${
                formErrors.pricePerHour ? "border-red-500" : "border-gray-300"
              } focus:border-event-red focus:ring-1 focus:ring-event-red`}
              min="0"
              step="0.01"
              required
            />
            {formErrors.pricePerHour && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.pricePerHour}
              </p>
            )}
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facilities (one per line)
            </label>
            <textarea
              value={formData.facilities}
              onChange={(e) => {
                setFormData({ ...formData, facilities: e.target.value });
                setFormErrors({ ...formErrors, facilities: "" });
              }}
              className={`w-full px-4 py-2 rounded-md border ${
                formErrors.facilities ? "border-red-500" : "border-gray-300"
              } focus:border-event-red focus:ring-1 focus:ring-event-red min-h-[100px]`}
              placeholder="Enter each facility on a new line"
            />
            {formErrors.facilities && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.facilities}
              </p>
            )}
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rules (one per line)
            </label>
            <textarea
              value={formData.rules}
              onChange={(e) => {
                setFormData({ ...formData, rules: e.target.value });
                setFormErrors({ ...formErrors, rules: "" });
              }}
              className={`w-full px-4 py-2 rounded-md border ${
                formErrors.rules ? "border-red-500" : "border-gray-300"
              } focus:border-event-red focus:ring-1 focus:ring-event-red min-h-[100px]`}
              placeholder="Enter each rule on a new line"
            />
            {formErrors.rules && (
              <p className="mt-1 text-sm text-red-500">{formErrors.rules}</p>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setFormData({ ...formData, images: files });
                setFormErrors({ ...formErrors, images: "" });
              }}
              className="w-full"
            />
            {formErrors.images && (
              <p className="mt-1 text-sm text-red-500">{formErrors.images}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                resetFormData();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddVenue}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Add Venue
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal (Simplified) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVenue(null);
          resetFormData();
        }}
        title="Edit Venue"
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 bg-gray-100 cursor-not-allowed"
              disabled
              required
            />
          </div>

          {/* Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Capacity
              </label>
              <input
                type="number"
                value={formData.capacity.min}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: { ...formData.capacity, min: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Capacity
              </label>
              <input
                type="number"
                value={formData.capacity.max}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: { ...formData.capacity, max: e.target.value },
                  })
                }
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
                min="1"
                required
              />
            </div>
          </div>

          {/* Price per Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price per Day (Rs.)
            </label>
            <input
              type="number"
              value={formData.pricePerHour}
              onChange={(e) =>
                setFormData({ ...formData, pricePerHour: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facilities (one per line)
            </label>
            <textarea
              value={formData.facilities}
              onChange={(e) =>
                setFormData({ ...formData, facilities: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red min-h-[100px]"
              placeholder="Enter each facility on a new line"
            />
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rules (one per line)
            </label>
            <textarea
              value={formData.rules}
              onChange={(e) =>
                setFormData({ ...formData, rules: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red min-h-[100px]"
              placeholder="Enter each rule on a new line"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (Optional: Add new images to replace existing)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setFormData({ ...formData, images: files });
              }}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to keep existing images.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedVenue(null);
                resetFormData();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditVenue}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Update Venue
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedVenue(null);
        }}
        title="Delete Venue"
      >
        <p>
          Are you sure you want to delete the venue "{selectedVenue?.name}"?
        </p>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteVenue}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EventVenues;
