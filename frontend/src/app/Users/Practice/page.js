"use client"
import React from 'react';
import { show_search,search_bar_action } from "@/Redux/Action";
import { useDispatch, useSelector } from 'react-redux';

const Practice = () => {
    const role = useSelector((state) => state.Role_Reducer);
    const dispatch = useDispatch();
    dispatch(show_search(false));
    dispatch(search_bar_action(""));
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <h1 style={{ fontSize: "48px", fontWeight: "bold" }}>
                Practice Page
            </h1>
        </div>
    );
};

export default Practice;