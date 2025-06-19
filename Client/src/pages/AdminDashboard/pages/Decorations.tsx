import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import { BounceLoader } from "react-spinners";
import Modal from "@/components/UI/Modal";
import axios from "axios";
import { generatePDF } from "@/utils/pdfGenerator";

// Decoration interface
interface Decoration {
  _id: string;
  name: string;
  items: Array<{
    name: string;
    quantity: number;
    description?: string;
  }>;
  pricePerDay: number;
  setupTime: number;
  features: string[];
  images: string[];
  colorScheme: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  availability: {
    isAvailable: boolean;
    unavailableDates: Array<{
      startDate: Date;
      endDate: Date;
      reason: string;
    }>;
  };
  rating: number;
}

const Decorations = () => {
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDecoration, setSelectedDecoration] =
    useState<Decoration | null>(null);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const [formData, setFormData] = useState({
    name: "",
    items: [
      {
        name: "",
        quantity: 1,
        description: "",
      },
    ],
    pricePerDay: "",
    setupTime: "",
    features: "",
    colorScheme: {
      primary: "#000000",
      secondary: "",
      accent: "",
    },
    isAvailable: true,
    images: [] as File[],
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    items: [] as string[],
    pricePerDay: "",
    setupTime: "",
    features: "",
    images: "",
  });

  const validateForm = () => {
    const errors = {
      name: "",
      items: [] as string[],
      pricePerDay: "",
      setupTime: "",
      features: "",
      images: "",
    };
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Decoration name is required";
      isValid = false;
    }

    // Items validation
    const itemErrors = formData.items.map((item, index) => {
      if (!item.name.trim()) {
        return `Item ${index + 1} name is required`;
      }
      if (item.quantity < 1) {
        return `Item ${index + 1} quantity must be at least 1`;
      }
      return "";
    });
    if (itemErrors.some((error) => error !== "")) {
      errors.items = itemErrors;
      isValid = false;
    }

    // Price validation
    if (!formData.pricePerDay) {
      errors.pricePerDay = "Price per day is required";
      isValid = false;
    } else if (Number(formData.pricePerDay) <= 0) {
      errors.pricePerDay = "Price must be greater than 0";
      isValid = false;
    }

    // Setup time validation
    if (!formData.setupTime) {
      errors.setupTime = "Setup time is required";
      isValid = false;
    } else if (Number(formData.setupTime) <= 0) {
      errors.setupTime = "Setup time must be greater than 0";
      isValid = false;
    }

    // Features validation
    if (!formData.features.trim()) {
      errors.features = "At least one feature is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // fetch decoration function
  const fetchDecorations = async () => {
    setIsLoading(true);
    try {
      const { data } = await customFetch.get("/decorations");
      setDecorations(data.decorations);
    } catch (error) {
      console.error("Error fetching decorations:", error);
      toast.error("Failed to fetch decorations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDecorations();
  }, []);

  // add decoration function
  const handleAddDecoration = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const decorationData = {
        name: formData.name.trim(),
        items: formData.items.filter((item) => item.name.trim()),
        pricePerDay: Number(formData.pricePerDay),
        setupTime: Number(formData.setupTime),
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        colorScheme: formData.colorScheme,
        isAvailable: formData.isAvailable,
      };

      await customFetch.post("/decorations", decorationData);

      if (formData.images.length > 0) {
        const imageFormData = new FormData();
        formData.images.forEach((image) => {
          imageFormData.append("images", image);
        });
      }

      toast.success("Decoration package added successfully");
      setIsAddModalOpen(false);
      resetFormData();
      fetchDecorations();
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.msg;
        if (errorMessage) {
          toast.error(errorMessage);
        } else {
          toast.error("Failed to add decoration package");
        }
      }
    }
  };

  // edit decoration function
  const handleEditDecoration = async () => {
    if (!selectedDecoration) return;

    try {
      const decorationData = {
        name: formData.name.trim(),
        items: formData.items.filter((item) => item.name.trim()),
        pricePerDay: Number(formData.pricePerDay),
        setupTime: Number(formData.setupTime),
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        colorScheme: {
          primary: formData.colorScheme.primary,
          secondary: formData.colorScheme.secondary || "",
          accent: formData.colorScheme.accent || "",
        },
        isAvailable: formData.isAvailable,
      };

      await customFetch.patch(
        `/decorations/${selectedDecoration._id}`,
        decorationData
      );

      toast.success("Decoration package updated successfully");
      setIsEditModalOpen(false);
      setSelectedDecoration(null);
      resetFormData();
      fetchDecorations();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.msg || "Failed to update decoration package";
        toast.error(errorMessage);
      }
    }
  };

  // delete decoration function
  const handleDeleteDecoration = async () => {
    if (!selectedDecoration) return;

    try {
      await customFetch.delete(`/decorations/${selectedDecoration._id}`);
      toast.success("Decoration package deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedDecoration(null);
      fetchDecorations();
    } catch (error) {
      console.error(error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.msg || "Failed to delete decoration package"
          : "Failed to delete decoration package"
      );
    }
  };

  // reset form
  const resetFormData = () => {
    setFormData({
      name: "",
      items: [{ name: "", quantity: 1, description: "" }],
      pricePerDay: "",
      setupTime: "",
      features: "",
      colorScheme: {
        primary: "#000000",
        secondary: "",
        accent: "",
      },
      isAvailable: true,
      images: [],
    });
    setFormErrors({
      name: "",
      items: [],
      pricePerDay: "",
      setupTime: "",
      features: "",
      images: "",
    });
  };

  // filter decoration function (price range and search)
  const filteredDecorations = decorations
    .filter((decoration) => {
      // Price range filter
      if (priceRange.min && decoration.pricePerDay < Number(priceRange.min))
        return false;
      if (priceRange.max && decoration.pricePerDay > Number(priceRange.max))
        return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = decoration.name.toLowerCase().includes(query);
        const featuresMatch = decoration.features.some((f) =>
          f.toLowerCase().includes(query)
        );
        const itemsMatch = decoration.items.some((item) =>
          item.name.toLowerCase().includes(query)
        );

        return nameMatch || featuresMatch || itemsMatch;
      }

      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Handle PDF export
  const handleExportPDF = () => {
    const pdfColumns = [
      { header: "Name", dataKey: "name" as const },
      { header: "Price/Day", dataKey: "priceText" as const },
      { header: "Setup Time", dataKey: "setupTimeText" as const },
      { header: "Features", dataKey: "featuresText" as const },
      { header: "Items", dataKey: "itemsText" as const },
      { header: "Status", dataKey: "availabilityText" as const },
    ];

    const formattedData = filteredDecorations.map((decoration) => ({
      name: decoration.name,
      priceText: `Rs. ${decoration.pricePerDay}`,
      setupTimeText: `${decoration.setupTime} hours`,
      featuresText: decoration.features.join(", "),
      itemsText: decoration.items
        .map((item) => `${item.name} (${item.quantity})`)
        .join(", "),
      availabilityText: decoration.availability.isAvailable
        ? "Available"
        : "Not Available",
      colors: `Primary: ${decoration.colorScheme.primary}, ${
        decoration.colorScheme.secondary
          ? `Secondary: ${decoration.colorScheme.secondary},`
          : ""
      } ${
        decoration.colorScheme.accent
          ? `Accent: ${decoration.colorScheme.accent}`
          : ""
      }`.trim(),
    }));

    // Build title with filter information
    let title = "Event Decorations Report";

    if (priceRange.min || priceRange.max) {
      title += ` (Price: Rs.${priceRange.min || "0"}-${priceRange.max || "∞"})`;
    }

    generatePDF({
      title: title,
      data: formattedData,
      filename: `event-decorations${
        priceRange.min || priceRange.max ? "-filtered" : ""
      }-${new Date().toISOString().split("T")[0]}.pdf`,
      columns: pdfColumns,
    });
  };

  return (
    <div className="p-6">
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Event Decorations</h1>
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
            Add New Decoration
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
              placeholder="Search decorations by name, features, or items..."
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

        {/* Price Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Price Range (per day):
            </span>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, min: e.target.value }))
              }
              className="w-24 px-2 py-1 border rounded-md"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange((prev) => ({ ...prev, max: e.target.value }))
              }
              className="w-24 px-2 py-1 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Grid - Display Decorations */}
      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-20 backdrop-blur-md">
          <BounceLoader size={50} color="#EE1133" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecorations.map((decoration) => (
            <div
              key={decoration._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={`http://localhost:5000/${decoration.images[0]}`}
                  alt={decoration.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {decoration.name}
                  </h3>
                  <span className="text-event-red font-semibold">
                    Rs. {decoration.pricePerDay}
                    <span className="text-xs text-gray-500">/day</span>
                  </span>
                </div>

                <div className="text-sm text-gray-500 mb-2">
                  <div>Setup Time: {decoration.setupTime} hours</div>
                </div>

                <div className="mt-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      decoration.availability.isAvailable
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {decoration.availability.isAvailable
                      ? "Available"
                      : "Not Available"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Colors:</span>
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{
                        backgroundColor: decoration.colorScheme.primary,
                      }}
                      title="Primary Color"
                    />
                    {decoration.colorScheme.secondary && (
                      <div
                        className="w-6 h-6 rounded-full border ml-1"
                        style={{
                          backgroundColor: decoration.colorScheme.secondary,
                        }}
                        title="Secondary Color"
                      />
                    )}
                    {decoration.colorScheme.accent && (
                      <div
                        className="w-6 h-6 rounded-full border ml-1"
                        style={{
                          backgroundColor: decoration.colorScheme.accent,
                        }}
                        title="Accent Color"
                      />
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      console.log("Selected decoration:", decoration);
                      setSelectedDecoration(decoration);
                      setFormData({
                        name: decoration.name,
                        items: decoration.items.map((item) => ({
                          name: item.name,
                          quantity: item.quantity,
                          description: item.description || "",
                        })),
                        pricePerDay: decoration.pricePerDay.toString(),
                        setupTime: decoration.setupTime.toString(),
                        features: decoration.features.join(", "),
                        colorScheme: {
                          primary: decoration.colorScheme.primary,
                          secondary: decoration.colorScheme.secondary || "",
                          accent: decoration.colorScheme.accent || "",
                        },
                        isAvailable: decoration.availability.isAvailable,
                        images: [],
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="text-sm px-3 py-1 bg-event-red text-white rounded hover:bg-red-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDecoration(decoration);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-sm px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetFormData();
        }}
        title="Add New Decoration"
      >
        <div className="space-y-4">
          {/* Basic Info */}
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
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
            )}
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items
            </label>
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].name = e.target.value;
                    setFormData({ ...formData, items: newItems });
                    const newErrors = [...formErrors.items];
                    newErrors[index] = "";
                    setFormErrors({ ...formErrors, items: newErrors });
                  }}
                  className={`flex-1 px-4 py-2 rounded-md border ${
                    formErrors.items[index]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].quantity = parseInt(e.target.value);
                    setFormData({ ...formData, items: newItems });
                    const newErrors = [...formErrors.items];
                    newErrors[index] = "";
                    setFormErrors({ ...formErrors, items: newErrors });
                  }}
                  className={`w-24 px-4 py-2 rounded-md border ${
                    formErrors.items[index]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  min="1"
                />
                <button
                  onClick={() => {
                    const newItems = formData.items.filter(
                      (_, i) => i !== index
                    );
                    setFormData({ ...formData, items: newItems });
                    const newErrors = formErrors.items.filter(
                      (_, i) => i !== index
                    );
                    setFormErrors({ ...formErrors, items: newErrors });
                  }}
                  className="px-2 py-1 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            {formErrors.items.map(
              (error, index) =>
                error && (
                  <p key={index} className="mt-1 text-sm text-red-500">
                    {error}
                  </p>
                )
            )}
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  items: [
                    ...formData.items,
                    { name: "", quantity: 1, description: "" },
                  ],
                });
                setFormErrors({
                  ...formErrors,
                  items: [...formErrors.items, ""],
                });
              }}
              className="text-event-red hover:text-red-700 text-sm"
            >
              + Add Item
            </button>
          </div>

          {/* Pricing & Setup */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Day
              </label>
              <input
                type="number"
                value={formData.pricePerDay}
                onChange={(e) => {
                  setFormData({ ...formData, pricePerDay: e.target.value });
                  setFormErrors({ ...formErrors, pricePerDay: "" });
                }}
                className={`w-full px-4 py-2 rounded-md border ${
                  formErrors.pricePerDay ? "border-red-500" : "border-gray-300"
                } focus:border-event-red focus:ring-1 focus:ring-event-red`}
                min="0"
                step="0.01"
              />
              {formErrors.pricePerDay && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.pricePerDay}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Setup Time (hours)
              </label>
              <input
                type="number"
                value={formData.setupTime}
                onChange={(e) => {
                  setFormData({ ...formData, setupTime: e.target.value });
                  setFormErrors({ ...formErrors, setupTime: "" });
                }}
                className={`w-full px-4 py-2 rounded-md border ${
                  formErrors.setupTime ? "border-red-500" : "border-gray-300"
                } focus:border-event-red focus:ring-1 focus:ring-event-red`}
                min="1"
              />
              {formErrors.setupTime && (
                <p className="mt-1 text-sm text-red-500">
                  {formErrors.setupTime}
                </p>
              )}
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features (comma-separated)
            </label>
            <input
              type="text"
              value={formData.features}
              onChange={(e) => {
                setFormData({ ...formData, features: e.target.value });
                setFormErrors({ ...formErrors, features: "" });
              }}
              className={`w-full px-4 py-2 rounded-md border ${
                formErrors.features ? "border-red-500" : "border-gray-300"
              } focus:border-event-red focus:ring-1 focus:ring-event-red`}
            />
            {formErrors.features && (
              <p className="mt-1 text-sm text-red-500">{formErrors.features}</p>
            )}
          </div>

          {/* Colors */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <input
                type="color"
                value={formData.colorScheme.primary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    colorScheme: {
                      ...formData.colorScheme,
                      primary: e.target.value,
                    },
                  })
                }
                className="w-full h-10 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <input
                type="color"
                value={formData.colorScheme.secondary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    colorScheme: {
                      ...formData.colorScheme,
                      secondary: e.target.value,
                    },
                  })
                }
                className="w-full h-10 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <input
                type="color"
                value={formData.colorScheme.accent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    colorScheme: {
                      ...formData.colorScheme,
                      accent: e.target.value,
                    },
                  })
                }
                className="w-full h-10 rounded-md"
              />
            </div>
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
              }}
              className="w-full"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.checked })
                }
                className="rounded border-gray-300 text-event-red focus:ring-event-red"
              />
              <span className="text-sm text-gray-700">
                Available for Booking
              </span>
            </label>
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
              onClick={handleAddDecoration}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Add Decoration
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDecoration(null);
          resetFormData();
        }}
        title="Edit Decoration"
      >
        <div className="space-y-4">
          {/* Basic Info */}
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items
            </label>
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].name = e.target.value;
                    setFormData({ ...formData, items: newItems });
                    const newErrors = [...formErrors.items];
                    newErrors[index] = "";
                    setFormErrors({ ...formErrors, items: newErrors });
                  }}
                  className={`flex-1 px-4 py-2 rounded-md border ${
                    formErrors.items[index]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[index].quantity = parseInt(e.target.value);
                    setFormData({ ...formData, items: newItems });
                    const newErrors = [...formErrors.items];
                    newErrors[index] = "";
                    setFormErrors({ ...formErrors, items: newErrors });
                  }}
                  className={`w-24 px-4 py-2 rounded-md border ${
                    formErrors.items[index]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  min="1"
                />
                <button
                  onClick={() => {
                    const newItems = formData.items.filter(
                      (_, i) => i !== index
                    );
                    setFormData({ ...formData, items: newItems });
                    const newErrors = formErrors.items.filter(
                      (_, i) => i !== index
                    );
                    setFormErrors({ ...formErrors, items: newErrors });
                  }}
                  className="px-2 py-1 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            {formErrors.items.map(
              (error, index) =>
                error && (
                  <p key={index} className="mt-1 text-sm text-red-500">
                    {error}
                  </p>
                )
            )}
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  items: [
                    ...formData.items,
                    { name: "", quantity: 1, description: "" },
                  ],
                });
                setFormErrors({
                  ...formErrors,
                  items: [...formErrors.items, ""],
                });
              }}
              className="text-event-red hover:text-red-700 text-sm"
            >
              + Add Item
            </button>
          </div>

          {/* Pricing & Setup */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Day
              </label>
              <input
                type="number"
                value={formData.pricePerDay}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerDay: e.target.value })
                }
                className={`w-full px-4 py-2 rounded-md border ${
                  formErrors.pricePerDay ? "border-red-500" : "border-gray-300"
                } focus:border-event-red focus:ring-1 focus:ring-event-red`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Setup Time (hours)
              </label>
              <input
                type="number"
                value={formData.setupTime}
                onChange={(e) =>
                  setFormData({ ...formData, setupTime: e.target.value })
                }
                className={`w-full px-4 py-2 rounded-md border ${
                  formErrors.setupTime ? "border-red-500" : "border-gray-300"
                } focus:border-event-red focus:ring-1 focus:ring-event-red`}
                min="1"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features (comma-separated)
            </label>
            <input
              type="text"
              value={formData.features}
              onChange={(e) =>
                setFormData({ ...formData, features: e.target.value })
              }
              className={`w-full px-4 py-2 rounded-md border ${
                formErrors.features ? "border-red-500" : "border-gray-300"
              } focus:border-event-red focus:ring-1 focus:ring-event-red`}
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <input
                type="color"
                value={formData.colorScheme.primary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    colorScheme: {
                      ...formData.colorScheme,
                      primary: e.target.value,
                    },
                  })
                }
                className="w-full h-10 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <input
                type="color"
                value={formData.colorScheme.secondary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    colorScheme: {
                      ...formData.colorScheme,
                      secondary: e.target.value,
                    },
                  })
                }
                className="w-full h-10 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <input
                type="color"
                value={formData.colorScheme.accent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    colorScheme: {
                      ...formData.colorScheme,
                      accent: e.target.value,
                    },
                  })
                }
                className="w-full h-10 rounded-md"
              />
            </div>
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
              }}
              className="w-full"
            />
          </div>

          {/* Availability */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.checked })
                }
                className="rounded border-gray-300 text-event-red focus:ring-event-red"
              />
              <span className="text-sm text-gray-700">
                Available for Booking
              </span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedDecoration(null);
                resetFormData();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditDecoration}
              className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
            >
              Update Decoration
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Decoration"
      >
        <p>Are you sure you want to delete this decoration?</p>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteDecoration}
            className="px-4 py-2 bg-event-red text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Decorations;
