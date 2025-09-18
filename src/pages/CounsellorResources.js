import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [studentId, setStudentId] = useState("");
  const [category, setCategory] = useState(""); 
  const [type, setType] = useState("");
  const [editing, setEditing] = useState(null);

  // Replace this with real role fetch later
  const [userRole] = useState("counsellor");

  // Fetch resources
  const fetchResources = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "resources"));
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setResources(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const studentAnalysis = {
    "stu1": "Anxiety",
    "stu2": "Exam Stress",
    "stu3": "Sleep Issues",
  };

  // Auto-fill category when student selected
  useEffect(() => {
    if (studentId) {
      setCategory(studentAnalysis[studentId] || "");
    }
  }, [studentId]);

  //Add resource
  const handleAddResource = async () => {
    if (!title || !description || !studentId || !type) {
      alert("Please fill all required fields.");
      return;
    }
    try {
      const resource = {
        title,
        description,
        link,
        studentId,
        category,
        type,
        addedBy: auth.currentUser?.uid || "unknown",
        createdAt: new Date(),
      };
      await addDoc(collection(db, "resources"), resource);
      alert("Resource added!");
      resetForm();
      fetchResources();
    } catch (error) {
      console.error("Error adding resource:", error);
    }
  };

  //Update resource
  const handleUpdateResource = async () => {
    if (!editing) return;
    try {
      const resourceDoc = doc(db, "resources", editing.id);
      await updateDoc(resourceDoc, {
        title,
        description,
        link,
        studentId,
        category,
        type,
      });
      alert("Resource updated!");
      resetForm();
      fetchResources();
    } catch (error) {
      console.error("Error updating resource:", error);
    }
  };

  // Delete resource
  const handleDeleteResource = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await deleteDoc(doc(db, "resources", id));
      alert("Resource deleted!");
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  // Enter edit mode
  const startEditing = (res) => {
    setEditing(res);
    setTitle(res.title);
    setDescription(res.description);
    setLink(res.link || "");
    setStudentId(res.studentId || "");
    setCategory(res.category || "");
    setType(res.type || "");
  };

  //Reset form
  const resetForm = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setLink("");
    setStudentId("");
    setCategory("");
    setType("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Resources</h2>

      {/* Form for counsellors only */}
      {userRole === "counsellor" && (
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
            marginBottom: "20px",
            maxWidth: "600px",
          }}
        >
          <h3>{editing ? "Edit Resource" : "Add New Resource"}</h3>

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px" }}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px" }}
          />
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px" }}
          >
            <option value="">-- Select Student --</option>
            <option value="stu1">Student 1</option>
            <option value="stu2">Student 2</option>
            <option value="stu3">Student 3</option>
          </select>
          <input
            type="text"
            placeholder="Category (auto)"
            value={category}
            readOnly
            style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px", background: "#f0f0f0" }}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px" }}
          >
            <option value="">-- Select Type --</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
          </select>
          <input
            type="text"
            placeholder="Resource Link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            style={{ display: "block", marginBottom: "10px", width: "100%", padding: "8px" }}
          />
          <button
            onClick={editing ? handleUpdateResource : handleAddResource}
            style={{
              background: "#28a745",
              color: "white",
              padding: "10px 15px",
              border: "none",
              borderRadius: "5px",
              marginRight: "10px",
            }}
          >
            {editing ? "Update Resource" : "Add Resource"}
          </button>
          {editing && (
            <button onClick={resetForm} style={{ padding: "10px 15px" }}>
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Resource List */}
      {loading ? (
        <p>Loading resources...</p>
      ) : resources.length === 0 ? (
        <p>No resources found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <thead style={{ background: "#f5f5f5" }}>
            <tr>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Title</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Description</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Student</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Category</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Type</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Link</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((res) => (
              <tr key={res.id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{res.title}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{res.description}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{res.studentId}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{res.category}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{res.type}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {res.link && (
                    <a href={res.link} target="_blank" rel="noopener noreferrer">
                      Open
                    </a>
                  )}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <button
                    onClick={() => startEditing(res)}
                    style={{ marginRight: "10px" }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteResource(res.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Resources;
