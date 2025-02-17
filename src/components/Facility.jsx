import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, YAxis } from "recharts";

const API_URL = "http://localhost:4000"; // Backend API URL

const Facility = () => {
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [newFacility, setNewFacility] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchFacilities();
    fetchAllBookings();
  }, []);

  const fetchFacilities = async () => {
    try {
      const res = await axios.get(`${API_URL}/getfacilities`);
      setFacilities(res.data);
    } catch (error) {
      toast.error("Failed to load facilities");
    }
  };

  const fetchAllBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings`);
      setBookings(res.data);
    } catch (error) {
      toast.error("Failed to load bookings");
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`${API_URL}/update-booking-status`, { bookingId, status });
      toast.success(`Booking ${status}`);
      fetchAllBookings();
    } catch (error) {
      toast.error("Failed to update booking status");
    }
  };

  const addFacility = async () => {
    if (!newFacility.trim()) return toast.error("Enter a valid facility name!");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/addfacilities`, { name: newFacility });
      toast.success("Facility added!");
      setNewFacility("");
      fetchFacilities();
    } catch (error) {
      toast.error("Error adding facility");
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    return Array.from({ length: 13 }, (_, i) => ({
      time: 9 + i,
      status: "available",
    }));
  };

  const formatTimeSlots = (facilityBookings) => {
    let slots = generateTimeSlots();
    const filteredBookings = facilityBookings.filter((booking) => booking.date === selectedDate);

    filteredBookings.forEach((booking) => {
      let startHour = parseInt(booking.startTime.split(":")[0]);
      let endHour = parseInt(booking.endTime.split(":")[0]);

      slots = slots.map((slot) =>
        slot.time >= startHour && slot.time < endHour
          ? { ...slot, status: booking.status }
          : slot
      );
    });

    return slots;
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🏫 Facility Management</h2>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Enter facility name (e.g., Tennis Court)"
            value={newFacility}
            onChange={(e) => setNewFacility(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={addFacility}
            disabled={loading}
            className="mt-3 w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            {loading ? "Adding..." : "➕ Add Facility"}
          </button>
        </div>

        {facilities.length === 0 ? (
          <p className="text-gray-500 text-center">No facilities added yet.</p>
        ) : (
          facilities.map((facility) => {
            const facilityBookings = bookings.filter(
              (booking) => booking.facilityName === facility.name
            );

            return (
              <div key={facility._id} className="mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800">{facility.name}</h3>

                <div className="mt-4">
                  <label className="font-semibold text-gray-700">Select Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2 border rounded-lg mt-2"
                  />
                </div>

                <div className="mt-2">
                  <h4 className="text-md font-semibold text-gray-700">📋 Booking Requests:</h4>
                  {facilityBookings.length === 0 ? (
                    <p className="text-gray-500">No bookings yet.</p>
                  ) : (
                    facilityBookings
                      .filter((booking) => booking.date === selectedDate)
                      .map((booking) => (
                        <div key={booking._id} className="p-2 border rounded mt-2">
                          <p>
                            <span className="font-semibold">{booking.email}</span> -{" "}
                            {booking.date} ({booking.startTime} - {booking.endTime})
                          </p>
                          <p
                            className={
                              booking.status === "approved" ? "text-green-600" : "text-red-600"
                            }
                          >
                            {booking.status.toUpperCase()}
                          </p>
                          <div className="mt-2 flex gap-2">
                            <button
                              className="px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700"
                              onClick={() => updateBookingStatus(booking._id, "approved")}
                            >
                              Approve
                            </button>
                            <button
                              className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700"
                              onClick={() => updateBookingStatus(booking._id, "rejected")}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {selectedDate && facilityBookings.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-semibold text-gray-700">⏳ Booking Timeline:</h4>
                    <ResponsiveContainer width="100%" height={100}>
                      <LineChart data={formatTimeSlots(facilityBookings)}>
                        <XAxis
                          dataKey="time"
                          domain={[9, 21]}
                          type="number"
                          tickFormatter={(hour) => `${hour}:00`}
                          tick={{ fontSize: 14 }}
                        />
                        <YAxis hide domain={[0, 1]} />
                        <Tooltip formatter={(value, name, props) =>
                          props.payload.status === "approved" ? "Approved" : 
                          "Available"
                        } />
                        <Line
                          type="monotone"
                          dataKey="time"
                          stroke="gray"
                          strokeWidth={8}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="time"
                          stroke="green"
                          strokeWidth={8}
                          data={formatTimeSlots(facilityBookings).filter(slot => slot.status === "approved")}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Facility;
