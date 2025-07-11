import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import apiClient from "../../api/apiConfig";

const PickUpTariffPlan = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    vehicleCategoryId: "",
    periodType: "Hours",
    periodValue: "",
    price: "",
    deposit: "",
  });
  const [loading, setLoading] = useState(true);
  const [category, setCategories] = useState([]);
  const [itemsPerPage] = useState(10); // Changed to 7 records per page
  const [totalItems, setTotalItems] = useState(0);

  const fetchPickUpTariffPrices = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/package/all", {
        params: {
          page: currentPage,
          size: itemsPerPage,
          // sortBy: "id", // Default sort field
          sortBy: "createdAt",
          sortDirection: "DESC", // Default sort direction
        },
      });

      if (response.data) {
        setData(response.data.content || []);
        setTotalItems(response.data.totalElements || 0);
      } else {
        console.error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching price data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickUpTariffPrices();
    fetchCategory();
  }, [currentPage]); // Add currentPage as a dependency

  const fetchCategory = async () => {
    try {
      const response = await apiClient.get("/category/all");
      setCategories(response.data.content);
    } catch (error) {
      console.error("Error fetching category data:", error);
    }
  };

  const handleAddPrice = (e) => {
    e.preventDefault();
    const payload = {
      vehicleCategoryId: formData.vehicleCategoryId,
      price: formData.price,
      deposit: formData.deposit,
      hours: formData.periodType === "Hours" ? Number(formData.periodValue) : 0,
      days: formData.periodType === "Days" ? Number(formData.periodValue) : 0,
    };
    apiClient
      .post("/package/add", payload)
      .then(() => {
        fetchPickUpTariffPrices();
        resetForm();
      })
      .catch((error) => console.error("Error adding package data", error));
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const payload = {
      vehicleCategoryId: formData.vehicleCategoryId,
      price: formData.price,
      deposit: formData.deposit,
      hours: formData.periodType === "Hours" ? Number(formData.periodValue) : 0,
      days: formData.periodType === "Days" ? Number(formData.periodValue) : 0,
    };
    apiClient
      .put(`/package/${editingId}`, payload)
      .then(() => {
        fetchPickUpTariffPrices();
        resetForm();
      })
      .catch((error) => console.error("Error saving data:", error));
  };

  const handleEditTariffPlan = (pickuptariffplan) => {
    setEditingId(pickuptariffplan.id);
    setFormData({
      vehicleCategoryId: pickuptariffplan.vehicleCategoryId,
      periodType: pickuptariffplan.hours ? "Hours" : "Days",
      periodValue: pickuptariffplan.hours || pickuptariffplan.days,
      price: pickuptariffplan.price,
      deposit: pickuptariffplan.deposit,
    });
    setFormVisible(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      await apiClient.put(`/package/toggle/${id}`);
      toast.success("Status updated successfully");
      fetchPickUpTariffPrices();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      vehicleCategoryId: "",
      periodType: "Hours",
      periodValue: "",
      price: "",
      deposit: "",
    });
    setFormVisible(false);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="bg-gray-100 min-h-screen">
      {formVisible ? (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-4 md:text-xl">
            {editingId ? "Edit PickUpTariffPlan" : "Add New PickUpTariffPlan"}
          </h2>
          <form onSubmit={editingId ? handleSaveEdit : handleAddPrice}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1">
                <label className="block mb-2 font-medium">
                  Select Category *
                </label>
                <select
                  name="vehicleCategoryId"
                  className="border p-2 rounded w-full"
                  value={formData.vehicleCategoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleCategoryId: e.target.value,
                    })
                  }
                >
                  <option value="">Select Category</option>
                  {category?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">
                  Select Period Type *
                </label>
                <select
                  name="periodType"
                  className="border p-2 rounded w-full"
                  value={formData.periodType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      periodType: e.target.value,
                    })
                  }
                >
                  <option value="Hours">Hours</option>
                  <option value="Days">Days</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">
                  {formData.periodType}
                </label>
                <input
                  type="number"
                  name="periodValue"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={formData.periodValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      periodValue: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Amount</label>
                <input
                  type="number"
                  name="price"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="col-span-1">
                <label className="block mb-2 font-medium">Deposit Amount</label>
                <input
                  type="number"
                  name="deposit"
                  className="w-full border border-gray-300 p-2 rounded"
                  value={formData.deposit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deposit: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="px-4 py-2 mr-2 text-white bg-indigo-900 rounded hover:bg-indigo-600"
              >
                {editingId ? "Save" : "Add"}
              </button>
              <button
                type="button"
                className="ml-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-indigo-900">
              All Price List
            </h3>
            {/* <div className="flex justify-between items-center mt-4 mb-4"> */}
            {/* <h1 className="text-2xl font-bold text-gray-800">All Price List</h1> */}
            {!formVisible && (
              <button
                onClick={() => setFormVisible(true)}
                className="px-4 py-2 bg-indigo-900 text-white rounded hover:bg-indigo-600"
              >
                + Add Price
              </button>
            )}
            {/* </div> */}
            <input
              type="text"
              placeholder="Search By Vehicle Category..."
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative overflow-x-auto shadow-md rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-indigo-900 text-white">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Vehicle Category Name
                  </th>
                  {/* <th scope="col" className="px-6 py-3">Hours</th> */}
                  <th scope="col" className="px-6 py-3">
                    Days
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Deposit
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Action
                  </th>
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
                    <td colSpan="7" className="text-center py-4">
                      No data found
                    </td>
                  </tr>
                ) : (
                  data?.map((pickuptariffplan, index) => (
                    <tr
                      key={pickuptariffplan.id}
                      className={`border-b hover:bg-indigo-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 font-medium">
                        {currentPage * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        {pickuptariffplan?.vehicleCategory}
                      </td>
                      {/* <td className="px-6 py-4">{pickuptariffplan?.hours}</td> */}
                      <td className="px-6 py-4">{pickuptariffplan?.days}</td>
                      <td className="px-6 py-4">{pickuptariffplan?.price}</td>
                      <td className="px-6 py-4">{pickuptariffplan?.deposit}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            className="px-3 py-1.5 flex items-center text-white bg-indigo-800 hover:bg-indigo-600 rounded"
                            onClick={() =>
                              handleEditTariffPlan(pickuptariffplan)
                            }
                          >
                            <FaEdit className="mr-1.5" size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(pickuptariffplan.id)
                            }
                            className={`px-3 py-1.5 rounded text-white ${
                              pickuptariffplan.active
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            {pickuptariffplan.active ? "Active" : "Inactive"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-600">
              Showing {currentPage * itemsPerPage + 1} to{" "}
              {Math.min((currentPage + 1) * itemsPerPage, totalItems)} of{" "}
              {totalItems} entries
            </p>
            <div className="flex space-x-1">
              <button
                className="px-3 py-1.5 text-sm text-white bg-indigo-800 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md">
                {" "}
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                className="px-3 py-1.5 text-sm text-white bg-indigo-800 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickUpTariffPlan;
