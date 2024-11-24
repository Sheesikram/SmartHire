"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { SearchBar } from "../others/search";
import { useDispatch, useSelector } from "react-redux";
import { admin_search_bar_action } from "@/Redux/Action";
import { FaBuilding, FaMapMarkerAlt, FaClipboardList, FaClock, FaArrowLeft, FaCheckCircle, FaFlag } from "react-icons/fa";
import { MdOutlineWork } from "react-icons/md";

const ReportedJobs = () => {
    const [reportedJobs, setReportedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [debouncedQuery, setDebouncedQuery] = useState(""); // Debounced query
    const [showModal, setShowModal] = useState(false);
    const searchQuery = useSelector((state) => state.admin_search_bar_reducer);
    const dispatch = useDispatch();
    const [jobToDelete, setJobToDelete] = useState(null);
    const [reportId, setReportId] = useState(null);
    // Debounce logic
    const fetchReportedJobs = async (pageNumber = 1, search = searchQuery) => {
        try {
            setLoading(true); // Start loading
            setError(null); // Reset any previous errors
    
            const response = await axios.get(
                `http://127.0.0.1:3001/load_reports/?page=${pageNumber}&title=${search}`,
                { withCredentials: true }
            );
    
            // Handle both backend response structures
            const reportedJobs = Array.isArray(response.data?.results?.reported_jobs)
                ? response.data.results.reported_jobs // When jobs are nested in "results"
                : Array.isArray(response.data?.reported_jobs)
                ? response.data.reported_jobs // When jobs are directly in the response
                : []; // Default to an empty array if neither is present
    
            const total_count = response.data?.count || 0; // Default to 0 if not provided
            const total_pages = Math.ceil(total_count / 10); // Calculate total pages
    
            // Update state with response data
            setReportedJobs(reportedJobs);
            setTotalPages(total_pages);
            setTotalCount(total_count);
        } catch (err) {
            setError("Failed to fetch reported jobs: " + err.message);
        } finally {
            setLoading(false); // Stop loading
        }
    };
    
    
    

    
    useEffect(() => {
        fetchReportedJobs(page, searchQuery);
    }, [page]);

    useEffect(() => {
        fetchReportedJobs(1, searchQuery);
        setPage(1);
    }, [searchQuery]);

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            setPage(1);
            setDebouncedQuery(searchQuery);
        }
    };

    const handleSearchClick = () => {
        setPage(1);
        setDebouncedQuery(searchQuery);
    };

    const deleteJob = async () => {
        try {
            await axios.delete(`http://127.0.0.1:3001/delete_job_report/${jobToDelete.job_id}/`, { withCredentials: true });
            setShowModal(false);
            fetchReportedJobs(page);
        } catch (err) {
            setError("Error deleting reported job: " + err.message);
        }
    };

    const ignoreReport = async () => {
        try {
            closeModal();
            await axios.delete(`http://127.0.0.1:3001/delete_report/${reportId}/`, { withCredentials: true });
            setShowModal(false);
            fetchReportedJobs(page);
        } catch (err) {
            setError("Error ignoring report: " + err.message);
        }
    };

    const openModal = (job, reportId) => {
        setJobToDelete(job);
        setReportId(reportId); // Set the report ID for ignoring reports
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setJobToDelete(null);
        setReportId(null);
    };

    return (
        <div className="pt-8 pe-4 pl-4 md:p-12 rounded-3xl mx-auto mt-12" style={{ backgroundColor: "#F4F2EE" }}>
            {/* Search Bar */}
            <SearchBar></SearchBar>

            {/* Reported Jobs Table */}
            <div className="overflow-x-auto shadow-lg sm:rounded-2xl bg-white">
                <table className="w-full table-auto mb-10 border-collapse">
                    <thead className="bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 text-black">
                        <tr>
                            <th className="px-6 py-4 text-base text-left font-medium">ID</th>
                            <th className="px-6 py-4 text-base text-left font-medium">Job Name</th>
                            <th className="px-6 py-4 text-base text-left font-medium">Job Location</th>
                            <th className="px-6 py-4 text-base text-left font-medium">Skills</th>
                            <th className="px-6 py-4 text-base text-center font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportedJobs.map((job) => (
                            <tr key={job.id} className="border-b border-gray-200 hover:bg-blue-50 transition duration-300 transform hover:scale-102">
                                <td className="px-6 py-4 text-base text-black-600">{job.id}</td>
                                <td className="px-6 py-4 text-base text-black-600 max-w-[40ch] truncate">{job.job_name}</td>
                                <td className="px-6 py-4 text-base text-black-600 max-w-[20ch] truncate">{job.job_id}</td>
                                <td className="px-6 py-4 text-base text-black-600">{job.skills}</td>
                                <td className="px-6 py-4 text-base text-center">
                                    <button
                                        onClick={() => openModal(job, job.job_id)}
                                        className="px-6 py-3 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 transform hover:scale-105"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-8 mb-12 mt-12">
                <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className={`px-6 py-3 rounded-lg ${page <= 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                    Previous
                </button>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className={`px-6 py-3 rounded-lg ${page >= totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                    Next
                </button>
            </div>

            {/* Modal for Confirm Deletion */}
            {showModal && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 transition-opacity duration-200">
                    {/* Modal Content Wrapper */}
                    <div className="w-full max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-6 sm:p-8 border border-gray-200 max-h-[90vh] flex flex-col">

                        {/* Modal Header */}
                        <h1 className="text-4xl font-extrabold text-[#0073b1] mb-6">{jobToDelete.job_name}</h1>

                        {/* Modal Content Section */}
                        <div className="flex-1 overflow-y-auto mb-8">
                            {/* Job Details Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                <div className="flex items-center space-x-4 text-gray-700">
                                    <FaBuilding className="text-[#0073b1] h-6 w-6" />
                                    <p className="font-medium break-words max-w-full">
                                        Company: <span className="text-gray-800 ">{jobToDelete.company_name}</span>
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4 text-gray-700">
                                    <FaMapMarkerAlt className="text-red-500 h-6 w-6 flex-shrink-0" />
                                    <p className="font-medium break-words max-w-full overflow-x-auto">
                                        Location: <span className="text-gray-800">{jobToDelete.job_location}</span>
                                    </p>
                                </div>

                                <div className="flex items-center space-x-4 text-gray-700">
                                    <MdOutlineWork className="text-green-600 h-6 w-6" />
                                    <p className="font-medium break-words max-w-full">
                                        Workplace Type: <span className="text-gray-800">{jobToDelete.workplace_type}</span>
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4 text-gray-700">
                                    <FaClipboardList className="text-yellow-600 h-6 w-6" />
                                    <p className="font-medium break-words max-w-full">
                                        Employment Type: <span className="text-gray-800">{jobToDelete.employment_type}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Job Description */}
                            <div className="border-t border-gray-200 pt-6 mb-6">
                                <h2 className="text-2xl font-bold text-gray-700 mb-4">Job Description</h2>
                                <p className="text-gray-700 leading-relaxed break-words overflow-x-auto">{jobToDelete.description}</p>
                            </div>


                            {/* Required Skills */}
                            <div className="border-t border-gray-200 pt-6 mb-6">
                                <h2 className="text-2xl font-bold text-gray-700 mb-4">Required Skills</h2>
                                <ul className="list-disc pl-5 text-gray-700">
                                    {jobToDelete.skills.split(",").map((skill, index) => (
                                        <li key={index} className="py-1 font-medium">
                                            {skill.trim()}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="mt-auto flex justify-end space-x-4 mb-6">
                            <button
                                onClick={ignoreReport}
                                className="text-base sm:text-lg font-semibold text-gray-700 bg-gray-200 rounded-md px-4 sm:px-6 py-2 sm:py-3 hover:bg-gray-300 transition"
                            >
                                Ignore Report
                            </button>
                            <button
                                onClick={deleteJob}
                                className="text-base sm:text-lg font-semibold text-white bg-red-600 rounded-md px-4 sm:px-6 py-2 sm:py-3 hover:bg-red-700 transition"
                            >
                                Confirm Delete
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default ReportedJobs;
