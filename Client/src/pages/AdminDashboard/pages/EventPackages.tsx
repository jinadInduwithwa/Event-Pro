import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import { BounceLoader } from "react-spinners";
import Modal from "@/components/UI/Modal";
import axios from "axios";
import { generatePDF } from "@/utils/pdfGenerator";

interface EventPackage {
  _id: string;
  name: string;
  description: string;
  type: string;
  pricePerPerson: number;
  minimumGuests: number;
  maximumGuests: number;
  services: string[];
  features: string[];
  image: string;
  isAvailable: boolean;
}

const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Corporate",
  "Anniversary",
  "Graduation",
  "Other",
] as const;

const EventPackages = () => {
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "Wedding",
    pricePerPerson: "",
    minimumGuests: "",
    maximumGuests: "",
    services: [] as string[],
    features: [] as string[],
    isAvailable: true,
    image: null as File | null,
  });

  const [formErrors, setFormErrors] = useState({
    description: "",
    pricePerPerson: "",
    minimumGuests: "",
    maximumGuests: "",
    services: "",
    features: "",
    image: "",
  });

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const url =
        selectedType === "all"
          ? "/event-packages"
          : `/event-packages/type/${selectedType}`;

      const { data } = await customFetch.get(url);
      setPackages(data.eventPackages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to fetch packages");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter packages by search query
  const filterPackagesBySearch = (pkg: EventPackage) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        pkg.name.toLowerCase().includes(query) ||
        pkg.description.toLowerCase().includes(query) ||
        pkg.services.some((service) => service.toLowerCase().includes(query)) ||
        pkg.features.some((feature) => feature.toLowerCase().includes(query))
      );
    }
    return true;
  };

  useEffect(() => {
    fetchPackages();
  }, [selectedType]);

  const validateForm = () => {
    const errors = {
      description: "",
      pricePerPerson: "",
      minimumGuests: "",
      maximumGuests: "",
      services: "",
      features: "",
      image: "",
    };
    let isValid = true;

    // Description validation
    if (!formData.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }

    // Price validation
    if (!formData.pricePerPerson) {
      errors.pricePerPerson = "Price per person is required";
      isValid = false;
    } else if (Number(formData.pricePerPerson) <= 0) {
      errors.pricePerPerson = "Price must be greater than 0";
      isValid = false;
    }

    // Minimum guests validation
    if (!formData.minimumGuests) {
      errors.minimumGuests = "Minimum guests is required";
      isValid = false;
    } else if (Number(formData.minimumGuests) <= 0) {
      errors.minimumGuests = "Minimum guests must be greater than 0";
      isValid = false;
    }

    // Maximum guests validation
    if (!formData.maximumGuests) {
      errors.maximumGuests = "Maximum guests is required";
      isValid = false;
    } else if (Number(formData.maximumGuests) <= 0) {
      errors.maximumGuests = "Maximum guests must be greater than 0";
      isValid = false;
    }

    // Validate minimum guests is less than maximum guests
    if (Number(formData.minimumGuests) >= Number(formData.maximumGuests)) {
      errors.minimumGuests = "Minimum guests must be less than maximum guests";
      errors.maximumGuests =
        "Maximum guests must be greater than minimum guests";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Add Package
  const handleAddPackage = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("pricePerPerson", formData.pricePerPerson);
      formDataToSend.append("minimumGuests", formData.minimumGuests);
      formDataToSend.append("maximumGuests", formData.maximumGuests);

      formData.services.forEach((service) => {
        formDataToSend.append("services[]", service);
      });

      formData.features.forEach((feature) => {
        formDataToSend.append("features[]", feature);
      });

      formDataToSend.append("isAvailable", formData.isAvailable.toString());

      if (formData.image) {
        const formattedName = formData.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        const fileExtension = formData.image.name.split(".").pop();
        const newFileName = `${formattedName}.${fileExtension}`;
        formDataToSend.append("image", formData.image, newFileName);
      }

      await customFetch.post("/event-packages", formDataToSend);
      toast.success("Package added successfully");
      setIsAddModalOpen(false);
      resetFormData();
      fetchPackages();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to add package";
        toast.error(errorMessage);
      }
    }
  };

  // Edit Package
  const handleEditPackage = async () => {
    if (!selectedPackage) return;

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        pricePerPerson: Number(formData.pricePerPerson),
        minimumGuests: Number(formData.minimumGuests),
        maximumGuests: Number(formData.maximumGuests),
        services: Array.isArray(formData.services)
          ? formData.services
          : (formData.services as string)
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
        features: Array.isArray(formData.features)
          ? formData.features
          : (formData.features as string)
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
        isAvailable: formData.isAvailable,
      };

      // Handle image separately if there's a new one
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append("image", formData.image);
        await customFetch.patch(
          `/event-packages/${selectedPackage._id}/image`,
          imageFormData
        );
      }

      await customFetch.patch(
        `/event-packages/${selectedPackage._id}`,
        updateData
      );

      toast.success("Package updated successfully");
      setIsEditModalOpen(false);
      setSelectedPackage(null);
      resetFormData();
      await fetchPackages();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update package");
    }
  };

  // Delete Package
  const handleDeletePackage = async () => {
    if (!selectedPackage) return;

    try {
      await customFetch.delete(`/event-packages/${selectedPackage._id}`);
      toast.success("Package deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedPackage(null);
      fetchPackages();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to delete package";
        toast.error(errorMessage);
      }
    }
  };

  // Reset Form Data
  const resetFormData = () => {
    setFormData({
      name: selectedPackage?.name || "",
      description: "",
      type: "Wedding",
      pricePerPerson: "",
      minimumGuests: "",
      maximumGuests: "",
      services: [],
      features: [],
      isAvailable: true,
      image: null,
    });
    setFormErrors({
      description: "",
      pricePerPerson: "",
      minimumGuests: "",
      maximumGuests: "",
      services: "",
      features: "",
      image: "",
    });
  };

  const handleExportPDF = () => {
    // Filter packages based on search query first
    const filteredPackages = packages.filter(filterPackagesBySearch);

    const pdfColumns = [
      { header: "Name", dataKey: "name" as const },
      { header: "Type", dataKey: "type" as const },
      { header: "Price/Person", dataKey: "pricePerPerson" as const },
      { header: "Min Guests", dataKey: "minimumGuests" as const },
      { header: "Max Guests", dataKey: "maximumGuests" as const },
      { header: "Services", dataKey: "servicesText" as const },
      { header: "Features", dataKey: "featuresText" as const },
      { header: "Status", dataKey: "isAvailable" as const },
    ];

    const formattedData = filteredPackages.map((pkg) => ({
      name: pkg.name,
      type: pkg.type,
      pricePerPerson: `Rs. ${pkg.pricePerPerson}`,
      minimumGuests: pkg.minimumGuests,
      maximumGuests: pkg.maximumGuests,
      servicesText: pkg.services.join(", "),
      featuresText: pkg.features.join(", "),
      isAvailable: pkg.isAvailable ? "Available" : "Not Available",
    }));

    // Build a title that includes search info if applicable
    let title = `Event Packages Report - ${
      selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
    }`;

    if (searchQuery) {
      title += ` (Search: "${searchQuery}")`;
    }

    generatePDF({
      title: title,
      data: formattedData,
      filename: `event-packages-${selectedType}${
        searchQuery ? "-search" : ""
      }-${new Date().toISOString().split("T")[0]}.pdf`,
      columns: pdfColumns,
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-20 backdrop-blur-md">
        <BounceLoader size={50} color="#EE1133" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Event Packages</h2>
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
            Add New Package
          </button>
        </div>
      </div>

      {/* Type Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-4 py-2 rounded-full ${
              selectedType === "all"
                ? "bg-event-red text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full ${
                selectedType === type
                  ? "bg-event-red text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search packages by name, description, services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.filter(filterPackagesBySearch).map((pkg) => (
          <div
            key={pkg._id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={`http://localhost:5000/${pkg.image}`}
              alt={pkg.type}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {pkg.type}
                </span>
                <span className="text-event-red font-semibold">
                  Rs. {pkg.pricePerPerson}
                  <div className="text-xs text-gray-500">per person</div>
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>

              <div className="text-sm text-gray-500 mb-3">
                <span>
                  {pkg.minimumGuests} - {pkg.maximumGuests} guests
                </span>
              </div>

              {pkg.services && pkg.services.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Services:
                  </span>
                  <p className="text-sm text-gray-600">
                    {pkg.services.join(", ")}
                  </p>
                </div>
              )}

              {pkg.features && pkg.features.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Features:
                  </span>
                  <p className="text-sm text-gray-600">
                    {pkg.features.join(", ")}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    pkg.isAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {pkg.isAvailable ? "Available" : "Not Available"}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setFormData({
                        name: pkg.name,
                        description: pkg.description,
                        type: pkg.type,
                        pricePerPerson: pkg.pricePerPerson.toString(),
                        minimumGuests: pkg.minimumGuests.toString(),
                        maximumGuests: pkg.maximumGuests.toString(),
                        services: Array.isArray(pkg.services)
                          ? pkg.services
                          : (pkg.services as string)
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean),
                        features: Array.isArray(pkg.features)
                          ? pkg.features
                          : (pkg.features as string)
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean),
                        isAvailable: pkg.isAvailable,
                        image: null,
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="text-event-red hover:text-red-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* No results message */}
        {packages.filter(filterPackagesBySearch).length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-8">
            <p className="text-gray-500 font-medium">
              No packages found matching "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-event-red hover:text-red-700"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetFormData();
        }}
        title="Add New Package"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                setFormErrors({ ...formErrors, description: "" });
              }}
              className={`w-full px-4 py-2 rounded-md border ${
                formErrors.description ? "border-red-500" : "border-gray-300"
              } focus:border-event-red focus:ring-1 focus:ring-event-red`}
              rows={3}
              required
            />
            {formErrors.description && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Per Person (Rs.)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                Rs.
              </span>
              <input
                type="number"
                value={formData.pricePerPerson}
                onChange={(e) => {
                  setFormData({ ...formData, pricePerPerson: e.target.value });
                  setFormErrors({ ...formErrors, pricePerPerson: "" });
                }}
                className={`w-full pl-10 pr-4 py-2 rounded-md border ${
                  formErrors.pricePerPerson
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:border-event-red focus:ring-1 focus:ring-event-red`}
                min="0"
                required
              />
            </div>
            {formErrors.pricePerPerson && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.pricePerPerson}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Guests
              </label>
              <input
                type="number"
                value={formData.minimumGuests}
                onChange={(e) => {
                  setFormData({ ...formData, minimumGuests: e.target.value });
                  setFormErrors({ ...formErrors, minimumGuests: "" });
                }}
                className={`w-full px-4 py-2 rounded-md border ${
                  formErrors.minimumGuests
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:border-event-red focus:ring-1 focus:ring-event-red`}
                min="1"
                required
              />
              {formErrors.minimumGuests && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.minimumGuests}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Guests
              </label>
              <input
                type="number"
                value={formData.maximumGuests}
                onChange={(e) => {
                  setFormData({ ...formData, maximumGuests: e.target.value });
                  setFormErrors({ ...formErrors, maximumGuests: "" });
                }}
                className={`w-full px-4 py-2 rounded-md border ${
                  formErrors.maximumGuests
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:border-event-red focus:ring-1 focus:ring-event-red`}
                min="1"
                required
              />
              {formErrors.maximumGuests && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.maximumGuests}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services
            </label>
            <input
              type="text"
              value={formData.services.join(", ")}
              onChange={(e) => {
                const servicesArray = e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter((item) => item !== "");
                setFormData({ ...formData, services: servicesArray });
                setFormErrors({ ...formErrors, services: "" });
              }}
              className={`w-full px-4 py-2 rounded-md border ${
                formErrors.services ? "border-red-500" : "border-gray-300"
              } focus:border-event-red focus:ring-1 focus:ring-event-red`}
              placeholder="e.g., Decoration, Music, Photography"
            />
            {formErrors.services && (
              <p className="mt-1 text-sm text-red-500">{formErrors.services}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <input
              type="text"
              value={formData.features.join(", ")}
              onChange={(e) => {
                const featuresArray = e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter((item) => item !== "");
                setFormData({ ...formData, features: featuresArray });
                setFormErrors({ ...formErrors, features: "" });
              }}
              className={`w-full px-4 py-2 rounded-md border ${
                formErrors.features ? "border-red-500" : "border-gray-300"
              } focus:border-event-red focus:ring-1 focus:ring-event-red`}
              placeholder="e.g., Free Parking, WiFi, Air Conditioning"
            />
            {formErrors.features && (
              <p className="mt-1 text-sm text-red-500">{formErrors.features}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFormData({ ...formData, image: e.target.files[0] });
                  setFormErrors({ ...formErrors, image: "" });
                }
              }}
              className={`w-full ${formErrors.image ? "border-red-500" : ""}`}
            />
            {formErrors.image && (
              <p className="mt-1 text-sm text-red-500">{formErrors.image}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) =>
                setFormData({ ...formData, isAvailable: e.target.checked })
              }
              className="rounded border-gray-300 text-event-red focus:ring-event-red"
            />
            <label className="text-sm text-gray-700">Available</label>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
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
              onClick={handleAddPackage}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Add Package
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPackage(null);
          resetFormData();
        }}
        title="Edit Package"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Per Person (Rs.)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                Rs.
              </span>
              <input
                type="number"
                value={formData.pricePerPerson}
                onChange={(e) => {
                  setFormData({ ...formData, pricePerPerson: e.target.value });
                  setFormErrors({ ...formErrors, pricePerPerson: "" });
                }}
                className={`w-full pl-10 pr-4 py-2 rounded-md border ${
                  formErrors.pricePerPerson
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:border-event-red focus:ring-1 focus:ring-event-red`}
                min="0"
                required
              />
            </div>
            {formErrors.pricePerPerson && (
              <p className="mt-1 text-sm text-red-500">
                {formErrors.pricePerPerson}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services (comma-separated)
            </label>
            <input
              type="text"
              value={formData.services.join(", ")}
              onChange={(e) => {
                const servicesArray = e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter((item) => item !== "");
                setFormData({ ...formData, services: servicesArray });
              }}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="e.g., Decoration, Music, Photography"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features (comma-separated)
            </label>
            <input
              type="text"
              value={formData.features.join(", ")}
              onChange={(e) => {
                const featuresArray = e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter((item) => item !== "");
                setFormData({ ...formData, features: featuresArray });
              }}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-event-red focus:ring-1 focus:ring-event-red"
              placeholder="e.g., Free Parking, WiFi, Air Conditioning"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedPackage(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditPackage}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Update Package
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPackage(null);
        }}
        title="Delete Package"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete "{selectedPackage?.name}"? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedPackage(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePackage}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventPackages;
