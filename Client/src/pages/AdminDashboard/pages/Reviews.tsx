import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import customFetch from "@/utils/customFetch";
import { BounceLoader } from "react-spinners";
import { generatePDF } from "@/utils/pdfGenerator";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  user: {
    fullName: string;
    email: string;
  };
  eventId:
    | string
    | {
        title: string;
      };
  status: string;
  isVerified: boolean;
  likes: number;
  createdAt: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        console.log("Fetching reviews...");
        const response = await customFetch.get("/reviews");
        console.log("Raw response:", response);
        console.log("Response data:", response.data);
        console.log("Reviews array:", response.data?.reviews);

        if (!response.data?.reviews) {
          console.error("No reviews data found in response");
          toast.error("No reviews data available");
          return;
        }

        const reviewsData = response.data.reviews;
        console.log("First review sample:", reviewsData[0]);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Detailed error:", error);
        toast.error("Failed to load reviews");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Filter reviews based on rating
  const filteredReviews = reviews.filter((review) =>
    ratingFilter === "all" ? true : review.rating === ratingFilter
  );

  // Export PDF function
  const handleExportPDF = () => {
    try {
      console.log("Starting PDF export...");

      if (!filteredReviews || filteredReviews.length === 0) {
        toast.error("No reviews data available to export");
        return;
      }

      const pdfColumns = [
        { header: "User", dataKey: "user" as const },
        { header: "Event", dataKey: "event" as const },
        { header: "Rating", dataKey: "rating" as const },
        { header: "Comment", dataKey: "comment" as const },
        { header: "Date", dataKey: "date" as const },
      ];

      const formattedData = filteredReviews.map((review) => ({
        user: review.user ? review.user.fullName : "N/A",
        event:
          typeof review.eventId === "object" && review.eventId?.title
            ? review.eventId.title
            : typeof review.eventId === "string"
            ? review.eventId
            : "N/A",
        rating: `${review.rating}/5`,
        comment: review.comment || "N/A",
        date: review.createdAt
          ? new Date(review.createdAt).toLocaleDateString()
          : "N/A",
      }));

      generatePDF({
        title: `Reviews Report ${
          ratingFilter !== "all" ? `(${ratingFilter} Stars)` : ""
        }`,
        data: formattedData,
        filename: `reviews-${ratingFilter}-${
          new Date().toISOString().split("T")[0]
        }.pdf`,
        columns: pdfColumns,
      });
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please check console for details.");
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-20 backdrop-blur-md">
        <BounceLoader size={50} color="#EE1133" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-8 font-Mainfront">
        <Toaster position="top-center" />
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">All Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Filter by Rating:</label>
              <select
                value={ratingFilter}
                onChange={(e) =>
                  setRatingFilter(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-event-red focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} {rating === 1 ? "Star" : "Stars"}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExportPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Export PDF
            </button>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No reviews found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-8 font-Mainfront">
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold text-gray-800">All Reviews</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Filter by Rating:</label>
            <select
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              className="px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-event-red focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} {rating === 1 ? "Star" : "Stars"}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleExportPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReviews.map((review) => (
              <tr key={review._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {review.user?.fullName || "Unknown User"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {typeof review.eventId === "object"
                      ? review.eventId?.title || "Event not found"
                      : "Event ID: " + review.eventId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <svg
                        key={index}
                        className={`h-5 w-5 ${
                          index < review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{review.comment}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reviews;
