import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Elections = () => {
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState("");
  const [loading, setLoading] = useState(false);
  const yy = "http://localhost:4000";

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${yy}/api/v1/candidates`);
      setCandidates(response.data.candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async () => {
    if (!newCandidate.trim()) return;
    try {
      setLoading(true);
      const response = await axios.post(`${yy}/api/v1/candidate`, { name: newCandidate });
      setCandidates([...candidates, response.data.candidate]);
      setNewCandidate("");
    } catch (error) {
      console.error("Error adding candidate:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCandidate = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${yy}/api/v1/cc/${id}`); // Match this with the backend route
      setCandidates(candidates.filter(candidate => candidate._id !== id));
    } catch (error) {
      console.error("Error removing candidate:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Elections</h1>

      <div className="mb-6">
        <input
          type="text"
          value={newCandidate}
          onChange={(e) => setNewCandidate(e.target.value)}
          placeholder="Enter candidate name"
          className="border rounded-lg p-2 w-full mb-2"
        />
        <button
          onClick={handleAddCandidate}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Add Candidate
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Candidates</h2>
        {loading ? (
          <p>Loading...</p>
        ) : candidates.length > 0 ? (
          <ul>
            {candidates.map((candidate) => (
              <li
                key={candidate._id}
                className="flex justify-between items-center bg-white p-4 rounded-lg mb-2 shadow-sm"
              >
                <div>
                  <p className="font-medium text-lg">{candidate.name}</p>
                  <p className="text-gray-600">Votes: {candidate.votes}</p>
                </div>
                <button
                  onClick={() => handleRemoveCandidate(candidate._id)}
                  disabled={loading}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  Remove Candidate
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No candidates available.</p>
        )}
      </div>
    </div>
  );
};

export default Elections;
