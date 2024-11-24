"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/app/others/loader";
import { FaBuilding, FaMapMarkerAlt, FaClipboardList, FaClock, FaArrowLeft, FaCheckCircle, FaFlag } from "react-icons/fa";
import { MdOutlineWork } from "react-icons/md";

const Job = ({ params }) => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false); // State for the modal visibility
    const [jobToReport, setJobToReport] = useState(null); // Store the job ID to report

    // Fetch job details
    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:3001/get_jobs/${params.id}`, { withCredentials: true });
                setJob(response.data);
            } catch (err) {
                setError(err.response?.data?.error || "Failed to fetch job details.");
            } finally {
                setLoading(false);
            }
        };

        fetchJobDetails();
    }, [params.id]);

    const reportJob = async (jobId) => {
        try {
            const response = await axios.post('http://127.0.0.1:3001/report/', { job_id: jobId }, { withCredentials: true });
            setShowModal(false); // Close modal after reporting
        } catch (err) {
            console.error("Error reporting job:", err);
        }
    };

    const handleReportClick = (jobId) => {
        setJobToReport(jobId);
        setShowModal(true); // Show the modal when report button is clicked
    };

    const handleCancel = () => {
        setShowModal(false); // Close the modal if user cancels
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 mt-12 bg-gray-50" style={{ backgroundColor: "#F4F2EE" }}>
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-6 sm:p-8 border border-gray-200">
                <h1 className="text-4xl font-extrabold text-[#0073b1] mb-6 ">{job.job_name}</h1>

                {/* Job Details Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div className="flex items-center space-x-4 text-gray-700">
                        <FaBuilding className="text-[#0073b1] h-6 w-6" />
                        <p className="font-medium break-words max-w-full">
                            Company: <span className="text-gray-800">{job.company_name}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-700">
                        <FaMapMarkerAlt className="text-red-500 h-6 w-6" />
                        <p className="font-medium break-words max-w-full">
                            Location: <span className="text-gray-800">{job.job_location}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-700">
                        <MdOutlineWork className="text-green-600 h-6 w-6" />
                        <p className="font-medium break-words max-w-full">
                            Workplace Type: <span className="text-gray-800">{job.workplace_type}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-700">
                        <FaClipboardList className="text-yellow-600 h-6 w-6" />
                        <p className="font-medium break-words max-w-full">
                            Employment Type: <span className="text-gray-800">{job.employment_type}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-700">
                        <FaClock className="text-[#0073b1] h-6 w-6" />
                        <p className="font-medium break-words max-w-full">
                            Posted On: <span className="text-gray-800">{new Date(job.created_at).toLocaleDateString()}</span>
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-700">
                        <FaClock className="text-gray-500 h-6 w-6" />
                        <p className="font-medium break-words max-w-full">
                            Last Updated: <span className="text-gray-800">{new Date(job.updated_at).toLocaleDateString()}</span>
                        </p>
                    </div>
                </div>


                {/* Job Description */}
                <div className="border-t border-gray-200 pt-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Job Description</h2>
                    <p className="text-gray-700 leading-relaxed break-words">{job.description}</p>
                </div>

                {/* Required Skills */}
                <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Required Skills</h2>
                    <ul className="list-disc pl-5 text-gray-700">
                        {job.skills.split(",").map((skill, index) => (
                            <li key={index} className="py-1 font-medium">
                                {skill.trim()}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto px-6 py-3 bg-[#0073b1] text-white font-semibold rounded-lg shadow-md transition-colors duration-300 hover:bg-[#005f8c]"
                    >
                        <FaArrowLeft className="mr-2 inline-block" /> Back to Jobs
                    </button>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center sm:justify-start">
                        <button
                            onClick={() => alert("Apply Now functionality to be implemented")}
                            className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 hover:bg-green-600"
                        >
                            Apply <FaCheckCircle className="ml-2 inline-block" />
                        </button>
                        <button
                            onClick={() => handleReportClick(job.id)}  // Show modal for reporting the job
                            className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md transition-colors duration-300 hover:bg-red-600"
                        >
                            Report <FaFlag className="ml-2 inline-block" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Are you sure you want to report this job?</h2>
                        <div className="flex justify-between">
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2 bg-gray-400 text-white font-semibold rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => reportJob(jobToReport)}  // Report the job
                                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg"
                            >
                                Yes, Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Job;
