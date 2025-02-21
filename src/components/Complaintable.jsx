import { useState, useEffect } from "react";
import axios from "axios";

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [adminVotes, setAdminVotes] = useState({});
  const [selectedMedia, setSelectedMedia] = useState(null);

  const API_URL = "http://localhost:4000";

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/comall`);
        setComplaints(data.complaints);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    };
    fetchComplaints();
  }, []);

  const updateStatus = async (_id, newStatus) => {
    try {
      await axios.put(`${API_URL}/comstatus/${_id}`, { status: newStatus });

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint._id === _id ? { ...complaint, status: newStatus } : complaint
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const voteComplaint = async (_id) => {
    if (adminVotes[_id]) {
      alert("You have already voted for this complaint!");
      return;
    }

    try {
      await axios.post(`${API_URL}/votcom/${_id}`);
      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint._id === _id ? { ...complaint, adminVotes: complaint.adminVotes + 1 } : complaint
        )
      );
      setAdminVotes({ ...adminVotes, [_id]: true });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const deleteComplaint = async (studentEmail, createdAt) => {
    try {
      await axios.delete(`${API_URL}/comdelete`, { data: { studentEmail, createdAt } });
      setComplaints((prev) => prev.filter((complaint) => !(complaint.studentEmail === studentEmail && complaint.createdAt === createdAt)));
    } catch (error) {
      console.error("Error deleting complaint:", error);
    }
  };

  return (
    <div className="container mx-auto mt-6 p-4 bg-black text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Complaint Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-700">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border p-2">Description</th>
              <th className="border p-2">Student Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Votes</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Media</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length > 0 ? (
              complaints.map((complaint) => (
                <tr key={`${complaint.studentEmail}-${complaint.createdAt}`} className="text-center border border-gray-700">
                  <td className="border p-2">{complaint.description}</td>
                  <td className="border p-2">{complaint.studentName}</td>
                  <td className="border p-2">{complaint.studentEmail}</td>
                  <td className="border p-2">{complaint.adminVotes}</td>
                  <td className="border p-2">
                    <select
                      className="p-1 bg-gray-700 text-white rounded"
                      value={complaint.status}
                      onChange={(e) => updateStatus(complaint._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="border p-2">
                    {complaint.media.length > 0 ? (
                      <button
                        onClick={() => setSelectedMedia(complaint.media[0])}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                      >
                        View
                      </button>
                    ) : (
                      <span>No Media</span>
                    )}
                  </td>
                  <td className="border p-2 flex justify-center space-x-2">
                    <button
                      onClick={() => voteComplaint(complaint._id)}
                      className={`p-2 rounded ${
                        adminVotes[complaint._id] ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
                      } text-white`}
                      disabled={adminVotes[complaint._id]}
                    >
                      Vote
                    </button>

                    <button
                      onClick={() => deleteComplaint(complaint.studentEmail, complaint.createdAt)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-4 text-center">No Complaints Found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Media View Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-lg">
            <h3 className="text-lg font-semibold mb-4 text-white">Complaint Media</h3>
            <iframe
              src={selectedMedia}
              className="w-full h-64 rounded-lg border-2 border-gray-600"
              title="Complaint Media"
            />
            <button
              onClick={() => setSelectedMedia(null)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;
