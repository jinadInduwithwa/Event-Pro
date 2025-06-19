import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import Modal from "@/components/UI/Modal";
import axios from "axios";
import { generatePDF } from "@/utils/pdfGenerator";

// Photographer interface
interface Photographer {
  _id: string;
  fullName: string;
  email: string;
  image: string;
  phoneNumber: string;
  experience: number;
  availability: boolean;
  ratings: number;
  [key: string]: string | number | boolean | null | undefined;
}

const Photographers = () => {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPhotographerId, setSelectedPhotographerId] = useState<
    string | null
  >(null);

  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    experience: 0,
    availability: false,
    ratings: 0,
  });

  const [addFormData, setAddFormData] = useState({
    photographerId: "",
    fullName: "",
    phoneNumber: "",
    image: null as File | null,
    email: "",
    experience: 0,
    availability: false,
    ratings: 0,
  });

  const [addFormErrors, setAddFormErrors] = useState({
    photographerId: "",
    fullName: "",
    phoneNumber: "",
    email: "",
    experience: "",
  });

  // Add placeholder image as base64 string
  const placeholderImage =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNNzUgNzVDODIuMTc5NyA3NSA4OCA2OS4xNzk3IDg4IDYyQzg4IDU0LjgyMDMgODIuMTc5NyA0OSA3NSA0OUM2Ny44MjAzIDQ5IDYyIDU0LjgyMDMgNjIgNjJDNjIgNjkuMTc5NyA2Ny44MjAzIDc1IDc1IDc1WiIgZmlsbD0iIzk0QTNCOCIvPjxwYXRoIGQ9Ik0xMTAgMTExQzExMCAxMjYuMjE3IDk0LjMyODggMTI1IDc1IDEyNUM1NS42NzEyIDEyNSA0MCAxMjYuMjE3IDQwIDExMUM0MCA5NS43ODI5IDU1LjY3MTIgODMgNzUgODNDOTQuMzI4OCA4MyAxMTAgOTUuNzgyOSAxMTAgMTExWiIgZmlsbD0iIzk0QTNCOCIvPjwvc3ZnPg==";

  // fetch photographers funtion
  const fetchPhotographers = async () => {
    setIsLoading(true);
    try {
      const { data } = await customFetch.get("/photographers");
      console.log("Fetched photographers:", data);

      const updatedPhotographers = (data.photographers || []).map(
        (photographer: Photographer) => ({
          ...photographer,
          image: photographer.image.startsWith("http")
            ? photographer.image
            : `http://localhost:5000/${photographer.image}`,
        })
      );

      setPhotographers(updatedPhotographers);
    } catch (error) {
      console.error("Error fetching photographers:", error);
      toast.error("Failed to fetch photographers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotographers();
  }, []);

  const handleEdit = (photographer: Photographer) => {
    setSelectedPhotographerId(photographer._id);
    setEditFormData({
      fullName: photographer.fullName,
      phoneNumber: photographer.phoneNumber,
      email: photographer.email,
      experience: Number(photographer.experience),
      availability: Boolean(photographer.availability),
      ratings: photographer.ratings || 0,
    });
    setIsEditModalOpen(true);
  };

  // Add form validation function
  const validateAddForm = () => {
    const errors = {
      photographerId: "",
      fullName: "",
      phoneNumber: "",
      email: "",
      experience: "",
    };
    let isValid = true;

    // Experience validation
    if (!addFormData.experience) {
      errors.experience = "Experience is required";
      isValid = false;
    } else if (addFormData.experience < 0) {
      errors.experience = "Experience must be a positive number";
      isValid = false;
    }

    // Phone Number validation
    const phoneRegex = /^0\d{9}$/;
    if (!addFormData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!phoneRegex.test(addFormData.phoneNumber)) {
      errors.phoneNumber =
        "Phone number must start with 0 and be exactly 10 digits";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!addFormData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(addFormData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Full Name validation
    if (!addFormData.fullName.trim()) {
      errors.fullName = "Full name is required";
      isValid = false;
    }

    // Photographer ID validation
    if (!addFormData.photographerId.trim()) {
      errors.photographerId = "Photographer ID is required";
      isValid = false;
    }

    setAddFormErrors(errors);
    return isValid;
  };

  // add photographers funtion
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAddForm()) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("photographerId", addFormData.photographerId);
      formData.append("fullName", addFormData.fullName);
      formData.append("phoneNumber", addFormData.phoneNumber);
      formData.append("email", addFormData.email);
      formData.append("experience", addFormData.experience.toString());
      formData.append("availability", addFormData.availability.toString());
      formData.append("ratings", addFormData.ratings.toString());

      if (addFormData.image) {
        formData.append("image", addFormData.image);
      }

      await customFetch.post(`/photographers`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Photographer added successfully");
      setIsAddModalOpen(false);
      setAddFormData({
        photographerId: "",
        fullName: "",
        phoneNumber: "",
        image: null,
        email: "",
        experience: 0,
        availability: false,
        ratings: 0,
      });
      fetchPhotographers();
    } catch (error) {
      handleRequestError(error, "Failed to add photographer");
    }
  };

  const handleDelete = (photographer: Photographer) => {
    setSelectedPhotographerId(photographer._id);
    setIsDeleteModalOpen(true);
  };

  // edit photographers funtion
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhotographerId) return;

    try {
      await customFetch.patch(
        `/photographers/${selectedPhotographerId}`,
        editFormData
      );
      toast.success("Photographer updated successfully");
      setIsEditModalOpen(false);
      setSelectedPhotographerId(null);
      fetchPhotographers();
    } catch (error) {
      handleRequestError(error, "Failed to update photographer");
    }
  };

  const handleRequestError = (error: unknown, defaultMessage: string) => {
    if (axios.isAxiosError(error)) {
      toast.error(error.response?.data?.msg || defaultMessage);
    } else {
      toast.error(defaultMessage);
    }
  };

  // delete photographers funtion
  const handleDeleteConfirm = async () => {
    if (!selectedPhotographerId) return;

    try {
      await customFetch.delete(`/photographers/${selectedPhotographerId}`);
      toast.success("Photographer deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedPhotographerId(null);
      fetchPhotographers();
    } catch (error) {
      handleRequestError(error, "Failed to delete photographer");
    }
  };

  // export PDF
  const handleExportPDF = () => {
    const pdfColumns = [
      { header: "Name", dataKey: "fullName" },
      { header: "Email", dataKey: "email" },
      { header: "Phone", dataKey: "phoneNumber" },
      { header: "Ratings", dataKey: "ratings" },
      { header: "Experience", dataKey: "experience" },
    ];

    generatePDF<Photographer>({
      title: "Photographers Report -",
      data: photographers,
      filename: `photographers-${new Date().toISOString().split("T")[0]}.pdf`,
      columns: pdfColumns,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Photographers List
        </h2>
        <div className="flex gap-4">
          <button
            onClick={handleExportPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Export PDF
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-event-red hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            + Add Photographer
          </button>
        </div>
      </div>
      {/* Photographers Grid - Display photographers*/}
      {photographers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photographers.map((photographer) => (
            <div
              key={photographer._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
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
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {photographer.fullName}
                </h3>
                <p className="text-sm text-gray-600">{photographer.email}</p>
                <p className="text-sm text-gray-600">
                  {photographer.phoneNumber}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Experience: {photographer.experience} years
                </p>
                <div className="mt-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      photographer.availability
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {photographer.availability ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(photographer)}
                    className="text-gray-600 px-4 py-2 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(photographer)}
                    className="text-red-600 px-4 py-2 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No photographers found.</p>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Photographer"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Photographer ID (Manual)
            </label>
            <input
              type="text"
              value={addFormData.photographerId}
              onChange={(e) => {
                setAddFormData({
                  ...addFormData,
                  photographerId: e.target.value,
                });
                setAddFormErrors({ ...addFormErrors, photographerId: "" });
              }}
              className={`w-full px-4 py-2 border rounded-md ${
                addFormErrors.photographerId
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              required
            />
            {addFormErrors.photographerId && (
              <p className="mt-1 text-sm text-red-500">
                {addFormErrors.photographerId}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={addFormData.fullName}
              onChange={(e) => {
                setAddFormData({ ...addFormData, fullName: e.target.value });
                setAddFormErrors({ ...addFormErrors, fullName: "" });
              }}
              className={`w-full px-4 py-2 border rounded-md ${
                addFormErrors.fullName ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {addFormErrors.fullName && (
              <p className="mt-1 text-sm text-red-500">
                {addFormErrors.fullName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              value={addFormData.phoneNumber}
              onChange={(e) => {
                setAddFormData({ ...addFormData, phoneNumber: e.target.value });
                setAddFormErrors({ ...addFormErrors, phoneNumber: "" });
              }}
              className={`w-full px-4 py-2 border rounded-md ${
                addFormErrors.phoneNumber ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {addFormErrors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">
                {addFormErrors.phoneNumber}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={addFormData.email}
              onChange={(e) => {
                setAddFormData({ ...addFormData, email: e.target.value });
                setAddFormErrors({ ...addFormErrors, email: "" });
              }}
              className={`w-full px-4 py-2 border rounded-md ${
                addFormErrors.email ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {addFormErrors.email && (
              <p className="mt-1 text-sm text-red-500">{addFormErrors.email}</p>
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
                  setAddFormData({ ...addFormData, image: e.target.files[0] });
                }
              }}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Experience (Years)
            </label>
            <input
              type="number"
              value={addFormData.experience}
              onChange={(e) => {
                setAddFormData({
                  ...addFormData,
                  experience: Number(e.target.value),
                });
                setAddFormErrors({ ...addFormErrors, experience: "" });
              }}
              className={`w-full px-4 py-2 border rounded-md ${
                addFormErrors.experience ? "border-red-500" : "border-gray-300"
              }`}
              min="0"
              required
            />
            {addFormErrors.experience && (
              <p className="mt-1 text-sm text-red-500">
                {addFormErrors.experience}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="availability"
                value="true"
                checked={addFormData.availability === true}
                onChange={() =>
                  setAddFormData({ ...addFormData, availability: true })
                }
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Available
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="availability"
                value="false"
                checked={addFormData.availability === false}
                onChange={() =>
                  setAddFormData({ ...addFormData, availability: false })
                }
                className="h-4 w-4 text-red-600"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Unavailable
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Add Photographer
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Photographer"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={editFormData.fullName}
              onChange={(e) =>
                setEditFormData({ ...editFormData, fullName: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              value={editFormData.phoneNumber}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  phoneNumber: e.target.value,
                })
              }
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={editFormData.email}
              onChange={(e) =>
                setEditFormData({ ...editFormData, email: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Experience (Years)
            </label>
            <input
              type="number"
              value={editFormData.experience}
              onChange={(e) =>
                setEditFormData({
                  ...editFormData,
                  experience: Number(e.target.value),
                })
              }
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="availability"
                value="true"
                checked={editFormData.availability === true}
                onChange={() =>
                  setEditFormData({ ...editFormData, availability: true })
                }
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Available
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="availability"
                value="false"
                checked={editFormData.availability === false}
                onChange={() =>
                  setEditFormData({ ...editFormData, availability: false })
                }
                className="h-4 w-4 text-red-600"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Unavailable
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Photographer"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this photographer?
          </p>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
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

export default Photographers;
