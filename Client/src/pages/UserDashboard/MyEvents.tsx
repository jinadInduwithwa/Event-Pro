import { useState, useEffect } from "react";
import customFetch from "../../utils/customFetch";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { BounceLoader } from "react-spinners";
import { Link } from "react-router-dom";

interface RentalItem {
  _id: string;
  name: string;
  rentalPrice: number;
  quantity: number;
}

interface MenuItem {
  _id: string;
  name: string;
  category: string;
  pricePerPlate: number;
}

interface Event {
  _id: string;
  title: string;
  type: string;
  date: string;
  time: {
    start: string;
    end: string;
  };
  status: string;
  totalCost: number;
  venue: {
    name: string;
    location: { address: string };
  };
  guests: { count: number };
  services: {
    decoration: string | { _id: string; name: string } | null;
    photographer: string | { _id: string; fullName: string } | null;
    musicalGroup: string | { _id: string; name: string } | null;
  };
  rentalItems: RentalItem[];
  menuItems?: MenuItem[];
}

function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await customFetch.get("/events/my-events");
        console.log("Fetched Events:", data.events);

        // Add a test menu item to each event for debugging
        const eventsWithMenuItems = data.events.map((event: Event) => {
          // Only add test items if menuItems is undefined or empty
          if (!event.menuItems || event.menuItems.length === 0) {
            return {
              ...event,
              menuItems: [
                {
                  _id: "test-menu-id-1",
                  name: "Test Appetizer",
                  category: "Appetizers",
                  pricePerPlate: 500,
                },
                {
                  _id: "test-menu-id-2",
                  name: "Test Main Course",
                  category: "Main Course",
                  pricePerPlate: 1200,
                },
              ],
            };
          }
          return event;
        });

        setEvents(eventsWithMenuItems);
      } catch (error) {
        toast.error("Failed to fetch events");
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-20 backdrop-blur-md">
        <BounceLoader size={50} color="#EE1133" />
      </div>
    );
  }

  const EventDetailsModal = ({
    event,
    onClose,
  }: {
    event: Event;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {event.title}
            </h2>
            <p className="text-gray-600 mt-1">{event.type} Event</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Date & Time
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">
                  {format(new Date(event.date), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">
                  {event.time.start} - {event.time.end}
                </p>
              </div>
            </div>
          </div>

          {event.venue && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Venue Details
              </h3>
              <div className="space-y-2">
                <p className="font-medium text-gray-800">{event.venue.name}</p>
                {event.venue.location && (
                  <p className="text-gray-600">
                    {event.venue.location.address}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Guest Information
            </h3>
            <p className="font-medium">{event.guests.count} Guests</p>
          </div>

          {/* Rental Items Section */}
          {event.rentalItems && event.rentalItems.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Rental Items
              </h3>
              <div className="space-y-3">
                {event.rentalItems.map((item, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 pb-3 last:border-none last:pb-0"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">🎁</span>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {item.name}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          Quantity: {item.quantity || 1}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Menu Items Section */}
          {event.menuItems && event.menuItems.length > 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-800">Food Menu</h3>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="text-sm text-event-red hover:text-red-700 flex items-center"
                >
                  {showMoreMenu ? "Show Less" : "Show More"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 ml-1 transition-transform ${
                      showMoreMenu ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {showMoreMenu ? (
                <div className="space-y-3">
                  {event.menuItems.map((item, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 pb-3 last:border-none last:pb-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">🍽️</span>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {item.name}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {item.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-event-red font-medium">
                          Rs. {item.pricePerPlate}/plate
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <p className="font-medium text-gray-600">
                        Number of guests:
                      </p>
                      <p className="font-medium text-gray-800">
                        {event.guests.count}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="font-medium text-gray-600">
                        Total food cost:
                      </p>
                      <p className="font-semibold text-event-red">
                        Rs.{" "}
                        {event.menuItems.reduce(
                          (total, item) =>
                            total + item.pricePerPlate * event.guests.count,
                          0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  {event.menuItems.length} food item
                  {event.menuItems.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          ) : null}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Selected Services
            </h3>
            <div className="space-y-4">
              {/* Photography Service */}
              <div className="border-b border-gray-200 pb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">📸</span>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      Photography Service
                    </h4>
                    {event.services && event.services.photographer ? (
                      <>
                        <p className="text-gray-600">
                          {typeof event.services.photographer === "object"
                            ? event.services.photographer.fullName
                            : "Photographer Selected"}
                        </p>
                        <p className="text-green-600 text-sm mt-1">
                          Free Service
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500 italic">
                        No photographer selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Musical Group Service */}
              <div className="border-b border-gray-200 pb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🎵</span>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      Musical Entertainment
                    </h4>
                    {event.services && event.services.musicalGroup ? (
                      <div>
                        <p className="text-gray-600">
                          {typeof event.services.musicalGroup === "object"
                            ? event.services.musicalGroup.name
                            : "Musical Group Selected"}
                        </p>
                        <p className="text-event-red text-sm mt-1">
                          Paid Service
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        No musical group selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Decoration Service */}
              <div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🎨</span>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      Decoration Service
                    </h4>
                    {event.services && event.services.decoration ? (
                      <div>
                        <p className="text-gray-600">
                          {typeof event.services.decoration === "object"
                            ? event.services.decoration.name
                            : "Decoration Selected"}
                        </p>
                        <p className="text-event-red text-sm mt-1">
                          Paid Service
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        No decoration service selected
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Status</h3>
              <span
                className={`mt-1 inline-block px-3 py-1 text-sm rounded-full ${
                  event.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : event.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : event.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-medium text-gray-600">Total Cost</h3>
              <p className="text-xl font-bold text-event-red">
                Rs. {event.totalCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Ensure we check if menuItems exists and has length before rendering
  // Add this debugging output
  console.log("Selected event:", selectedEvent);
  if (selectedEvent) {
    console.log(
      "Selected event menuItems:",
      selectedEvent.menuItems || "No menu items"
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Events</h1>
        <Link
          to="/plan-event"
          className="bg-event-red text-white px-6 py-2 rounded-md hover:bg-red-700 transition duration-300 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            You haven't planned any events yet.
          </p>
          <Link
            to="/plan-event"
            className="bg-event-red text-white px-6 py-2 rounded-md hover:bg-red-700"
          >
            Plan an Event
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{event.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(event.date), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.time.start} - {event.time.end}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        event.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : event.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : event.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {event.status.charAt(0).toUpperCase() +
                        event.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rs. {event.totalCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="text-event-red hover:text-red-700"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}

export default MyEvents;
