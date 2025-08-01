// Directory: src/app/credentials

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Eye, EyeOff } from "lucide-react";
import toast from 'react-hot-toast';

interface ToolField {
  name: string;
  label: string;
}

interface Tool {
  id: string;
  name: string;
  fields: ToolField[];
}

interface CredentialEntry {
  field_name: string;
  field_value: string;
}

export default function CredentialsManager() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [userId] = useState<string>("00000000-0000-0000-0000-000000000001"); // Updated to valid UUID
  const [showNewToolModal, setShowNewToolModal] = useState(false);
  const [newToolName, setNewToolName] = useState("");
  const [newFields, setNewFields] = useState<ToolField[]>([{ name: "", label: "" }]);
  const [message, setMessage] = useState("");
  const [newToolFields, setNewToolFields] = useState<ToolField[]>([{ name: "", label: "" }]);
  const [hiddenFields, setHiddenFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    axios.get("/api/tools/list").then((res) => setTools(res.data.tools));
  }, []);

  useEffect(() => {
    if (!selectedTool) return;

    axios
      .get("/api/credentials/get", {
        params: { user_id: userId, tool_id: selectedTool },
      })
      .then((res) => {
        setFormData(res.data);
        const newHidden: Record<string, boolean> = {};
        Object.keys(res.data).forEach((field) => {
          newHidden[field] = true; // 👈 hide all by default
        });
        setHiddenFields(newHidden);
      })
      .catch(() => {
        setFormData({});
      });
  }, [selectedTool]);


  const handleFieldChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!selectedTool) return;
    const tool = tools.find((t) => t.id === selectedTool);
    if (!tool) return;

    const credentials: CredentialEntry[] = tool.fields.map((f) => ({
      field_name: f.name,
      field_value: formData[f.name] || "",
    }));

    try {
      await axios.post("/api/credentials/store", {
        user_id: userId,
        tool_id: selectedTool,
        credentials,
      });
      setMessage("Credentials saved!");
      setTimeout(() => {
        setMessage("");
      }, 1000);
    } catch (err) {
      console.error("Failed to save credentials:", err);
      setMessage("Failed to save credentials.");
      setTimeout(() => {
        setMessage("");
      }, 1000);
    }
  };

  const handleAddField = () => {
    setNewFields([...newFields, { name: "", label: "" }]);
  };

  const handleCreateTool = async () => {
    if (!newToolName.trim()) {
      toast.error("Tool name is required.");
      return;
    }

    const validFields = newFields.filter(f => f.name.trim() && f.label.trim());
    if (validFields.length === 0) {
      toast.error("At least one valid field (with name and label) is required.");
      return;
    }

    const tool_id = uuidv4();
    try {
      await axios.post("/api/tools/create", {
        id: tool_id,
        user_id: userId,
        name: newToolName,
        fields: validFields,
      });

      setTools([...tools, { id: tool_id, name: newToolName, fields: validFields }]);
      setShowNewToolModal(false);
      setNewToolName("");
      setNewFields([{ name: "", label: "" }]);
    } catch (err) {
      console.error("Error creating tool:", err);
      toast.error("Failed to create tool. Check console for details.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-[#0d1117] text-white rounded-2xl shadow-xl border border-[#30363d]">
      <h2 className="text-2xl font-bold mb-6 text-white">Manage Credentials</h2>

      {/* TOOL SELECT */}
      <div className="mb-6">
        <label className="block font-semibold text-sm mb-1 text-slate-300">Select Tool</label>
        <select
          className="w-full bg-[#161b22] border border-[#30363d] text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
          value={selectedTool}
          onChange={(e) => setSelectedTool(e.target.value)}
        >
          <option value="">-- Select Tool --</option>
          {tools.map((tool) => (
            <option key={tool.id} value={tool.id}>
              {tool.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowNewToolModal(true)}
          className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm"
        >
          + Add New Tool
        </button>
      </div>

      {/* CREDENTIAL FIELDS */}
      {selectedTool && (
        <div className="space-y-4">
          {tools.find((tool) => tool.id === selectedTool)?.fields?.length ? (
            tools
              .find((tool) => tool.id === selectedTool)!
              .fields.map((field) => (
                <div key={field.name} className="relative">
                  <label className="block text-sm font-medium mb-1 text-slate-300">
                    {field.label}
                  </label>

                  <div className="relative">
                    <input
                      type={hiddenFields[field.name] ? "password" : "text"}
                      className="w-full bg-[#161b22] text-white border border-[#30363d] p-2 pr-10 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setHiddenFields((prev) => ({
                          ...prev,
                          [field.name]: !prev[field.name],
                        }))
                      }
                      className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      {hiddenFields[field.name] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-500 text-xs hover:text-rose-400"
                      onClick={async () => {
                        if (!confirm(`Delete field "${field.label}"?`)) return;
                        try {
                          await axios.delete("/api/tools/delete-field", {
                            data: { tool_id: selectedTool, field_name: field.name },
                          });
                          setTools((prev) =>
                            prev.map((t) =>
                              t.id === selectedTool
                                ? {
                                    ...t,
                                    fields: t.fields.filter((f) => f.name !== field.name),
                                  }
                                : t
                            )
                          );
                          setFormData((prev) => {
                            const updated = { ...prev };
                            delete updated[field.name];
                            return updated;
                          });
                          setHiddenFields((prev) => {
                            const updated = { ...prev };
                            delete updated[field.name];
                            return updated;
                          });
                          setMessage("Field deleted");
                          setTimeout(() => setMessage(""), 1000);
                        } catch (err) {
                          toast.error("Failed to delete field.");
                        }
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>

              ))
          ) : (
            <p className="text-slate-400 text-sm">No fields defined for this tool.</p>
          )}

          <button
            className="mt-4 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            💾 Save Credentials
          </button>

          {message && (
            <p className="text-green-400 mt-2 text-sm animate-pulse">
              {message}
            </p>
          )}
        </div>
      )}

      {/* ADD NEW FIELDS */}
      {selectedTool && (
        <div className="mt-8 border-t border-[#30363d] pt-4">
          <h4 className="font-semibold mb-4 text-slate-200">➕ Add New Fields</h4>

          {newToolFields.map((field, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Field Name"
                className="w-1/2 bg-[#161b22] text-white border border-[#30363d] p-2 rounded"
                value={field.name}
                onChange={(e) => {
                  const copy = [...newToolFields];
                  copy[index].name = e.target.value;
                  setNewToolFields(copy);
                }}
              />
              <input
                type="text"
                placeholder="Field Label"
                className="w-1/2 bg-[#161b22] text-white border border-[#30363d] p-2 rounded"
                value={field.label}
                onChange={(e) => {
                  const copy = [...newToolFields];
                  copy[index].label = e.target.value;
                  setNewToolFields(copy);
                }}
              />
            </div>
          ))}

          <button
            onClick={() => setNewToolFields([...newToolFields, { name: "", label: "" }])}
            className="text-indigo-400 text-sm hover:text-indigo-300"
          >
            + Add Field
          </button>

          <button
            className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded block"
            onClick={async () => {
              const validFields = newToolFields.filter((f) => f.name && f.label);
              if (validFields.length === 0) {
                toast.error("At least one valid field is required.");
                return;
              }

              try {
                await axios.post("/api/tools/add-fields", {
                  tool_id: selectedTool,
                  fields: validFields,
                });

                const updatedTools = tools.map((tool) =>
                  tool.id === selectedTool
                    ? { ...tool, fields: [...tool.fields, ...validFields] }
                    : tool
                );

                setTools(updatedTools);
                setNewToolFields([{ name: "", label: "" }]);
                setMessage("Fields added!");
                setTimeout(() => setMessage(""), 1000);
              } catch (err) {
                toast.error("Error adding fields.");
              }
            }}
          >
            ✅ Save Fields
          </button>
        </div>
      )}

      {/* DELETE TOOL */}
      {selectedTool && (
        <button
          className="mt-4 text-rose-500 hover:underline text-sm"
          onClick={async () => {
            const confirmDelete = confirm("Delete this tool and all its fields?");
            if (!confirmDelete) return;

            try {
              await axios.delete("/api/tools/delete", { data: { tool_id: selectedTool } });
              setTools((prev) => prev.filter((t) => t.id !== selectedTool));
              setSelectedTool("");
              setFormData({});
              setMessage("Tool deleted");
              setTimeout(() => setMessage(""), 1000);
            } catch (err) {
              toast.error("Error deleting tool");
            }
          }}
        >
          🗑 Delete Tool
        </button>
      )}

      {/* NEW TOOL MODAL */}
      {showNewToolModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#161b22] p-6 rounded-xl shadow-xl w-full max-w-md border border-[#30363d]">
            <h3 className="text-lg font-semibold mb-4 text-white">Add New Tool</h3>
            <input
              type="text"
              className="w-full bg-[#0d1117] border border-[#30363d] text-white p-2 mb-4 rounded"
              placeholder="Tool Name"
              value={newToolName}
              onChange={(e) => setNewToolName(e.target.value)}
            />

            {newFields.map((field, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Field Name"
                  className="w-1/2 bg-[#0d1117] text-white border border-[#30363d] p-2 rounded"
                  value={field.name}
                  onChange={(e) => {
                    const newList = [...newFields];
                    newList[index].name = e.target.value;
                    setNewFields(newList);
                  }}
                />
                <input
                  type="text"
                  placeholder="Field Label"
                  className="w-1/2 bg-[#0d1117] text-white border border-[#30363d] p-2 rounded"
                  value={field.label}
                  onChange={(e) => {
                    const newList = [...newFields];
                    newList[index].label = e.target.value;
                    setNewFields(newList);
                  }}
                />
              </div>
            ))}

            <button
              className="text-indigo-400 hover:text-indigo-300 text-sm mb-2"
              onClick={handleAddField}
            >
              + Add Field
            </button>

            <div className="flex gap-4 mt-4">
              <button
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded"
                onClick={handleCreateTool}
              >
                💾 Save Tool
              </button>
              <button
                className="text-slate-300 hover:underline"
                onClick={() => setShowNewToolModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
