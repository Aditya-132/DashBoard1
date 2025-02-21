import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cheaters = () => {
  const [cheaters, setCheaters] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    reason: "",
    reportedBy: "",
    proof: null,
  });
  const [selectedProof, setSelectedProof] = useState(null);
  const API_URL = "http://localhost:4000";

  // 📌 Fetch all cheaters
  useEffect(() => {
    axios.get(`${API_URL}/allChe`)
      .then(res => setCheaters(res.data.cheaters))
      .catch(err => console.error("Error fetching cheaters:", err));
  }, []);

  // 📌 Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 📌 Handle file upload
  const handleFileChange = (e) => {
    setFormData({ ...formData, proof: e.target.files[0] });
  };

  // 📌 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, studentId, reason, reportedBy, proof } = formData;

    if (!name || !studentId || !reason || !reportedBy || !proof) {
      toast.error("All fields are required!");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", name);
    formDataToSend.append("studentId", studentId);
    formDataToSend.append("reason", reason);
    formDataToSend.append("reportedBy", reportedBy);
    formDataToSend.append("proof", proof);

    try {
      await axios.post(`${API_URL}/addChe`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Cheater reported successfully!");
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Error adding cheater:", error);
      toast.error("Failed to add cheater!");
    }
  };

  return (
    <div className="p-6">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-4">Report a Cheater</h2>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <input type="text" name="name" placeholder="Name" className="w-full p-2 border rounded" onChange={handleChange} />
        <input type="text" name="studentId" placeholder="Student ID" className="w-full p-2 border rounded" onChange={handleChange} />
        <input type="text" name="reportedBy" placeholder="Reported By" className="w-full p-2 border rounded" onChange={handleChange} />
        <textarea name="reason" placeholder="Reason" className="w-full p-2 border rounded" onChange={handleChange}></textarea>
        <input type="file" className="w-full p-2 border rounded" onChange={handleFileChange} />
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Report</button>
      </form>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Cheaters List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Student ID</th>
              <th className="p-2">Reason</th>
              <th className="p-2">Reported By</th>
              <th className="p-2">Proof</th>
            </tr>
          </thead>
          <tbody>
            {cheaters.length > 0 ? (
              cheaters.map((cheater) => (
                <tr key={cheater._id} className="border-t">
                  <td className="p-2">{cheater.name}</td>
                  <td className="p-2">{cheater.studentId}</td>
                  <td className="p-2">{cheater.reason}</td>
                  <td className="p-2">{cheater.reportedBy}</td>
                  <td className="p-2">
                    <button 
                      onClick={() => setSelectedProof(cheater.proof)}
                      className="text-blue-500 underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4">No cheaters reported yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📌 Display proof in an iframe */}
      {selectedProof && (
        <div className="mt-6 p-4 bg-gray-100 rounded shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Proof Preview</h3>
          <button
            onClick={() => setSelectedProof(null)}
            className="text-red-600 text-sm mb-2"
          >
            Close
          </button>
          <iframe
            src={selectedProof}
            className="w-full h-[500px] border rounded"
            title="Proof Preview"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default Cheaters;
