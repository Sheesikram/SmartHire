"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

const DelUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState(""); // Debounced query
    const [showModal, setShowModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Debounce logic: Update `debouncedQuery` only after 500ms of no input changes
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 1500); // 500ms delay

        return () => clearTimeout(handler); // Clear previous timer on change
    }, [searchQuery]);

    const fetchUsers = async (pageNumber = 1, search = debouncedQuery) => {
        try {
            setLoading(true); // Show loader during fetch
            const response = await axios.get(
                `http://localhost:3001/all_users/?page=${pageNumber}&email=${search}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const total_pages = Math.ceil(response.data.count / 10);

            // Update state with response data
            setUsers(response.data.results);
            setTotalPages(total_pages);
            setTotalCount(response.data.count);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch users: " + err.message);
            setLoading(false);
        }
    };

    // Trigger fetch on `debouncedQuery` or `page` change
    useEffect(() => {
        fetchUsers(page, debouncedQuery);
    }, [page, debouncedQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value); // Update the search query
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            setPage(1); // Reset to page 1 when pressing Enter
            setDebouncedQuery(searchQuery); // Trigger fetch immediately
        }
    };

    const handleSearchClick = () => {
        setPage(1); // Reset to page 1 when clicking Search
        setDebouncedQuery(searchQuery); // Trigger fetch immediately
    };

    const deleteUser = async () => {
        try {
            await axios.delete(`http://localhost:3001/users/${userToDelete.id}/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setShowModal(false);
            fetchUsers(page); // Refresh user list after deletion
        } catch (err) {
            setError("Error deleting user: " + err.message);
        }
    };

    const openModal = (user) => {
        setUserToDelete(user);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setUserToDelete(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-lg text-gray-600">
                <div className="animate-spin border-4 border-t-4 border-gray-300 rounded-full w-12 h-12"></div>
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 text-sm">
                <span>{`Error: ${error}`}</span>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl text-center font-semibold text-gray-800">Delete Users</h1>

            <div className="mt-6 flex justify-center items-center space-x-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown} // Handle Enter key
                    placeholder="Search by |email"
                    className="px-4 py-2 text-sm border rounded-lg shadow-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    onClick={handleSearchClick} // Handle Search button click
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition"
                >
                    Search
                </button>
            </div>

            <table className="w-full table-auto mt-6 border-collapse">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 text-sm text-left text-gray-600">ID</th>
                        <th className="px-4 py-2 text-sm text-left text-gray-600">Email</th>
                        <th className="px-4 py-2 text-sm text-left text-gray-600">Role</th>
                        <th className="px-4 py-2 text-sm text-center text-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b">
                            <td className="px-4 py-2 text-sm text-gray-700">{user.id}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{user.email}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{user.role}</td>
                            <td className="px-4 py-2 text-sm text-center">
                                <button
                                    onClick={() => openModal(user)}
                                    className="bg-red-500 text-white px-4 py-2 text-xs rounded-md transition duration-200 hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className={`px-4 py-2 rounded-lg ${
                        page <= 1
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                    Previous
                </button>
                <span className="text-gray-700 text-sm">{`Page ${page} of ${totalPages}`}</span>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className={`px-4 py-2 rounded-lg ${
                        page >= totalPages
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                    Next
                </button>
            </div>

            {/* Modal for Confirm Deletion */}
            {showModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h3 className="text-lg font-semibold text-gray-800">Confirm Deletion</h3>
                        <p className="text-sm text-gray-600 mt-2">Are you sure you want to delete this user?</p>
                        <div className="flex justify-end mt-4 space-x-2">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteUser}
                                className="px-4 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DelUsers;
