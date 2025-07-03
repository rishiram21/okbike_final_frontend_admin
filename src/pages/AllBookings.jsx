import React, { useEffect, useState, useCallback } from 'react';
import { FaEye } from "react-icons/fa";
import apiClient from "../api/apiConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from 'react-router-dom';

const AllBookings = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/booking/all", {
        params: {
          page: currentPage,
          size: itemsPerPage,
          sortBy: "id",
          sortDirection: "desc",
        }
      });

      if (!response.data || !Array.isArray(response.data.content)) {
        throw new Error("Invalid data format received from server");
      }

      console.log("API Response:", response.data);
      console.log("Single booking object:", response.data.content[0]);

      // Fetch user details for each booking
      const bookingsWithUserDetails = await Promise.all(
        response.data.content.map(async (booking, index) => {
          try {
            // Handle different possible field names for userId
            const userId = booking.userId || booking.user_id || booking.customerId;
            const bookingId = booking.bookingId || booking.id || booking.booking_id;
            
            if (!userId) {
              console.warn(`Booking ${bookingId} has no userId field`);
              return {
                ...booking,
                bookingId: bookingId,
                serialNumber: currentPage * itemsPerPage + index + 1,
                userName: 'N/A',
                userEmail: 'N/A',
                userPhone: 'N/A',
              };
            }

            const userResponse = await apiClient.get(`/users/${userId}`);
            
            return {
              ...booking,
              bookingId: bookingId,
              serialNumber: currentPage * itemsPerPage + index + 1,
              userName: userResponse.data.name,
              userEmail: userResponse.data.email,
              userPhone: userResponse.data.phoneNumber,
            };
          } catch (error) {
            console.error(`Error fetching user data for booking ${booking.bookingId || booking.id}:`, error);
            return {
              ...booking,
              bookingId: booking.bookingId || booking.id,
              serialNumber: currentPage * itemsPerPage + index + 1,
              userName: 'N/A',
              userEmail: 'N/A',
              userPhone: 'N/A',
            };
          }
        })
      );

      setData(bookingsWithUserDetails);
      setTotalItems(response.data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching booking data:", error);
      toast.error("Failed to fetch booking data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    fetchBookings();
  }, [currentPage, fetchBookings]);

  const handleView = (booking) => {
    const id = booking.bookingId || booking.id;
    if (id) {
      navigate(`${id}`);
    } else {
      toast.error("Invalid booking ID");
    }
  };

  // Filter data based on search query
  const filteredData = data.filter(booking => 
    booking.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="bg-gray-100 min-h-screen mt-6">
      <ToastContainer />
      <AllBookingsList
        data={filteredData}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loading={loading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        handleView={handleView}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

const AllBookingsList = ({
  data,
  searchQuery,
  setSearchQuery,
  loading,
  currentPage,
  setCurrentPage,
  totalPages,
  handleView,
  totalItems,
  itemsPerPage,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-indigo-900">All Bookings</h3>
        <input
          type="text"
          placeholder="Search by username or status..."
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-indigo-900 text-white">
            <tr>
              <th scope="col" className="px-6 py-3">Sr. No.</th>
              <th scope="col" className="px-6 py-3">Username</th>
              <th scope="col" className="px-6 py-3">Start Date</th>
              <th scope="col" className="px-6 py-3">End Date</th>
              {/* <th scope="col" className="px-6 py-3">Total Amount</th> */}
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-6">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-900"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No bookings found
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.bookingId || item.id || index} className={`border-b hover:bg-indigo-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4 font-medium">{item.serialNumber}</td>
                  <td className="px-6 py-4">{item.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.startDate ? new Date(item.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.endDate ? new Date(item.endDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }) : 'N/A'}
                  </td>
                  {/* <td className="px-6 py-4">
                    ₹{item.totalAmount ? Number(item.totalAmount).toFixed(2) : 'N/A'}
                  </td> */}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                      ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        item.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-indigo-100 text-indigo-800'}`}>
                      {item.status || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="px-3 py-1.5 flex items-center text-white bg-indigo-700 hover:bg-indigo-800 rounded-md transition-colors shadow-sm"
                      onClick={() => handleView(item)}
                    >
                      <FaEye className="mr-1.5" size={14} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-600">
          Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, totalItems)} of {totalItems} entries
        </p>
        <div className="flex space-x-1">
          <button
            className="px-3 py-1.5 text-sm text-white bg-indigo-800 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-700 bg-gray-200 rounded-md">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            className="px-3 py-1.5 text-sm rounded-md bg-indigo-800 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllBookings;